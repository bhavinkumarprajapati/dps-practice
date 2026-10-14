from app import app

client = app.test_client()


def test_list_books():
    response = client.get("/api/books")
    assert response.status_code == 200
    assert len(response.get_json()) == 15


def test_get_book():
    response = client.get("/api/books/4")
    assert response.status_code == 200
    assert response.get_json()["title"] == "Dune"


def test_get_unknown_book_returns_404():
    response = client.get("/api/books/99")
    assert response.status_code == 404
    assert response.get_json()["detail"] == "Book 99 not found"
