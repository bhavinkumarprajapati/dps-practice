# Solution 07: Expense Tracker

## How to approach it (what to say out loud)

1. **Task 1:** *"New column, so: model → delete the DB file → schema with `Literal` so Pydantic rejects unknown values →
   seed data → check in `/docs` → form select → table column."*
2. **Task 2:** *"The summary is an aggregation over all rows, so it belongs in the backend. Specific routes like `/summary`
   go above parameter routes like `/{expense_id}`, because FastAPI matches top to bottom. In React, I simply re-fetch the
   summary after each change. That's simpler and always correct, and the cost is one extra request."*
3. **Task 3:** *"PUT replaces the whole resource, and the form always sends every field, so PUT fits. The 'currently
   editing' expense lives in `App`; the form reacts to it with a `useEffect` that fills or clears the inputs."*

## Key decisions

| Question | Choice | Why |
|---|---|---|
| Category validation | `Literal[...]` in Pydantic | Automatic 422 + shows the allowed values in `/docs`. No manual `if`. |
| Summary location | Backend | Correct even with pagination or many rows; the frontend may not have all data. |
| Summary refresh | Re-fetch after changes | Avoids duplicating the calculation in JS. Trade-off: 1 extra request. |
| Edit state | `editing` in App, passed to the form | App owns the data; the form only displays and collects input. |
| Create + edit | One form, one submit handler | Same fields → reuse. The button text changes with the mode. |

## Answers to the follow-up questions

1. **Deleting the DB:** `create_all()` doesn't alter existing tables. Teams use **migrations** (Alembic for SQLAlchemy):
   a versioned script `ALTER TABLE expenses ADD COLUMN category ... DEFAULT 'other'`, run on every environment.
2. **Where to compute the summary:** backend, ideally in SQL (`GROUP BY category` with `SUM`), so 1 million rows never
   leave the database. The frontend would need to download everything.
3. **PUT vs PATCH:** PUT = send the complete object (our form always has all fields). PATCH = send only changed fields
   (like toggling a favourite in project 06).
4. **Money as float:** floats can't represent 0.1 exactly (`0.1 + 0.2 = 0.30000000000000004`). Use **integer cents** or
   `Decimal` / SQL `NUMERIC(10, 2)`.

## Final code (changed files)

**`backend/app/models.py`**

```python
"""ORM models = database tables."""

from datetime import date

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(primary_key=True)
    description: Mapped[str] = mapped_column(String(100))
    amount: Mapped[float]
    spent_on: Mapped[date]
    category: Mapped[str] = mapped_column(String(20), default="other")  # Task 1
```

**`backend/app/schemas.py`**

```python
"""Pydantic schemas = the JSON the API accepts and returns."""

from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

# Task 1: only these values are allowed; anything else → 422 automatically
Category = Literal["food", "transport", "housing", "fun", "other"]


class ExpenseIn(BaseModel):
    """Body for creating (POST) or replacing (PUT) an expense."""

    description: str = Field(min_length=1, max_length=100)
    amount: float = Field(gt=0, le=100_000)
    spent_on: date  # JSON "2026-10-25" is converted to a Python date automatically
    category: Category = "other"  # Task 1


class ExpenseOut(ExpenseIn):
    model_config = ConfigDict(from_attributes=True)

    id: int


class Summary(BaseModel):  # Task 2
    total: float
    by_category: dict[str, float]
```

**`backend/app/main.py`**

