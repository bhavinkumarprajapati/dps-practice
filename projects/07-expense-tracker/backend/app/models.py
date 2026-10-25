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
