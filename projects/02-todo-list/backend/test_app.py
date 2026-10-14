import copy

import pytest

import app as todo_app

client = todo_app.app.test_client()


@pytest.fixture(autouse=True)
def reset_data():
    saved_todos, saved_next_id = copy.deepcopy(todo_app.todos), todo_app.next_id
    yield
    todo_app.todos[:] = saved_todos
    todo_app.next_id = saved_next_id


def test_list_todos():
    response = client.get("/api/todos")
    assert response.status_code == 200
    assert len(response.get_json()) == 3


def test_create_todo():
    response = client.post("/api/todos", json={"title": "  Buy milk  "})
    assert response.status_code == 201
    assert response.get_json() == {"id": 4, "title": "Buy milk", "done": False}


def test_create_todo_without_title_returns_400():
    response = client.post("/api/todos", json={"title": "   "})
    assert response.status_code == 400
    assert response.get_json()["detail"] == "title is required"