```python
"""
Expense Tracker API (FastAPI + SQLAlchemy + SQLite)

Run (from the backend folder):  uvicorn app.main:app --reload --port 8000
Docs:                           http://localhost:8000/docs
"""

from contextlib import asynccontextmanager
from datetime import date, timedelta

from fastapi import Depends, FastAPI, HTTPException, Query, status
from sqlalchemy import extract, select
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine, get_db
from .models import Expense
from .schemas import ExpenseIn, ExpenseOut, Summary


def seed_database():
    """Create tables and add example rows when the table is empty."""
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if db.scalar(select(Expense).limit(1)) is None:
            today = date.today()
            db.add_all(
                [
                    Expense(description="Groceries at Edeka", amount=42.80, spent_on=today - timedelta(days=1), category="food"),
                    Expense(description="MVV monthly ticket", amount=58.00, spent_on=today - timedelta(days=3), category="transport"),
                    Expense(description="Rent", amount=650.00, spent_on=today - timedelta(days=5), category="housing"),
                    Expense(description="Cinema", amount=13.50, spent_on=today - timedelta(days=6), category="fun"),
                    Expense(description="Brezeln and coffee", amount=6.40, spent_on=today - timedelta(days=8), category="food"),
                ]
            )
            db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_database()
    yield


app = FastAPI(title="Expense Tracker API", lifespan=lifespan)


def get_expense_or_404(db: Session, expense_id: int) -> Expense:
    expense = db.get(Expense, expense_id)
    if expense is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Expense {expense_id} not found")
    return expense


@app.get("/api/expenses", response_model=list[ExpenseOut])
def list_expenses(
    month: str | None = Query(None, pattern=r"^\d{4}-\d{2}$"),  # Bonus: "2026-10"; bad format → 422
    db: Session = Depends(get_db),
):
    query = select(Expense).order_by(Expense.spent_on.desc(), Expense.id.desc())  # newest first
    if month:
        year, mon = (int(part) for part in month.split("-"))
        query = query.where(extract("year", Expense.spent_on) == year, extract("month", Expense.spent_on) == mon)
    return db.scalars(query).all()


# Task 2: defined BEFORE /api/expenses/{expense_id}. FastAPI matches routes top to bottom,
# and "summary" would otherwise be parsed as an expense_id → 422 (for GET, once a GET /{expense_id} exists).
@app.get("/api/expenses/summary", response_model=Summary)
def expense_summary(db: Session = Depends(get_db)):
    totals: dict[str, float] = {}
    for expense in db.scalars(select(Expense)):
        totals[expense.category] = totals.get(expense.category, 0) + expense.amount
    by_category = {cat: round(amount, 2) for cat, amount in sorted(totals.items(), key=lambda kv: kv[1], reverse=True)}
    return {"total": round(sum(totals.values()), 2), "by_category": by_category}


@app.post("/api/expenses", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(expense_in: ExpenseIn, db: Session = Depends(get_db)):
    expense = Expense(**expense_in.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


# Task 3: PUT = replace every field
@app.put("/api/expenses/{expense_id}", response_model=ExpenseOut)
def update_expense(expense_id: int, expense_in: ExpenseIn, db: Session = Depends(get_db)):
    expense = get_expense_or_404(db, expense_id)
    for field, value in expense_in.model_dump().items():
        setattr(expense, field, value)
    db.commit()
    db.refresh(expense)
    return expense


@app.delete("/api/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    db.delete(get_expense_or_404(db, expense_id))
    db.commit()
```

**`backend/tests/test_expenses.py`**

