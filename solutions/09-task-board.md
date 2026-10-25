# Solution 09: Task Board

## How to approach it (what to say out loud)

1. **Task 1:** *"Moving changes one field, so PATCH. The backend validates against `STATUSES`, and I build the error
   message from that same list so it can never be outdated. In React, a column knows its neighbours by index, so
   `statuses[index - 1]` and `statuses[index + 1]` give the targets, and `undefined` at the edges hides the button."*
2. **Task 2:** *"I'm only moving code, not changing behaviour. `App` owns the data and the API calls. `Column` and
   `TaskCard` are presentational: data comes in as props, and user actions go out through `onMove` / `onDelete`."*
3. **Task 3:** *"Because the columns come from one list, adding Review is one line in the backend. Without the bonus,
   it's one line in `COLUMNS` in the frontend too. The arrows follow automatically."*
4. **Task 4:** *"The limit is a business rule, so 409 from the backend. I only check when a task **enters** the column.
   Otherwise you couldn't even PATCH a task that's already there. The limit lives in one config dict."*

## Key decisions

| Question | Choice | Why |
|---|---|---|
| Error message for invalid status | Built from `STATUSES` | Adding "review" updates the message automatically. |
| Where's the column order? | One list (`STATUSES`) | Order + neighbours + validation all come from one place. |
| Dumb components | `Column`, `TaskCard` get props only | Easy to test, reuse and reason about. One owner of state. |
| WIP limit config | `WIP_LIMITS = {"doing": 2}` (+ endpoint) | One place to change; the UI reads it instead of hard-coding 2. |
| Loading 3 things at once | `Promise.all([...])` | Parallel requests, one `.catch` for all. |

## Answers to the follow-up questions

1. **Server validation:** the frontend isn't the only client, and it can have bugs or old code. The server must never
   store a status the board can't display.
2. **Dumb components:** they render the same output for the same props → predictable, easy to test, reusable (e.g. a
   second board). All logic stays in one place (`App`).
3. **WIP limit location:** in backend config (or a database setting per board), exposed to the frontend through the API,
   like `/api/wip-limits` here. Never hard-coded in two places.
4. **Drag & drop:** only the *trigger* changes (drop event instead of button click). It still calls
   `onMove(task, newStatus)` → same PATCH, same 409 handling. Good structure makes UI changes cheap.

## Final code (changed and new files)

**`backend/app.py`**

```python
"""
Task Board API (Flask, in-memory). A mini Kanban board.

Run:  flask --app app run --debug --port 8000
Try:  http://localhost:8000/api/tasks
"""

from flask import Flask, abort, jsonify, request

app = Flask(__name__)

STATUSES = ["todo", "doing", "review", "done"]  # the board's columns, in order (Task 3: one-line change)
WIP_LIMITS = {"doing": 2}  # Task 4: max number of tasks per column (columns not listed = no limit)

tasks = [
    {"id": 1, "title": "Interview users", "status": "done"},
    {"id": 2, "title": "Write user stories", "status": "doing"},
    {"id": 3, "title": "Sketch the UI", "status": "todo"},
    {"id": 4, "title": "Set up CI pipeline", "status": "todo"},
    {"id": 5, "title": "Build login page", "status": "todo"},
]
next_id = 6


@app.errorhandler(400)
def bad_request(error):
    return jsonify({"detail": error.description}), 400


@app.errorhandler(404)
def not_found(error):
    return jsonify({"detail": error.description}), 404


@app.errorhandler(409)  # Task 4
def conflict(error):
    return jsonify({"detail": error.description}), 409


def find_task(task_id):
    for task in tasks:
        if task["id"] == task_id:
            return task
    abort(404, description=f"Task {task_id} not found")


# Bonus: the single source of truth for the columns (+ limits, so the UI can show "2 / 2")
@app.get("/api/statuses")
def list_statuses():
    return jsonify(STATUSES)


@app.get("/api/wip-limits")
def list_wip_limits():
    return jsonify(WIP_LIMITS)


@app.get("/api/tasks")
def list_tasks():
    return jsonify(tasks)


@app.post("/api/tasks")
def create_task():
    global next_id
    data = request.get_json(silent=True) or {}
    title = data.get("title")
    if not isinstance(title, str) or not title.strip():
        abort(400, description="title is required")
    task = {"id": next_id, "title": title.strip(), "status": "todo"}  # new tasks always start in "todo"
    next_id += 1
    tasks.append(task)
    return task, 201


# Task 1 (+ Task 4)
@app.patch("/api/tasks/<int:task_id>")
def move_task(task_id):
    task = find_task(task_id)
    data = request.get_json(silent=True) or {}
    new_status = data.get("status")
    if new_status not in STATUSES:
        abort(400, description=f"status must be one of: {', '.join(STATUSES)}")

    # Task 4: only check when a task ENTERS a limited column
    limit = WIP_LIMITS.get(new_status)
    if limit is not None and task["status"] != new_status:
        count = sum(1 for t in tasks if t["status"] == new_status)
        if count >= limit:
            abort(409, description=f"WIP limit reached: {new_status} already has {count} tasks")

    task["status"] = new_status
    return task


# Bonus
@app.delete("/api/tasks/<int:task_id>")
def delete_task(task_id):
    tasks.remove(find_task(task_id))
    return "", 204
```

**`backend/test_app.py`**

