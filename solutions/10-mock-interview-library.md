# Solution 10: Mock Interview: City Library

## What a strong 60 minutes looks like

| Time | What the candidate says / does |
|---|---|
| 0–3 | *"So the problem is that nobody knows when a book is due, and librarians can't see which books to chase. Let me ask a few things: how long is a loan? Where should this show up? Should existing loans get a due date? Do you want to extend loans later?"* |
| 3–6 | *"Plan: I'll add a `due_on` column to `Loan` and **store** it, because you mentioned extending loans: a calculated value couldn't change. New loans get today + 14, existing ones loaned_on + 14. The API also returns how many days are left, calculated on the server. The Loans page gets a Due column, sorted by due date, with overdue rows in red. Then a test. OK?"* |
| 6–20 | Backend: `LOAN_DAYS` constant → model column → **delete `library.db`** (says why) → seed → `create_loan` sets `due_on` → schema `due_on` + `days_left` → order by `due_on` → checks `/docs`. |
| 20–25 | Runs `pytest`, sees the fixture fail because `due_on` is required now, says *"expected, existing test data needs a due date"*, fixes the fixture, adds a test for `days_left` and for a new loan being due in 14 days. |
| 25–40 | Frontend: `Due` + `Status` columns, `dueStatus()` helper for labels ("6 days overdue", "Due today", "Due in 3 days"), `overdue` CSS class, "2 books are overdue" banner. |
| 40–50 | Clicks through: overdue rows at the top, lend a new book → due in 14 days. If time: the extension. |
| 50–60 | Demo + follow-up questions. Mentions what's next: emails/reminders, a filter "only overdue", a migration tool. |

## Key decisions

| Question | Choice | Why |
|---|---|---|
| Store or calculate the due date? | **Store** `due_on` | Extending changes it. A business policy (14 days) could change later without changing old loans. |
| Where's "today"? | Backend (`days_left` computed on the server) | One clock for everyone. A user's wrong clock or time zone can't produce wrong "overdue" labels. |
| Sorting | `ORDER BY due_on` in SQL | "Most urgent first" = earliest due date first; the database does it. |
| Magic number 14 | `LOAN_DAYS` constant | One place to change; used by create, seed and extend. |
| Extension rules | 409 with a clear message | Same pattern as "Book is already on loan". Follow the codebase. |

## Answers to the follow-up questions

1. **Walkthrough:** model → seed → loans router → schemas → tests → api.js → format.js → LoansPage → BooksPage.
   Backend first, because the frontend depends on the API contract and the backend can be checked alone in `/docs`.
2. **Stored vs calculated:** stored = can be extended and keeps the original rule even if the policy changes; costs a
   column, and existing data must be filled. Calculated = no migration, always consistent, but can't be changed per loan.
3. **Existing DB:** `create_all()` doesn't add columns, so locally we deleted `library.db`. In production: a migration
   (Alembic) that adds `due_on`, fills it with `loaned_on + 14` for existing rows, then makes it NOT NULL.
4. **Where is today decided:** on the server. The frontend could run in another time zone or with a wrong clock.
5. **Testing date logic:** build test data **relative to today** (`date.today() - timedelta(days=20)`), like the fixture
   does, or freeze time (e.g. the `freezegun` library), or pass "today" into the function as a parameter.
6. **Next + validation:** reminder emails 2 days before the due date, an "only overdue" filter, a member page.
   To check it helps: ask the librarians after a week, and measure the number and length of overdue loans before/after.

## Final code (changed files)

**`backend/app/models.py`**

