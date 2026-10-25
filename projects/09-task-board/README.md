# 09: Task Board 🟡

**Stack:** Flask + React (JavaScript) · **Total time:** ~75 min · **Concepts:** PATCH with validation, **splitting a
component** (props down, callbacks up), keeping one source of truth for a list of allowed values, a business rule (WIP limit)

## The app

A mini Kanban board, like the ones DPS teams use every day. Tasks live in three columns: **To do → Doing → Done**.
You can add tasks (they start in "To do"), but you **can't move them yet**.

⚠️ The whole frontend is **one big component** in `App.jsx`. That's on purpose (see Task 2).

```
09-task-board/
├── backend/
│   ├── app.py          ← STATUSES list, tasks, GET + POST
│   └── test_app.py
└── frontend/src/
    ├── api.js
    └── App.jsx         ← everything: form, columns, cards
```

## Run it

```powershell
# Terminal 1
cd projects\09-task-board\backend
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
flask --app app run --debug --port 8000

# Terminal 2
cd projects\09-task-board\frontend
npm install
npm run dev
```

## Before you start (5 min)

1. Find **both** places where the list of columns/statuses is defined. What could go wrong with having two lists?
2. How does each column know which tasks to show?

---

## Tasks

### Task 1: Move cards (20 min)
> *"I started working on 'Sketch the UI', so it should be in Doing."*

- `PATCH /api/tasks/<id>` with `{"status": "doing"}` → **200** + the updated task. Unknown id → **404**.
  Invalid status → **400** `{"detail": "status must be one of: todo, doing, done"}`. Build the message from `STATUSES`!
- Each card gets **←** and **→** buttons that move it one column left/right. No ← in the first column, no → in the last.
- Tests: moving works; invalid status → 400.

### Task 2: Refactor (15 min) ← no new features, same behaviour
> *"App.jsx is getting too big to work with."*

- Move the column into `components/Column.jsx` and the card into `components/TaskCard.jsx`.
- `App` keeps the state and the API calls. The new components only get **props**.
- Everything works exactly as before.

💬 Say out loud which props each component needs, and why the state stays in `App`.

### Task 3: A "Review" column (15 min)
> *"Our team does code reviews before 'done'."*

- New column **Review** between Doing and Done (status `review`).
- If your code is well-structured, this should be a **one-line change in the backend and one in the frontend**. Is it?
  Moving with ←/→ must go through Review automatically.

### Task 4: WIP limit (20 min)
> *"Don't start too many things at once: at most 2 tasks in Doing."*

- Backend: moving a task **into** `doing` when it already has 2 tasks → **409**
  `{"detail": "WIP limit reached: doing already has 2 tasks"}`. Moving a task that's already in doing is not affected.
- Frontend: the Doing header shows `2 / 2`. When the column is full, it gets the CSS class `full` (red header).
  A blocked move shows the backend message.
- Test for the 409.

### Bonus
- `GET /api/statuses` returns `["todo", "doing", "review", "done"]`. The frontend builds its columns **from the API**
  instead of its own list. Now there's only one list in the whole project.
- A 🗑 button to delete a task.

---

## Interviewer follow-up questions
1. Why did you validate the status on the server, if the frontend only ever sends valid ones?
2. What's the benefit of `Column` and `TaskCard` being "dumb" components that only receive props?
3. The WIP limit is 2. If the team wants to change it, where should that number live?
4. How would you implement drag & drop instead of buttons? What stays the same?

---

<details><summary>💡 Hints</summary>

- Task 1, Flask: `if data.get("status") not in STATUSES: abort(400, description=f"status must be one of: {', '.join(STATUSES)}")`.
- Task 1, React: the column index tells you the neighbours: `COLUMNS[index - 1]` and `COLUMNS[index + 1]`.
  The card needs `onMove(task, newStatus)`.
- Task 2: `Column` props: `column`, `tasks`, `prevStatus`, `nextStatus`, `onMove`. `TaskCard` props: `task`, `prevStatus`, `nextStatus`, `onMove`.
- Task 4: count with `sum(1 for t in tasks if t["status"] == "doing")`. Only check when `new_status == "doing" and task["status"] != "doing"`.
  Put `WIP_LIMITS = {"doing": 2}` next to `STATUSES`.
</details>

**Reference solution:** not in this branch. When you have finished all tasks, ask your mentor for the review / solution.
