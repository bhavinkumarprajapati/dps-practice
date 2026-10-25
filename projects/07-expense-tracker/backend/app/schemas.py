"""Pydantic schemas = the JSON the API accepts and returns."""

from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class ExpenseIn(BaseModel):
    """Body for creating an expense."""

    description: str = Field(min_length=1, max_length=100)
    amount: float = Field(gt=0, le=100_000)
    spent_on: date  # JSON "2026-10-25" is converted to a Python date automatically


class ExpenseOut(ExpenseIn):
    model_config = ConfigDict(from_attributes=True)

    id: int
