"""
Expense Tracker API (FastAPI + SQLAlchemy + SQLite)

Run (from the backend folder):  uvicorn app.main:app --reload --port 8000
Docs:                           http://localhost:8000/docs
"""

from contextlib import asynccontextmanager
from datetime import date, timedelta

from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine, get_db
from .models import Expense
from .schemas import ExpenseIn, ExpenseOut


def seed_database():
    """Create tables and add example rows when the table is empty."""
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if db.scalar(select(Expense).limit(1)) is None:
            today = date.today()
            db.add_all(
                [
                    Expense(description="Groceries at Edeka", amount=42.80, spent_on=today - timedelta(days=1)),
                    Expense(description="MVV monthly ticket", amount=58.00, spent_on=today - timedelta(days=3)),
                    Expense(description="Rent", amount=650.00, spent_on=today - timedelta(days=5)),
                    Expense(description="Cinema", amount=13.50, spent_on=today - timedelta(days=6)),
                    Expense(description="Brezeln and coffee", amount=6.40, spent_on=today - timedelta(days=8)),
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
def list_expenses(db: Session = Depends(get_db)):
    # newest first
    return db.scalars(select(Expense).order_by(Expense.spent_on.desc(), Expense.id.desc())).all()


@app.post("/api/expenses", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(expense_in: ExpenseIn, db: Session = Depends(get_db)):
    expense = Expense(**expense_in.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@app.delete("/api/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    db.delete(get_expense_or_404(db, expense_id))
    db.commit()
