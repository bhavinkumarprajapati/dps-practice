import copy

import pytest
from fastapi.testclient import TestClient

import main

client = TestClient(main.app)


@pytest.fixture(autouse=True)
def reset_data():
    saved_notes, saved_next_id = copy.deepcopy(main.notes), main.next_id
    yield
    main.notes.clear()
    main.notes.update(saved_notes)
    main.next_id = saved_next_id


def test_list_notes_newest_first():
    titles = [note["title"] for note in client.get("/api/notes").json()]
    assert titles == ["Interview", "Shopping", "Welcome"]


def test_get_note():
    response = client.get("/api/notes/2")
    assert response.status_code == 200
    assert response.json()["content"] == "Milk, Brezeln, apples"


def test_create_note_returns_201():
    response = client.post("/api/notes", json={"title": "New", "content": "Hello"})
    assert response.status_code == 201
    assert response.json()["id"] == 4


def test_get_unknown_note_returns_404():
    response = client.get("/api/notes/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Note 999 not found"


def test_delete_note():
    assert client.delete("/api/notes/1").status_code == 204
    assert len(client.get("/api/notes").json()) == 2
