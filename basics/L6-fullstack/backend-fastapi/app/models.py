"""ORM models = Python classes that map to DATABASE TABLES (one instance = one row)."""

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Item(Base):
    __tablename__ = "items"

    # Mapped[int] = the Python type; mapped_column(...) = column options
    id: Mapped[int] = mapped_column(primary_key=True)  # auto-increments
    name: Mapped[str] = mapped_column(String(100))
    bought: Mapped[bool] = mapped_column(default=False)
