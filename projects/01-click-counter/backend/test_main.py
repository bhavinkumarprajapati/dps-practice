import pytest
from fastapi.testclient import TestClient

import main

client = TestClient(main.app)


@pytest.fixture(autouse=True)
def reset_counter():
    main.counter.clear()
    main.counter.update({"value": 0})
    yield


def test_counter_starts_at_zero():
    response = client.get("/api/counter")
    assert response.status_code == 200
    assert response.json()["value"] == 0


def test_increment():
    client.post("/api/counter/increment")
    response = client.post("/api/counter/increment")
    assert response.status_code == 200
    assert response.json()["value"] == 2
    assert client.get("/api/counter").json()["value"] == 2
