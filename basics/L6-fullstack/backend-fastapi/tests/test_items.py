"""
API tests with a FRESH in-memory database for every test.

Trick: app.dependency_overrides replaces get_db with a version that uses a test database.
That's one big advantage of dependency injection: easy to swap in tests.
Run from the backend-fastapi folder:  pytest -v
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app


@pytest.fixture
def client():
    # "sqlite://" = in-memory DB. StaticPool keeps ONE connection so all sessions see the same data.
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    TestingSession = sessionmaker(bind=engine, autoflush=False)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)  # not using `with`, so the lifespan (seeding the real DB) doesn't run
    app.dependency_overrides.clear()


def test_list_is_empty_at_start(client):
    assert client.get("/api/items").json() == []


def test_create_and_list(client):
    response = client.post("/api/items", json={"name": "  Milk "})
    assert response.status_code == 201
    assert response.json() == {"id": 1, "name": "Milk", "bought": False}
    assert len(client.get("/api/items").json()) == 1


def test_create_with_empty_name_returns_422(client):
    assert client.post("/api/items", json={"name": ""}).status_code == 422


def test_mark_as_bought(client):
    client.post("/api/items", json={"name": "Milk"})
    response = client.patch("/api/items/1", json={"bought": True})
    assert response.status_code == 200
    assert response.json()["bought"] is True
    assert response.json()["name"] == "Milk"  # unchanged, because it wasn't sent


def test_update_unknown_item_returns_404(client):
    assert client.patch("/api/items/42", json={"bought": True}).status_code == 404


def test_delete(client):
    client.post("/api/items", json={"name": "Milk"})
    assert client.delete("/api/items/1").status_code == 204
    assert client.get("/api/items").json() == []
