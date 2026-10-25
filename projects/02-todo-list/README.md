# 02: Todo List 🟢

**Stack:** Flask + React (JavaScript) · **Total time:** ~75 min · **Concepts:** REST verbs (DELETE, PATCH),
status codes 200/201/204/404, list rendering, callback props through 2 levels, derived values

## The app

A todo list stored in memory in a **Flask** backend. You can see the todos and add new ones. That's all, so far.

```
02-todo-list/
├── backend/
│   ├── app.py              ← Flask routes: GET /api/todos, POST /api/todos
│   └── test_app.py
└── frontend/src/
    ├── api.js              ← fetch calls
    ├── App.jsx             ← owns the todos state
    └── components/
        ├── TodoForm.jsx    ← input + Add
        ├── TodoList.jsx    ← renders the list (or "No todos yet")
        └── TodoItem.jsx    ← one row
```

**API right now**

| Method | URL | Body | Response |
|---|---|---|---|
| GET | `/api/todos` | – | `200` list of `{id, title, done}` |
| POST | `/api/todos` | `{"title": "..."}` | `201` the new todo · `400` empty title |

## Run it

```powershell
# Terminal 1
cd projects\02-todo-list\backend
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
flask --app app run --debug --port 8000

# Terminal 2
cd projects\02-todo-list\frontend
npm install
npm run dev
```
App: http://localhost:5173 · API: http://localhost:8000/api/todos · Tests: `pytest -v`

## Before you start (5 min)

1. Try adding an empty todo. Where does the error message come from: React or Flask?
2. Draw the component tree (App → …) with the props on each arrow.

---

## Tasks

### Task 1: Delete a todo (15 min)
> *"I added something by mistake and want to remove it."*

- Backend: `DELETE /api/todos/<id>` → **204** (empty body). Unknown id → **404** `{"detail": "Todo 99 not found"}`.
- Frontend: a 🗑 button on each row removes the todo.
- Test: deleting works, and deleting an unknown id gives 404.

✅ Done when: the row disappears and stays gone after a page reload.

### Task 2: Mark as done (20 min)
> *"I want to tick off what I've finished."*

- Backend: `PATCH /api/todos/<id>` with body `{"done": true}` → **200** + the updated todo.
  If `done` is missing or not a boolean → **400** `{"detail": "done must be true or false"}`.
- Frontend: a checkbox in front of each title. Done todos are shown ~~struck through~~ (the CSS class `done` already exists).
- Test: PATCH works; `{"done": "yes"}` gives 400.

✅ Done when: ticking survives a page reload.

### Task 3: Open counter (10 min)
> *"How much is left?"*

Below the list, show:
- `2 open tasks` (plural) / `1 open task` (singular) / `All done 🎉` (0 open, at least 1 todo)
- Nothing if there are no todos at all.

No backend change! 💬 Explain why this should **not** be a new piece of state.

### Task 4: Filter (20 min)
> *"I only want to see what's still open."*

- Three buttons: **All** · **Open** · **Done**. The active one has the CSS class `active`.
- The list shows only the matching todos. The counter from Task 3 still counts **all** open todos.
- When the filter shows nothing: `No open todos` / `No done todos` instead of an empty list.

### Bonus
- **Clear completed:** `DELETE /api/todos/completed` deletes all done todos and returns `200 {"deleted": 2}`.
  Add a "Clear completed" button, disabled when nothing is done.
- **No duplicates:** adding a title that already exists (case-insensitive) → **409**, shown in the UI.

---

<details><summary>💡 Hints</summary>

- Flask: `@app.delete("/api/todos/<int:todo_id>")` → `todos.remove(todo)` → `return "", 204`.
- Flask: `@app.patch(...)`, `data = request.get_json(silent=True) or {}`, `isinstance(data.get("done"), bool)`.
- React: the click happens in `TodoItem`, but the state lives in `App`. Pass `onDelete` / `onToggle` from App → TodoList → TodoItem.
- Removing from state: `setTodos(prev => prev.filter(t => t.id !== id))`.
  Replacing one item: `setTodos(prev => prev.map(t => t.id === updated.id ? updated : t))`.
- Plural: ``${n} open ${n === 1 ? "task" : "tasks"}``
- Filter: `const [filter, setFilter] = useState("all")`, then calculate `visibleTodos` from `todos` + `filter`.
- Bonus: in Flask, `/api/todos/completed` and `/api/todos/<int:todo_id>` don't clash. Why not?
</details>

**Reference solution:** not in this branch. When you have finished all tasks, ask your mentor for the review / solution.
