"""Pydantic schemas = the shape of the JSON the API accepts and returns.

Why separate from models.py?
  models.py  → how data is STORED (database table)
  schemas.py → how data is SENT/RECEIVED (API contract)
They often look similar, but not always (e.g. a User model has password_hash, the API must never return it).
"""

from pydantic import BaseModel, ConfigDict, Field


class ItemCreate(BaseModel):
    """POST /api/items body"""

    name: str = Field(min_length=1, max_length=100)


class ItemUpdate(BaseModel):
    """PATCH /api/items/{id} body: every field optional, only the sent ones are changed."""

    name: str | None = Field(default=None, min_length=1, max_length=100)
    bought: bool | None = None


class ItemOut(BaseModel):
    """What every endpoint returns for an item."""

    # from_attributes=True lets Pydantic read a SQLAlchemy object (item.id, item.name, ...)
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    bought: bool
