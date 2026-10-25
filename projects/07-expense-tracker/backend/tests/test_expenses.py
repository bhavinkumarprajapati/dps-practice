"""
API tests with a fresh in-memory database for every test (see the client fixture).
Run from the backend folder:  pytest -v
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

GROCERIES = {"description": "Groceries", "amount": 20.5, "spent_on": "2026-10-20"}


@pytest.fixture
def client():
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
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_create_and_list(client):
    response = client.post("/api/expenses", json=GROCERIES)
    assert response.status_code == 201
    assert response.json() == {"id": 1, **GROCERIES}
    assert len(client.get("/api/expenses").json()) == 1


def test_list_is_newest_first(client):
    client.post("/api/expenses", json={**GROCERIES, "spent_on": "2026-10-01"})
    client.post("/api/expenses", json={**GROCERIES, "spent_on": "2026-10-15"})
    dates = [e["spent_on"] for e in client.get("/api/expenses").json()]
    assert dates == ["2026-10-15", "2026-10-01"]


def test_negative_amount_returns_422(client):
    assert client.post("/api/expenses", json={**GROCERIES, "amount": -5}).status_code == 422


def test_delete(client):
    client.post("/api/expenses", json=GROCERIES)
    assert client.delete("/api/expenses/1").status_code == 204
    assert client.delete("/api/expenses/1").status_code == 404