```python
"""
API tests with a fresh in-memory database for every test (see the client fixture).
Run from the backend folder:  pytest -v
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

GROCERIES = {"description": "Groceries", "amount": 20.5, "spent_on": "2026-10-20"}


@pytest.fixture
def client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    TestingSession = sessionmaker(bind=engine, autoflush=False)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_create_and_list(client):
    response = client.post("/api/expenses", json=GROCERIES)
    assert response.status_code == 201
    assert response.json() == {"id": 1, "category": "other", **GROCERIES}
    assert len(client.get("/api/expenses").json()) == 1


def test_list_is_newest_first(client):
    client.post("/api/expenses", json={**GROCERIES, "spent_on": "2026-10-01"})
    client.post("/api/expenses", json={**GROCERIES, "spent_on": "2026-10-15"})
    dates = [e["spent_on"] for e in client.get("/api/expenses").json()]
    assert dates == ["2026-10-15", "2026-10-01"]


def test_negative_amount_returns_422(client):
    assert client.post("/api/expenses", json={**GROCERIES, "amount": -5}).status_code == 422


def test_delete(client):
    client.post("/api/expenses", json=GROCERIES)
    assert client.delete("/api/expenses/1").status_code == 204
    assert client.delete("/api/expenses/1").status_code == 404


# Task 1
def test_default_category_is_other(client):
    assert client.post("/api/expenses", json=GROCERIES).json()["category"] == "other"


def test_invalid_category_returns_422(client):
    assert client.post("/api/expenses", json={**GROCERIES, "category": "shoes"}).status_code == 422


# Task 2
def test_summary(client):
    client.post("/api/expenses", json={**GROCERIES, "amount": 10.10, "category": "food"})
    client.post("/api/expenses", json={**GROCERIES, "amount": 5.20, "category": "food"})
    client.post("/api/expenses", json={**GROCERIES, "amount": 50, "category": "fun"})
    response = client.get("/api/expenses/summary")
    assert response.status_code == 200
    assert response.json() == {"total": 65.3, "by_category": {"fun": 50.0, "food": 15.3}}
    assert list(response.json()["by_category"]) == ["fun", "food"]  # biggest first


def test_summary_when_empty(client):
    assert client.get("/api/expenses/summary").json() == {"total": 0, "by_category": {}}


# Task 3
def test_update_expense(client):
    client.post("/api/expenses", json=GROCERIES)
    response = client.put("/api/expenses/1", json={**GROCERIES, "amount": 99.0, "category": "food"})
    assert response.status_code == 200
    assert response.json()["amount"] == 99.0
    assert client.get("/api/expenses").json()[0]["category"] == "food"


def test_update_unknown_expense_returns_404(client):
    assert client.put("/api/expenses/42", json=GROCERIES).status_code == 404


# Bonus
def test_month_filter(client):
    client.post("/api/expenses", json={**GROCERIES, "spent_on": "2026-09-30"})
    client.post("/api/expenses", json={**GROCERIES, "spent_on": "2026-10-01"})
    assert [e["spent_on"] for e in client.get("/api/expenses?month=2026-10").json()] == ["2026-10-01"]
    assert client.get("/api/expenses?month=October").status_code == 422
```

**`frontend/src/api.js`**

```js
async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    let message = `Request failed (${response.status})`;
    if (typeof body.detail === "string") message = body.detail;
    // FastAPI validation errors (422): [{ loc: ["body", "amount"], msg: "..." }, ...]
    else if (Array.isArray(body.detail)) message = body.detail.map((d) => `${d.loc.at(-1)}: ${d.msg}`).join(", ");
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function getExpenses() {
  return request("/expenses");
}

export function createExpense(expense) {
  return request("/expenses", { method: "POST", body: JSON.stringify(expense) });
}

// Task 3
export function updateExpense(id, expense) {
  return request(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(expense) });
}

export function deleteExpense(id) {
  return request(`/expenses/${id}`, { method: "DELETE" });
}

// Task 2
export function getSummary() {
  return request("/expenses/summary");
}
```

**`frontend/src/App.jsx`**

```jsx
import { useEffect, useState } from "react";
import * as api from "./api.js";
import ExpenseForm from "./components/ExpenseForm.jsx";
import ExpenseTable from "./components/ExpenseTable.jsx";
import Summary from "./components/Summary.jsx";

// keep "newest first" after adding/editing
function sortNewestFirst(list) {
  return [...list].sort((a, b) => b.spent_on.localeCompare(a.spent_on) || b.id - a.id);
}

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null); // Task 2
  const [editing, setEditing] = useState(null); // Task 3: the expense being edited, or null

  // Task 2: simplest correct approach: ask the server again after every change
  function refreshSummary() {
    api
      .getSummary()
      .then(setSummary)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    api
      .getExpenses()
      .then(setExpenses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    refreshSummary();
  }, []);

  // Used for both create and edit. Returns an error message for the form, or null on success.
  async function handleSubmit(expense) {
    try {
      if (editing) {
        const updated = await api.updateExpense(editing.id, expense); // Task 3
        setExpenses((prev) => sortNewestFirst(prev.map((e) => (e.id === updated.id ? updated : e))));
        setEditing(null);
      } else {
        const created = await api.createExpense(expense);
        setExpenses((prev) => sortNewestFirst([...prev, created]));
      }
      refreshSummary();
      return null;
    } catch (err) {
      return err.message;
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      if (editing?.id === id) setEditing(null);
      refreshSummary();
    } catch (err) {
      setError(err.message);
    }
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="container wide">
      <h1>💶 Expense Tracker</h1>
      <ExpenseForm onSubmit={handleSubmit} editing={editing} onCancel={() => setEditing(null)} />

      {error && <p className="error">⚠️ {error}</p>}
      {summary && <Summary summary={summary} />}
      {loading ? <p>Loading…</p> : <ExpenseTable expenses={expenses} onDelete={handleDelete} onEdit={setEditing} />}

      <p className="total">
        Total: <strong>{total.toFixed(2)} €</strong>
      </p>
    </div>
  );
}
```