```python
"""Database tables: books, members, and loans (which member has which book)."""

from datetime import date

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base

LOAN_DAYS = 14  # how long a member may keep a book (also the length of one extension)


class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    author: Mapped[str] = mapped_column(String(100))

    loans: Mapped[list["Loan"]] = relationship(back_populates="book")


class Member(Base):
    __tablename__ = "members"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(200), unique=True)

    loans: Mapped[list["Loan"]] = relationship(back_populates="member")


class Loan(Base):
    """One row per time a book was lent out. returned_on is None while the member still has it."""

    __tablename__ = "loans"

    id: Mapped[int] = mapped_column(primary_key=True)
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id"))
    member_id: Mapped[int] = mapped_column(ForeignKey("members.id"))
    loaned_on: Mapped[date]
    due_on: Mapped[date]  # STORED (not calculated), so a loan can be extended later
    returned_on: Mapped[date | None] = mapped_column(default=None)
    extended: Mapped[bool] = mapped_column(default=False)  # extension: a loan can be extended once

    book: Mapped["Book"] = relationship(back_populates="loans")
    member: Mapped["Member"] = relationship(back_populates="loans")
```

**`backend/app/seed.py`**

```python
"""Example data, inserted once when the database is empty. Dates are relative to today."""

from datetime import date, timedelta

from sqlalchemy import select

from .database import SessionLocal
from .models import LOAN_DAYS, Book, Loan, Member


def seed_database():
    with SessionLocal() as db:
        if db.scalar(select(Book).limit(1)) is not None:
            return  # already seeded

        books = [
            Book(title="The Hobbit", author="J.R.R. Tolkien"),
            Book(title="Clean Code", author="Robert C. Martin"),
            Book(title="Sprint", author="Jake Knapp"),
            Book(title="Dune", author="Frank Herbert"),
            Book(title="The Lean Startup", author="Eric Ries"),
            Book(title="Inspired", author="Marty Cagan"),
            Book(title="Refactoring", author="Martin Fowler"),
            Book(title="Don't Make Me Think", author="Steve Krug"),
        ]
        members = [
            Member(name="Anna Weber", email="anna@example.com"),
            Member(name="Ben Okafor", email="ben@example.com"),
            Member(name="Chen Li", email="chen@example.com"),
            Member(name="Dana Novak", email="dana@example.com"),
        ]
        db.add_all(books + members)
        db.flush()  # assigns ids without committing yet

        today = date.today()

        def loan(book, member, days_ago, returned_days_ago=None):
            loaned_on = today - timedelta(days=days_ago)
            returned_on = today - timedelta(days=returned_days_ago) if returned_days_ago is not None else None
            return Loan(
                book=book,
                member=member,
                loaned_on=loaned_on,
                due_on=loaned_on + timedelta(days=LOAN_DAYS),  # existing loans: 14 days after their loan date
                returned_on=returned_on,
            )

        db.add_all(
            [
                loan(books[0], members[0], days_ago=3),
                loan(books[1], members[1], days_ago=20),  # 6 days overdue
                loan(books[3], members[2], days_ago=13),  # due tomorrow
                loan(books[6], members[0], days_ago=31),  # 17 days overdue
                # returned loans (history)
                loan(books[2], members[3], days_ago=40, returned_days_ago=30),
                loan(books[0], members[1], days_ago=60, returned_days_ago=50),
            ]
        )
        db.commit()
```

**`backend/app/schemas.py`**

```python
"""API shapes (Pydantic)."""

from datetime import date

from pydantic import BaseModel, ConfigDict, computed_field


class BookOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    author: str
    available: bool  # not a DB column: set by the books router
    due_on: date | None = None  # nice-to-have: when an on-loan book is due back


class MemberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str


class BookBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str


class MemberBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class LoanCreate(BaseModel):
    book_id: int
    member_id: int


class LoanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    book: BookBrief  # nested objects come from the SQLAlchemy relationships
    member: MemberBrief
    loaned_on: date
    due_on: date
    returned_on: date | None
    extended: bool

    # Calculated on the SERVER, so "today" comes from one place, not from each user's computer clock.
    # > 0: days left · 0: due today · < 0: overdue by that many days · None: already returned
    @computed_field
    @property
    def days_left(self) -> int | None:
        if self.returned_on is not None:
            return None
        return (self.due_on - date.today()).days
```

**`backend/app/routers/loans.py`**

