"""
Same tests as the FastAPI version, so you can see the two backends behave identically.
Each test gets a brand-new database file in a temporary folder (pytest's tmp_path fixture).
Run from the backend-flask folder:  pytest -v
"""

import pytest

from app import create_app


@pytest.fixture
def client(tmp_path):
    app = create_app({"TESTING": True, "DATABASE": str(tmp_path / "test.db")})
    return app.test_client()


def test_list_is_empty_at_start(client):
    assert client.get("/api/items").get_json() == []


def test_create_and_list(client):
    response = client.post("/api/items", json={"name": "  Milk "})
    assert response.status_code == 201
    assert response.get_json() == {"id": 1, "name": "Milk", "bought": False}
    assert len(client.get("/api/items").get_json()) == 1


def test_create_with_empty_name_returns_422(client):
    assert client.post("/api/items", json={"name": ""}).status_code == 422


def test_mark_as_bought(client):
    client.post("/api/items", json={"name": "Milk"})
    response = client.patch("/api/items/1", json={"bought": True})
    assert response.status_code == 200
    assert response.get_json()["bought"] is True
    assert response.get_json()["name"] == "Milk"


def test_update_unknown_item_returns_404(client):
    assert client.patch("/api/items/42", json={"bought": True}).status_code == 404


def test_delete(client):
    client.post("/api/items", json={"name": "Milk"})
    assert client.delete("/api/items/1").status_code == 204
    assert client.get("/api/items").get_json() == []
