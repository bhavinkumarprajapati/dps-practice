import copy

import pytest

import app as board

client = board.app.test_client()


@pytest.fixture(autouse=True)
def reset_data():
    saved, saved_next_id = copy.deepcopy(board.tasks), board.next_id
    yield
    board.tasks[:] = saved
    board.next_id = saved_next_id


def test_list_tasks():
    assert len(client.get("/api/tasks").get_json()) == 5


def test_create_task_starts_in_todo():
    response = client.post("/api/tasks", json={"title": "Write tests"})
    assert response.status_code == 201
    assert response.get_json() == {"id": 6, "title": "Write tests", "status": "todo"}


def test_create_task_without_title_returns_400():
    assert client.post("/api/tasks", json={}).status_code == 400
