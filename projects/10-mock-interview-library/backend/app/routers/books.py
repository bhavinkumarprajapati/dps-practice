from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Book, Loan
from ..schemas import BookOut

router = APIRouter(prefix="/api/books", tags=["books"])


@router.get("", response_model=list[BookOut])
def list_books(db: Session = Depends(get_db)):
    # ids of books that are currently lent out (a loan without a return date)
    on_loan = set(db.scalars(select(Loan.book_id).where(Loan.returned_on.is_(None))))
    books = db.scalars(select(Book).order_by(Book.title)).all()
    return [BookOut(id=b.id, title=b.title, author=b.author, available=b.id not in on_loan) for b in books]
