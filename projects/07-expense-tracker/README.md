# 07: Expense Tracker 🟡

**Stack:** FastAPI + SQLAlchemy + **SQLite** + React (JavaScript) · **Total time:** ~80 min ·
**Concepts:** a new DB column end-to-end, `Literal` validation, aggregation, route order, PUT + an "edit mode" form

## The app

Track what you spend. Expenses are stored in a **SQLite database** (`backend/expenses.db`, created on first start with
5 example rows). The structure is the same as `basics/L6-fullstack/backend-fastapi`.

```
07-expense-tracker/
├── backend/
│   ├── app/
│   │   ├── database.py     ← engine, SessionLocal, get_db
│   │   ├── models.py       ← Expense table
│   │   ├── schemas.py      ← ExpenseIn / ExpenseOut
│   │   └── main.py         ← routes + seed data
│   └── tests/test_expenses.py   ← uses an in-memory DB
└── frontend/src/
    ├── api.js              ← also turns FastAPI 422 errors into readable text
    ├── App.jsx             ← owns the list, computes the total
    └── components/
        ├── ExpenseForm.jsx
        └── ExpenseTable.jsx
```

## Run it

```powershell
# Terminal 1
cd projects\07-expense-tracker\backend
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2
cd projects\07-expense-tracker\frontend
npm install
npm run dev
```

⚠️ **When you add a column:** stop the backend and **delete `backend/expenses.db`**. `create_all()` only creates missing
*tables*. It never adds columns to an existing table. (In a real project you'd write a migration.)

## Before you start (5 min)

1. Add an expense with amount `-5`. Read the error. Which file turns FastAPI's 422 list into that text?
2. In `/docs`, find the schema of `ExpenseIn`. Where does it come from?

---

## Tasks

### Task 1: Categories (25 min)
> *"I want to know what I spend my money on."*

- Every expense has a `category`: one of `food`, `transport`, `housing`, `fun`, `other`. Default `other`.
- Any other value → **422** (let Pydantic do it, using `Literal[...]`).
- The form gets a `<select>`, and the table gets a **Category** column (show it as a small badge, CSS class `badge`).
- Give the seed data sensible categories. Test: invalid category → 422.

### Task 2: Summary per category (20 min)
> *"How much did I spend on food in total?"*

- `GET /api/expenses/summary` →
  ```json
  { "total": 770.70, "by_category": { "housing": 650.0, "transport": 58.0, "food": 49.2, "fun": 13.5 } }
  ```
  Only categories that have expenses; amounts rounded to 2 decimals; **biggest first**.
- Frontend: a summary box above the table: one row per category with the amount, the percentage and a bar.
  It must update after you add or delete an expense.
- Test for the summary.

> ⚠️ Route order: imagine the app also had `GET /api/expenses/{expense_id}`. What would `GET /api/expenses/summary`
> return if the summary route were defined **below** it? Try it: add a quick get-by-id route and see. Then decide where
> `/summary` belongs.

### Task 3: Edit an expense (25 min)
> *"I typed the wrong amount."*

- `PUT /api/expenses/{id}` with a full expense body → **200** + the updated expense. Unknown id → **404**.
- Each row gets a ✏️ button. Clicking it **fills the form** with that expense. The form shows **Save changes**
  and **Cancel**, and gets the CSS class `editing`. Saving replaces the row; Cancel empties the form again.
- Test: update works; unknown id → 404.

### Bonus
- `GET /api/expenses?month=2026-10` returns only that month. A bad format → 422.
  (Hint: `Query(None, pattern=r"^\d{4}-\d{2}$")`.)

---

## Interviewer follow-up questions
1. Why did you have to delete `expenses.db`? How would a real team handle a schema change?
2. Where should the summary be calculated: backend or frontend? What changes if there are 1 million expenses?
3. Why PUT and not PATCH for editing? When would you use PATCH?
4. Amounts are stored as `float`. Is that a good idea for money? What would you use instead?

---

<details><summary>💡 Hints</summary>

- `from typing import Literal`; `Category = Literal["food", "transport", "housing", "fun", "other"]`;
  in the schema: `category: Category = "other"`; in the model: `category: Mapped[str] = mapped_column(String(20), default="other")`.
- Summary: loop over all expenses and add up into a dict `totals[e.category] = totals.get(e.category, 0) + e.amount`,
  then `dict(sorted(totals.items(), key=lambda kv: kv[1], reverse=True))`. (Or SQL: `select(Expense.category, func.sum(Expense.amount)).group_by(...)`.)
- Frontend summary: easiest is to **re-fetch** `/summary` after every add/delete/edit. A `refreshSummary()` helper keeps it simple.
- Edit mode: keep `editing` (the expense being edited, or `null`) in `App`. Pass it to the form. In the form,
  `useEffect(() => { if (editing) { setDescription(editing.description); ... } }, [editing])`.
</details>

**Reference solution:** not in this branch. When you have finished all tasks, ask your mentor for the review / solution.