```python
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import LOAN_DAYS, Book, Loan, Member
from ..schemas import LoanCreate, LoanOut

router = APIRouter(prefix="/api/loans", tags=["loans"])


def get_loan_or_404(db: Session, loan_id: int) -> Loan:
    loan = db.get(Loan, loan_id)
    if loan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Loan {loan_id} not found")
    return loan


@router.get("", response_model=list[LoanOut])
def list_loans(active: bool = True, db: Session = Depends(get_db)):
    """active=true (default): only books that are still out. active=false: all loans, including returned ones.
    Sorted by due date, so the most urgent (most overdue) loans come first."""
    query = select(Loan).order_by(Loan.due_on, Loan.id)
    if active:
        query = query.where(Loan.returned_on.is_(None))
    return db.scalars(query).all()


@router.post("", response_model=LoanOut, status_code=status.HTTP_201_CREATED)
def create_loan(loan_in: LoanCreate, db: Session = Depends(get_db)):
    if db.get(Book, loan_in.book_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Book {loan_in.book_id} not found")
    if db.get(Member, loan_in.member_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Member {loan_in.member_id} not found")

    already_out = db.scalar(
        select(Loan).where(Loan.book_id == loan_in.book_id, Loan.returned_on.is_(None)).limit(1)
    )
    if already_out is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Book is already on loan")

    today = date.today()
    loan = Loan(
        book_id=loan_in.book_id,
        member_id=loan_in.member_id,
        loaned_on=today,
        due_on=today + timedelta(days=LOAN_DAYS),
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.post("/{loan_id}/return", response_model=LoanOut)
def return_loan(loan_id: int, db: Session = Depends(get_db)):
    loan = get_loan_or_404(db, loan_id)
    if loan.returned_on is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Book was already returned")
    loan.returned_on = date.today()
    db.commit()
    db.refresh(loan)
    return loan


# Extension: extend once by LOAN_DAYS, only if not returned and not overdue
@router.post("/{loan_id}/extend", response_model=LoanOut)
def extend_loan(loan_id: int, db: Session = Depends(get_db)):
    loan = get_loan_or_404(db, loan_id)
    if loan.returned_on is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Book was already returned")
    if loan.extended:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This loan was already extended once")
    if loan.due_on < date.today():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Overdue loans cannot be extended")
    loan.due_on += timedelta(days=LOAN_DAYS)
    loan.extended = True
    db.commit()
    db.refresh(loan)
    return loan
```

**`backend/app/routers/books.py`**

```python
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Book, Loan
from ..schemas import BookOut

router = APIRouter(prefix="/api/books", tags=["books"])


@router.get("", response_model=list[BookOut])
def list_books(db: Session = Depends(get_db)):
    # book_id → due date, for books that are currently lent out (a loan without a return date)
    due_by_book = {
        loan.book_id: loan.due_on for loan in db.scalars(select(Loan).where(Loan.returned_on.is_(None)))
    }
    books = db.scalars(select(Book).order_by(Book.title)).all()
    return [
        BookOut(id=b.id, title=b.title, author=b.author, available=b.id not in due_by_book, due_on=due_by_book.get(b.id))
        for b in books
    ]
```

**`backend/tests/test_library.py`**

