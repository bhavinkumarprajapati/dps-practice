# Solution 02: Todo List

## How to approach it (what to say out loud)

1. *"The click happens in `TodoItem`, but the list lives in `App`. So I pass `onDelete` and `onToggle` down through
   `TodoList` to `TodoItem`. Data goes down, events go up."*
2. *"After DELETE I remove the item locally with `filter`. After PATCH I replace it with the server's version using `map`.
   I never mutate the array."*
3. *"The open counter and the filtered list are **derived** from `todos`, so I calculate them during render.
   A second `useState` for them could get out of sync."*
4. *"In Flask I validate by hand: `isinstance(data.get('done'), bool)`. Note that `'yes'` or `1` aren't booleans."*

## Key decisions

| Question | Choice | Why |
|---|---|---|
| DELETE response | `"", 204` | Nothing useful to return; 204 = success, no body. |
| PATCH body validation | 400 if `done` isn't a bool | Same style as the existing 400 for an empty title. Follow the codebase! |
| Filter: frontend or backend? | Frontend | The full list is already loaded and small. For thousands of todos → backend `?done=false`. |
| `/api/todos/completed` vs `/<int:todo_id>` | No clash in Flask | `<int:...>` only matches digits. In FastAPI, route order would matter. |
| `todos[:] = [...]` | Modify in place | Keeps the same list object that other code (and the tests) reference. |

## Final code (changed files only)

**`backend/app.py`**

```python
"""
Todo List API (Flask, in-memory)

Run:  flask --app app run --debug --port 8000
"""

from flask import Flask, abort, jsonify, request

app = Flask(__name__)

todos = [
    {"id": 1, "title": "Set up Python and Node", "done": True},
    {"id": 2, "title": "Finish the basics course", "done": False},
    {"id": 3, "title": "Practise project 02", "done": False},
]
next_id = 4


# ---------- JSON error responses (instead of Flask's default HTML pages) ----------
@app.errorhandler(400)
def bad_request(error):
    return jsonify({"detail": error.description}), 400


@app.errorhandler(404)
def not_found(error):
    return jsonify({"detail": error.description}), 404


@app.errorhandler(409)  # Bonus
def conflict(error):
    return jsonify({"detail": error.description}), 409


def find_todo(todo_id):
    for todo in todos:
        if todo["id"] == todo_id:
            return todo
    abort(404, description=f"Todo {todo_id} not found")


# ---------- routes ----------
@app.get("/api/todos")
def list_todos():
    return jsonify(todos)


@app.post("/api/todos")
def create_todo():
    global next_id
    data = request.get_json(silent=True) or {}
    title = data.get("title")
    if not isinstance(title, str) or not title.strip():
        abort(400, description="title is required")
    if len(title.strip()) > 100:
        abort(400, description="title must be at most 100 characters")
    # Bonus: no duplicates
    if any(t["title"].lower() == title.strip().lower() for t in todos):
        abort(409, description=f'"{title.strip()}" is already on the list')

    todo = {"id": next_id, "title": title.strip(), "done": False}
    next_id += 1
    todos.append(todo)
    return todo, 201


# Bonus: defined with a fixed path. It can't clash with <int:todo_id> because "completed" isn't an int.
@app.delete("/api/todos/completed")
def clear_completed():
    before = len(todos)
    todos[:] = [t for t in todos if not t["done"]]  # [:] = change the list in place, keep the same object
    return {"deleted": before - len(todos)}


# Task 1
@app.delete("/api/todos/<int:todo_id>")
def delete_todo(todo_id):
    todo = find_todo(todo_id)
    todos.remove(todo)
    return "", 204


# Task 2
@app.patch("/api/todos/<int:todo_id>")
def update_todo(todo_id):
    todo = find_todo(todo_id)
    data = request.get_json(silent=True) or {}
    if not isinstance(data.get("done"), bool):
        abort(400, description="done must be true or false")
    todo["done"] = data["done"]
    return todo
```

**`backend/test_app.py`**