**`frontend/src/components/ExpenseForm.jsx`**

```jsx
import { useEffect, useState } from "react";

export const CATEGORIES = ["food", "transport", "housing", "fun", "other"]; // Task 1

// Today as "YYYY-MM-DD" in LOCAL time (the format <input type="date"> and the API use).
// (new Date().toISOString() would give the UTC date, which is "yesterday" just after midnight in Germany.)
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Props:
//   onSubmit(expense) → async, resolves to an error message or null on success
//   editing           → the expense being edited, or null (= create mode)   (Task 3)
//   onCancel()        → leave edit mode                                     (Task 3)
export default function ExpenseForm({ onSubmit, editing, onCancel }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [spentOn, setSpentOn] = useState(today());
  const [category, setCategory] = useState("other"); // Task 1
  const [error, setError] = useState(null);

  function reset() {
    setDescription("");
    setAmount("");
    setSpentOn(today());
    setCategory("other");
    setError(null);
  }

  // Task 3: when the parent starts/stops editing, fill or clear the inputs
  useEffect(() => {
    if (editing) {
      setDescription(editing.description);
      setAmount(String(editing.amount));
      setSpentOn(editing.spent_on);
      setCategory(editing.category);
      setError(null);
    } else {
      reset();
    }
  }, [editing]);

  async function handleSubmit(event) {
    event.preventDefault();
    const message = await onSubmit({ description, amount: Number(amount), spent_on: spentOn, category });
    if (message) {
      setError(message);
    } else if (!editing) {
      reset(); // in edit mode the parent sets editing=null, and the effect above resets
    }
  }

  return (
    <form className={`expense-form ${editing ? "editing" : ""}`} onSubmit={handleSubmit}>
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <input
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount €"
        style={{ width: 110 }}
      />
      <input type="date" value={spentOn} onChange={(e) => setSpentOn(e.target.value)} />
      {/* Task 1 */}
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button type="submit" className="primary">
        {editing ? "Save changes" : "Add"}
      </button>
      {editing && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
      {error && <p className="error full">{error}</p>}
    </form>
  );
}
```

**`frontend/src/components/ExpenseTable.jsx`**

```jsx
export default function ExpenseTable({ expenses, onDelete, onEdit }) {
  if (expenses.length === 0) return <p className="muted">No expenses yet.</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Category</th>
          <th className="num">Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((expense) => (
          <tr key={expense.id}>
            {/* "2026-10-25" → "25.10.2026" */}
            <td>{expense.spent_on.split("-").reverse().join(".")}</td>
            <td>{expense.description}</td>
            {/* Task 1 */}
            <td>
              <span className="badge">{expense.category}</span>
            </td>
            <td className="num">{expense.amount.toFixed(2)} €</td>
            <td className="actions">
              {/* Task 3 */}
              <button onClick={() => onEdit(expense)} aria-label={`Edit ${expense.description}`}>
                ✏️
              </button>{" "}
              <button onClick={() => onDelete(expense.id)} aria-label={`Delete ${expense.description}`}>
                🗑
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**`frontend/src/components/Summary.jsx`**

```jsx
// Task 2: summary = { total: 770.7, by_category: { housing: 650, ... } } (already sorted by the backend)
export default function Summary({ summary }) {
  const entries = Object.entries(summary.by_category);
  if (entries.length === 0) return null;

  return (
    <div className="summary">
      <h2>Spending by category</h2>
      {entries.map(([category, amount]) => {
        const percent = summary.total > 0 ? (amount / summary.total) * 100 : 0;
        return (
          <div className="summary-row" key={category}>
            <span>{category}</span>
            <div className="bar" style={{ width: `${percent}%` }} />
            <span className="num">
              {amount.toFixed(2)} € ({Math.round(percent)}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}
```