```python
"""
Tests run against a fresh in-memory database with a small fixed data set.
Run from the backend folder:  pytest -v
"""

from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Book, Loan, Member

TODAY = date.today()


def days_ago(n):
    return TODAY - timedelta(days=n)


@pytest.fixture
def client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    TestingSession = sessionmaker(bind=engine, autoflush=False)
    Base.metadata.create_all(bind=engine)

    # Known data set (dates relative to today, so the tests work on any day):
    #   loan 1: The Hobbit → Anna, lent 5 days ago, due in 9 days
    #   loan 2: Dune → Ben, lent 20 days ago, 6 days OVERDUE
    #   Sprint is available
    with TestingSession() as db:
        hobbit = Book(title="The Hobbit", author="Tolkien")
        dune = Book(title="Dune", author="Herbert")
        sprint = Book(title="Sprint", author="Knapp")
        anna, ben = Member(name="Anna", email="anna@example.com"), Member(name="Ben", email="ben@example.com")
        db.add_all([hobbit, dune, sprint, anna, ben])
        db.flush()
        db.add(Loan(book=hobbit, member=anna, loaned_on=days_ago(5), due_on=days_ago(5) + timedelta(days=14)))
        db.add(Loan(book=dune, member=ben, loaned_on=days_ago(20), due_on=days_ago(20) + timedelta(days=14)))
        db.commit()

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)  # not `with TestClient(...)`, so the lifespan (real DB seeding) doesn't run
    app.dependency_overrides.clear()


def test_books_show_availability_and_due_date(client):
    books = {b["title"]: b for b in client.get("/api/books").json()}
    assert books["Sprint"]["available"] is True
    assert books["Sprint"]["due_on"] is None
    assert books["Dune"]["available"] is False
    assert books["Dune"]["due_on"] == days_ago(6).isoformat()


def test_active_loans_most_urgent_first(client):
    loans = client.get("/api/loans").json()
    assert [l["book"]["title"] for l in loans] == ["Dune", "The Hobbit"]
    assert loans[0]["member"] == {"id": 2, "name": "Ben"}


def test_days_left_and_overdue(client):
    dune, hobbit = client.get("/api/loans").json()
    assert dune["days_left"] == -6  # 6 days overdue
    assert hobbit["days_left"] == 9


def test_new_loan_is_due_in_14_days(client):
    response = client.post("/api/loans", json={"book_id": 3, "member_id": 2})
    assert response.status_code == 201
    assert response.json()["loaned_on"] == TODAY.isoformat()
    assert response.json()["due_on"] == (TODAY + timedelta(days=14)).isoformat()
    assert response.json()["days_left"] == 14


def test_cannot_lend_a_book_that_is_out(client):
    assert client.post("/api/loans", json={"book_id": 1, "member_id": 2}).status_code == 409


def test_unknown_member_returns_404(client):
    assert client.post("/api/loans", json={"book_id": 3, "member_id": 99}).status_code == 404


def test_return_a_book(client):
    response = client.post("/api/loans/1/return")
    assert response.status_code == 200
    assert response.json()["returned_on"] == TODAY.isoformat()
    assert response.json()["days_left"] is None
    assert len(client.get("/api/loans").json()) == 1
    assert client.post("/api/loans/1/return").status_code == 409


# Extension
def test_extend_once(client):
    response = client.post("/api/loans/1/extend")
    assert response.status_code == 200
    assert response.json()["days_left"] == 9 + 14
    assert response.json()["extended"] is True
    second = client.post("/api/loans/1/extend")
    assert second.status_code == 409
    assert second.json()["detail"] == "This loan was already extended once"


def test_cannot_extend_overdue_loan(client):
    response = client.post("/api/loans/2/extend")
    assert response.status_code == 409
    assert response.json()["detail"] == "Overdue loans cannot be extended"
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
    else if (Array.isArray(body.detail)) message = body.detail.map((d) => `${d.loc.at(-1)}: ${d.msg}`).join(", ");
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function getBooks() {
  return request("/books");
}

export function getMembers() {
  return request("/members");
}

export function getActiveLoans() {
  return request("/loans");
}

export function lendBook(bookId, memberId) {
  return request("/loans", { method: "POST", body: JSON.stringify({ book_id: bookId, member_id: memberId }) });
}

export function returnLoan(loanId) {
  return request(`/loans/${loanId}/return`, { method: "POST" });
}

// Extension
export function extendLoan(loanId) {
  return request(`/loans/${loanId}/extend`, { method: "POST" });
}
```

**`frontend/src/format.js`**

