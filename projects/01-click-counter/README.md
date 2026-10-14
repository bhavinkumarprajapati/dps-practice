# 01: Click Counter 🟢

**Stack:** FastAPI + React (JavaScript) · **Total time:** ~75 min · **Concepts:** running both servers,
`useState`, `useEffect`, `fetch` POST, FastAPI routes, business rules on both sides

## The app

A counter stored **in the backend** (in memory). The page shows the value and a **+1** button.
Each click sends `POST /api/counter/increment` and shows the new value returned by the server.

```
01-click-counter/
├── backend/
│   ├── main.py          ← all routes (GET /api/counter, POST /api/counter/increment)
│   └── test_main.py     ← pytest
└── frontend/src/
    ├── api.js           ← fetch calls
    └── App.jsx          ← the whole UI
```

## Run it

```powershell
# Terminal 1
cd projects\01-click-counter\backend
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2
cd projects\01-click-counter\frontend
npm install
npm run dev
```
App: http://localhost:5173 · API docs: http://localhost:8000/docs · Tests: `pytest -v`

## Before you start (5 min, no coding)

1. Click **+1** a few times. Open DevTools → Network: which request is sent, and what's the response?
2. Restart the backend. What happens to the value? Why?
3. Find in `App.jsx`: where is the value loaded? Where does `counter` come from after a click?

---

## Tasks

Start a timer for each task. Talk out loud. Commit after each one.

### Task 1: Decrement (10 min)
> *"Users made a typo and want to undo a click."*

- A **−1** button to the left of +1.
- It calls a new endpoint `POST /api/counter/decrement` that lowers the value by 1 and returns the counter.

✅ Done when: clicking −1 lowers the value, and the value is still correct after reloading the page.

### Task 2: Reset (15 min)
> *"We need a way to start over."*

- `POST /api/counter/reset` sets the value to 0.
- A **Reset** button. Before resetting, ask the user to confirm (`window.confirm("Reset the counter?")`).
- Add a test for the reset endpoint in `test_main.py`.

✅ Done when: Reset → confirm → shows 0. Reset → cancel → nothing changes. `pytest` passes.

### Task 3: Never below zero (20 min)
> *"Negative clicks make no sense."*

- **Backend:** decrementing when the value is 0 returns **409 Conflict** with
  `detail: "Counter cannot go below 0"`, and the value stays 0.
- **Frontend:** the −1 button is **disabled** when the value is 0.
- Test: decrement at 0 returns 409.

💬 Be ready to explain *why* you need the rule in **both** places (hint: who else could call the API?).

✅ Done when: the button is greyed out at 0; calling the endpoint in `/docs` at 0 gives 409.

### Task 4: "Last updated" (20 min)
> *"Show when the counter was last changed."*

- The API response gets a new field `updated_at`: the date-time of the last change, or `null` if it never changed.
  It is set by increment, decrement and reset.
- The page shows `Last updated: 14:32:05` (local time) under the buttons, or `Never updated`.

✅ Done when: the time updates on every click, and it shows "Never updated" after a backend restart.

### Bonus (if you have time)
- **Step size:** `POST /api/counter/increment?step=5`. The step must be between 1 and 10 (otherwise 422).
  Add a `<select>` with 1 / 5 / 10 in the UI.
- Show a short "Saving…" state while a request is running, and disable the buttons meanwhile.

---

<details><summary>💡 Hints</summary>

- Task 1: copy the `increment` route and change it. In `api.js`, copy `increment()`.
- Task 2: `if (!window.confirm("Reset the counter?")) return;`
- Task 3: `from fastapi import HTTPException`, then `raise HTTPException(status_code=409, detail="...")`.
  Frontend: `disabled={counter.value === 0}`.
- Task 4: `from datetime import datetime`; the model gets `updated_at: datetime | None = None`;
  `counter["updated_at"] = datetime.now()`. In React: `new Date(counter.updated_at).toLocaleTimeString()`.
- Bonus: `step: int = Query(1, ge=1, le=10)` (`from fastapi import Query`).
</details>

Solution: [`solutions/01-click-counter.md`](../../solutions/01-click-counter.md). Open it only after you've tried!