```python
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


def move(task_id, status):
    return client.patch(f"/api/tasks/{task_id}", json={"status": status})


def test_list_tasks():
    assert len(client.get("/api/tasks").get_json()) == 5


def test_create_task_starts_in_todo():
    response = client.post("/api/tasks", json={"title": "Write tests"})
    assert response.status_code == 201
    assert response.get_json() == {"id": 6, "title": "Write tests", "status": "todo"}


def test_create_task_without_title_returns_400():
    assert client.post("/api/tasks", json={}).status_code == 400


# Task 1
def test_move_task():
    response = move(3, "doing")
    assert response.status_code == 200
    assert response.get_json()["status"] == "doing"


def test_move_with_invalid_status_returns_400():
    response = move(3, "blocked")
    assert response.status_code == 400
    assert response.get_json()["detail"] == "status must be one of: todo, doing, review, done"


def test_move_unknown_task_returns_404():
    assert move(99, "doing").status_code == 404


# Task 3
def test_review_column_exists():
    assert move(2, "review").get_json()["status"] == "review"


# Task 4
def test_wip_limit():
    assert move(3, "doing").status_code == 200  # now 2 in doing
    response = move(4, "doing")
    assert response.status_code == 409
    assert response.get_json()["detail"] == "WIP limit reached: doing already has 2 tasks"


def test_wip_limit_does_not_block_tasks_already_in_column():
    move(3, "doing")
    assert move(2, "doing").status_code == 200  # task 2 is already in doing


# Bonus
def test_statuses_endpoint():
    assert client.get("/api/statuses").get_json() == ["todo", "doing", "review", "done"]


def test_delete_task():
    assert client.delete("/api/tasks/1").status_code == 204
    assert len(client.get("/api/tasks").get_json()) == 4
```

**`frontend/src/api.js`**

```js
async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.detail === "string" ? body.detail : `Request failed (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function getTasks() {
  return request("/tasks");
}

export function createTask(title) {
  return request("/tasks", { method: "POST", body: JSON.stringify({ title }) });
}

// Task 1
export function moveTask(id, status) {
  return request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
}

// Bonus
export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: "DELETE" });
}

export function getStatuses() {
  return request("/statuses");
}

export function getWipLimits() {
  return request("/wip-limits");
}
```

**`frontend/src/App.jsx`**

```jsx
import { useEffect, useState } from "react";
import * as api from "./api.js";
import Column from "./components/Column.jsx";

// Display names. Anything not listed gets a capitalised version of its status, e.g. "review" → "Review".
const TITLES = { todo: "To do" };
const titleFor = (status) => TITLES[status] ?? status[0].toUpperCase() + status.slice(1);

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [statuses, setStatuses] = useState([]); // Bonus: columns come from the API (single source of truth)
  const [wipLimits, setWipLimits] = useState({}); // Task 4
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    // three independent requests in parallel
    Promise.all([api.getTasks(), api.getStatuses(), api.getWipLimits()])
      .then(([tasksData, statusesData, limitsData]) => {
        setTasks(tasksData);
        setStatuses(statusesData);
        setWipLimits(limitsData);
      })
      .catch((err) => setError(err.message));
  }, []);

  async function handleAdd(event) {
    event.preventDefault();
    try {
      const created = await api.createTask(newTitle);
      setTasks((prev) => [...prev, created]);
      setNewTitle("");
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  // Task 1
  async function handleMove(task, newStatus) {
    try {
      const updated = await api.moveTask(task.id, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setError(null);
    } catch (err) {
      setError(err.message); // e.g. the WIP-limit 409 message
    }
  }

  // Bonus
  async function handleDelete(task) {
    try {
      await api.deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="board-page">
      <h1>🗂 Task Board</h1>

      <form className="todo-form" onSubmit={handleAdd}>
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New task…" />
        <button type="submit" className="primary">
          Add
        </button>
      </form>
      {error && <p className="error">⚠️ {error}</p>}

      {/* Task 2: App keeps the state; Column/TaskCard only get props */}
      <div className="board">
        {statuses.map((status, index) => (
          <Column
            key={status}
            title={titleFor(status)}
            tasks={tasks.filter((task) => task.status === status)}
            limit={wipLimits[status]}
            prevStatus={statuses[index - 1]} // undefined for the first column
            nextStatus={statuses[index + 1]} // undefined for the last column
            onMove={handleMove}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
```

**`frontend/src/components/Column.jsx`**

```jsx
import TaskCard from "./TaskCard.jsx";

// Task 2: a "dumb" component. Everything comes in as props, nothing is fetched or stored here.
export default function Column({ title, tasks, limit, prevStatus, nextStatus, onMove, onDelete }) {
  const isFull = limit !== undefined && tasks.length >= limit; // Task 4

  return (
    <section className={`column ${isFull ? "full" : ""}`}>
      <h2>
        {title}{" "}
        <span className="count">{limit !== undefined ? `${tasks.length} / ${limit}` : tasks.length}</span>
      </h2>
      {tasks.length === 0 && <p className="muted">Nothing here</p>}
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          prevStatus={prevStatus}
          nextStatus={nextStatus}
          onMove={onMove}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}
```

**`frontend/src/components/TaskCard.jsx`**

```jsx
// Task 1 + 2: one card with ← / → buttons. prevStatus/nextStatus are undefined at the edges → no button.
export default function TaskCard({ task, prevStatus, nextStatus, onMove, onDelete }) {
  return (
    <div className="task-card">
      <span>{task.title}</span>
      <div className="moves">
        {prevStatus && (
          <button onClick={() => onMove(task, prevStatus)} aria-label={`Move ${task.title} to ${prevStatus}`}>
            ←
          </button>
        )}
        {nextStatus && (
          <button onClick={() => onMove(task, nextStatus)} aria-label={`Move ${task.title} to ${nextStatus}`}>
            →
          </button>
        )}
        <button onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`}>
          🗑
        </button>
      </div>
    </div>
  );
}
```
