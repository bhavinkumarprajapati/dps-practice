"""API shapes (Pydantic)."""

from datetime import date

from pydantic import BaseModel, ConfigDict


class BookOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    author: str
    available: bool  # not a DB column: set by the books router


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
    returned_on: date | None