```js
// Small display helpers shared by the pages.

// "2026-10-25" → "25.10.2026"
export function formatDate(isoDate) {
  return isoDate.split("-").reverse().join(".");
}

// days_left from the API → label + CSS class for the status pill
export function dueStatus(daysLeft) {
  if (daysLeft < 0) {
    const days = -daysLeft;
    return { label: `${days} ${days === 1 ? "day" : "days"} overdue`, className: "pill red", overdue: true };
  }
  if (daysLeft === 0) return { label: "Due today", className: "pill red", overdue: false };
  if (daysLeft <= 3) return { label: `Due in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`, className: "pill grey", overdue: false };
  return { label: `Due in ${daysLeft} days`, className: "pill green", overdue: false };
}
```

**`frontend/src/pages/LoansPage.jsx`**

```jsx
import { useEffect, useState } from "react";
import * as api from "../api.js";
import { dueStatus, formatDate } from "../format.js";

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // The backend sorts by due date (most urgent first), so re-loading keeps the order correct after changes
  function loadLoans() {
    return api
      .getActiveLoans()
      .then(setLoans)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadLoans();
  }, []);

  async function handleReturn(loan) {
    try {
      await api.returnLoan(loan.id);
      setLoans((prev) => prev.filter((l) => l.id !== loan.id)); // no longer active
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  // Extension
  async function handleExtend(loan) {
    try {
      await api.extendLoan(loan.id);
      setError(null);
      await loadLoans(); // due date changed → order may change
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading…</p>;

  const overdueCount = loans.filter((l) => l.days_left < 0).length;

  return (
    <section>
      {error && <p className="error">⚠️ {error}</p>}
      {overdueCount > 0 && (
        <p className="error">
          {overdueCount} {overdueCount === 1 ? "book is" : "books are"} overdue
        </p>
      )}
      {loans.length === 0 ? (
        <p className="muted">No books are on loan right now.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Book</th>
              <th>Member</th>
              <th>Loaned on</th>
              <th>Due</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => {
              const status = dueStatus(loan.days_left);
              const canExtend = !loan.extended && loan.days_left >= 0;
              return (
                <tr key={loan.id} className={status.overdue ? "overdue" : ""}>
                  <td>{loan.book.title}</td>
                  <td>{loan.member.name}</td>
                  <td>{formatDate(loan.loaned_on)}</td>
                  <td>{formatDate(loan.due_on)}</td>
                  <td>
                    <span className={status.className}>{status.label}</span>
                    {loan.extended && <span className="muted"> (extended)</span>}
                  </td>
                  <td className="actions">
                    {canExtend && <button onClick={() => handleExtend(loan)}>Extend</button>}{" "}
                    <button onClick={() => handleReturn(loan)}>Mark returned</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
```

**`frontend/src/pages/BooksPage.jsx`**

```jsx
import { useEffect, useState } from "react";
import * as api from "../api.js";
import LendForm from "../components/LendForm.jsx";
import { formatDate } from "../format.js";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [lendingBookId, setLendingBookId] = useState(null); // which row shows the lend form
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  function loadBooks() {
    return api
      .getBooks()
      .then(setBooks)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadBooks();
    api
      .getMembers()
      .then(setMembers)
      .catch((err) => setError(err.message));
  }, []);

  async function handleLend(book, memberId) {
    try {
      const loan = await api.lendBook(book.id, memberId);
      setMessage(`"${loan.book.title}" lent to ${loan.member.name}.`);
      setError(null);
      setLendingBookId(null);
      await loadBooks(); // availability changed
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      {error && <p className="error">⚠️ {error}</p>}
      {message && <p className="success">✅ {message}</p>}
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>
                <span className={book.available ? "pill green" : "pill grey"}>
                  {book.available ? "Available" : "On loan"}
                </span>
                {/* nice-to-have: when is it back? */}
                {book.due_on && <span className="muted"> · due {formatDate(book.due_on)}</span>}
              </td>
              <td className="actions">
                {book.available &&
                  (lendingBookId === book.id ? (
                    <LendForm
                      members={members}
                      onLend={(memberId) => handleLend(book, memberId)}
                      onCancel={() => setLendingBookId(null)}
                    />
                  ) : (
                    <button onClick={() => setLendingBookId(book.id)}>Lend…</button>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
```
