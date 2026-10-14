"""
Tests for the Books API. Run with:  pytest -v

TestClient lets you call the API like a browser would, without starting a server.
Pattern for every test:  ARRANGE (prepare)  ->  ACT (call the API)  ->  ASSERT (check the result)
"""

import copy

import pytest
from fastapi.testclient import TestClient

import main

client = TestClient(main.app)


@pytest.fixture(autouse=True)
def reset_data():
    """Our "database" is a global list, so restore it after every test.
    autouse=True means this runs around every test automatically."""
    saved_books = copy.deepcopy(main.books)
    saved_next_id = main.next_id
    yield  # <- the test runs here
    main.books[:] = saved_books
    main.next_id = saved_next_id


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_books_returns_all():
    response = client.get("/api/books")
    assert response.status_code == 200
    assert len(response.json()) == 3


def test_filter_by_read():
    response = client.get("/api/books", params={"read": "true"})
    titles = [book["title"] for book in response.json()]
    assert titles == ["The Hobbit"]


def test_get_unknown_book_returns_404():
    response = client.get("/api/books/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Book 999 not found"


def test_create_book():
    response = client.post(
        "/api/books", json={"title": "Dune", "author": "Frank Herbert", "year": 1965}
    )
    assert response.status_code == 201
    body = response.json()
    assert body["id"] == 4
    assert body["read"] is False  # default value was used
    # and it really was stored:
    assert len(client.get("/api/books").json()) == 4


def test_create_book_with_invalid_year_returns_422():
    response = client.post("/api/books", json={"title": "X", "author": "Y", "year": -5})
    assert response.status_code == 422


def test_mark_as_read():
    response = client.patch("/api/books/2", json={"read": True})
    assert response.status_code == 200
    assert response.json()["read"] is True


def test_delete_book():
    response = client.delete("/api/books/1")
    assert response.status_code == 204
    assert client.get("/api/books/1").status_code == 404
