"""
Tests for the Flask Books API. Run with:  pytest -v

Flask's built-in test client works like FastAPI's TestClient.
Differences: response.get_json() instead of response.json(), query_string= instead of params=.
"""

import copy

import pytest

import app as app_module

client = app_module.app.test_client()


@pytest.fixture(autouse=True)
def reset_data():
    saved_books = copy.deepcopy(app_module.books)
    saved_next_id = app_module.next_id
    yield
    app_module.books[:] = saved_books
    app_module.next_id = saved_next_id


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}


def test_list_books_returns_all():
    assert len(client.get("/api/books").get_json()) == 3


def test_filter_by_read():
    response = client.get("/api/books", query_string={"read": "true"})
    assert [b["title"] for b in response.get_json()] == ["The Hobbit"]


def test_get_unknown_book_returns_404_json():
    response = client.get("/api/books/999")
    assert response.status_code == 404
    assert response.get_json()["detail"] == "Book 999 not found"


def test_create_book():
    response = client.post(
        "/api/books", json={"title": "Dune", "author": "Frank Herbert", "year": 1965}
    )
    assert response.status_code == 201
    assert response.get_json()["id"] == 4
    assert response.get_json()["read"] is False


def test_create_book_with_invalid_year_returns_422():
    response = client.post("/api/books", json={"title": "X", "author": "Y", "year": -5})
    assert response.status_code == 422


def test_mark_as_read():
    response = client.patch("/api/books/2", json={"read": True})
    assert response.status_code == 200
    assert response.get_json()["read"] is True


def test_delete_book():
    assert client.delete("/api/books/1").status_code == 204
    assert client.get("/api/books/1").status_code == 404