```python
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


# Task 1
def test_delete_todo():
    assert client.delete("/api/todos/1").status_code == 204
    assert [t["id"] for t in client.get("/api/todos").get_json()] == [2, 3]


def test_delete_unknown_todo_returns_404():
    response = client.delete("/api/todos/99")
    assert response.status_code == 404
    assert response.get_json()["detail"] == "Todo 99 not found"


# Task 2
def test_mark_done():
    response = client.patch("/api/todos/2", json={"done": True})
    assert response.status_code == 200
    assert response.get_json() == {"id": 2, "title": "Finish the basics course", "done": True}


def test_mark_done_with_invalid_value_returns_400():
    response = client.patch("/api/todos/2", json={"done": "yes"})
    assert response.status_code == 400


# Bonus
def test_clear_completed():
    response = client.delete("/api/todos/completed")
    assert response.get_json() == {"deleted": 1}
    assert all(not t["done"] for t in client.get("/api/todos").get_json())


def test_duplicate_title_returns_409():
    assert client.post("/api/todos", json={"title": "practise PROJECT 02"}).status_code == 409
```

**`frontend/src/api.js`**

```js
// All backend calls for todos.

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

export function getTodos() {
  return request("/todos");
}

export function createTodo(title) {
  return request("/todos", { method: "POST", body: JSON.stringify({ title }) });
}

// Task 1
export function deleteTodo(id) {
  return request(`/todos/${id}`, { method: "DELETE" });
}

// Task 2
export function setDone(id, done) {
  return request(`/todos/${id}`, { method: "PATCH", body: JSON.stringify({ done }) });
}

// Bonus
export function clearCompleted() {
  return request("/todos/completed", { method: "DELETE" });
}
```

**`frontend/src/App.jsx`**

```jsx
import { useEffect, useState } from "react";
import * as api from "./api.js";
import TodoForm from "./components/TodoForm.jsx";
import TodoList from "./components/TodoList.jsx";

const FILTERS = ["all", "open", "done"]; // Task 4

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // Task 4

  useEffect(() => {
    api
      .getTodos()
      .then(setTodos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(title) {
    try {
      const created = await api.createTodo(title);
      setTodos((prev) => [...prev, created]);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  // Task 1
  async function handleDelete(id) {
    try {
      await api.deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  // Task 2
  async function handleToggle(todo) {
    try {
      const updated = await api.setDone(todo.id, !todo.done);
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  // Bonus
  async function handleClearCompleted() {
    try {
      await api.clearCompleted();
      setTodos((prev) => prev.filter((t) => !t.done));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  // Derived values: calculated from state on every render (no extra useState!)
  const openCount = todos.filter((t) => !t.done).length; // Task 3
  const doneCount = todos.length - openCount;
  const visibleTodos = todos.filter((t) => (filter === "open" ? !t.done : filter === "done" ? t.done : true)); // Task 4

  let summary = ""; // Task 3
  if (todos.length > 0) {
    summary = openCount === 0 ? "All done 🎉" : `${openCount} open ${openCount === 1 ? "task" : "tasks"}`;
  }

  return (
    <div className="container">
      <h1>✅ Todo List</h1>
      <TodoForm onAdd={handleAdd} />
      {error && <p className="error">⚠️ {error}</p>}

      {/* Task 4 */}
      <div className="row" style={{ marginBottom: 8 }}>
        {FILTERS.map((f) => (
          <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <TodoList
          todos={visibleTodos}
          emptyText={filter === "all" ? "No todos yet." : `No ${filter} todos`}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      )}

      <div className="toolbar">
        <span className="muted">{summary}</span>
        <button onClick={handleClearCompleted} disabled={doneCount === 0}>
          Clear completed
        </button>
      </div>
    </div>
  );
}
```

**`frontend/src/components/TodoList.jsx`**

```jsx
import TodoItem from "./TodoItem.jsx";

export default function TodoList({ todos, emptyText, onToggle, onDelete }) {
  if (todos.length === 0) {
    return <p className="muted">{emptyText}</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}
```

**`frontend/src/components/TodoItem.jsx`**

```jsx
export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li>
      <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo)} />
      <span className={todo.done ? "title done" : "title"}>{todo.title}</span>
      <button onClick={() => onDelete(todo.id)} aria-label={`Delete ${todo.title}`}>
        🗑
      </button>
    </li>
  );
}
```

## Common mistakes

- `todos.splice(i, 1); setTodos(todos)`: same array → React sees "no change" → the UI doesn't update.
- `response.json()` on a **204** response → error "Unexpected end of JSON input". `api.js` handles 204 already. Check that you didn't bypass it.
- Forgetting `<int:todo_id>` → `todo_id` is a string `"2"` and `todo["id"] == "2"` is never true → always 404.
- Making the counter count only the *visible* todos. The task says it should count **all** open todos.
