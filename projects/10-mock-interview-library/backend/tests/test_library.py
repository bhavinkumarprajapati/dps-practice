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


@pytest.fixture
def client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    TestingSession = sessionmaker(bind=engine, autoflush=False)
    Base.metadata.create_all(bind=engine)

    # small known data set: 2 books, 2 members, book 1 is on loan to member 1 since 5 days
    with TestingSession() as db:
        hobbit, dune = Book(title="The Hobbit", author="Tolkien"), Book(title="Dune", author="Herbert")
        anna, ben = Member(name="Anna", email="anna@example.com"), Member(name="Ben", email="ben@example.com")
        db.add_all([hobbit, dune, anna, ben])
        db.flush()
        db.add(Loan(book=hobbit, member=anna, loaned_on=date.today() - timedelta(days=5)))
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


def test_books_show_availability(client):
    books = {b["title"]: b["available"] for b in client.get("/api/books").json()}
    assert books == {"Dune": True, "The Hobbit": False}


def test_active_loans(client):
    loans = client.get("/api/loans").json()
    assert len(loans) == 1
    assert loans[0]["book"] == {"id": 1, "title": "The Hobbit"}
    assert loans[0]["member"] == {"id": 1, "name": "Anna"}
    assert loans[0]["returned_on"] is None


def test_lend_a_book(client):
    response = client.post("/api/loans", json={"book_id": 2, "member_id": 2})
    assert response.status_code == 201
    assert response.json()["loaned_on"] == date.today().isoformat()
    assert len(client.get("/api/loans").json()) == 2


def test_cannot_lend_a_book_that_is_out(client):
    response = client.post("/api/loans", json={"book_id": 1, "member_id": 2})
    assert response.status_code == 409


def test_unknown_member_returns_404(client):
    assert client.post("/api/loans", json={"book_id": 2, "member_id": 99}).status_code == 404


def test_return_a_book(client):
    response = client.post("/api/loans/1/return")
    assert response.status_code == 200
    assert response.json()["returned_on"] == date.today().isoformat()
    assert client.get("/api/loans").json() == []
    assert client.post("/api/loans/1/return").status_code == 409
