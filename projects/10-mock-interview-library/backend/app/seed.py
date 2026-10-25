"""Example data, inserted once when the database is empty. Dates are relative to today."""

from datetime import date, timedelta

from sqlalchemy import select

from .database import SessionLocal
from .models import Book, Loan, Member


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
        db.add_all(
            [
                Loan(book=books[0], member=members[0], loaned_on=today - timedelta(days=3)),
                Loan(book=books[1], member=members[1], loaned_on=today - timedelta(days=20)),
                Loan(book=books[3], member=members[2], loaned_on=today - timedelta(days=13)),
                Loan(book=books[6], member=members[0], loaned_on=today - timedelta(days=31)),
                # returned loans (history)
                Loan(book=books[2], member=members[3], loaned_on=today - timedelta(days=40), returned_on=today - timedelta(days=30)),
                Loan(book=books[0], member=members[1], loaned_on=today - timedelta(days=60), returned_on=today - timedelta(days=50)),
            ]
        )
        db.commit()
