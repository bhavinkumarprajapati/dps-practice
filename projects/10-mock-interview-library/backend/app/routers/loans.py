from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Book, Loan, Member
from ..schemas import LoanCreate, LoanOut

router = APIRouter(prefix="/api/loans", tags=["loans"])


def get_loan_or_404(db: Session, loan_id: int) -> Loan:
    loan = db.get(Loan, loan_id)
    if loan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Loan {loan_id} not found")
    return loan


@router.get("", response_model=list[LoanOut])
def list_loans(active: bool = True, db: Session = Depends(get_db)):
    """active=true (default): only books that are still out. active=false: all loans, including returned ones."""
    query = select(Loan).order_by(Loan.loaned_on)
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

    loan = Loan(book_id=loan_in.book_id, member_id=loan_in.member_id, loaned_on=date.today())
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
