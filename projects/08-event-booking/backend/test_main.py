import pytest
from fastapi.testclient import TestClient

import main

client = TestClient(main.app)


@pytest.fixture(autouse=True)
def reset_events():
    main.events.clear()
    main.events.update(main.make_seed_events())
    yield


def test_list_events_sorted_by_date():
    titles = [e["title"] for e in client.get("/api/events").json()]
    assert titles == ["Welcome Breakfast", "React Workshop", "Design Thinking 101", "Pitch Night"]


def test_book_event():
    response = client.post("/api/events/1/bookings", json={"name": " Fatima "})
    assert response.status_code == 201
    assert response.json()["attendees"] == ["Anna", "Ben", "Fatima"]


def test_book_unknown_event_returns_404():
    assert client.post("/api/events/99/bookings", json={"name": "Fatima"}).status_code == 404
