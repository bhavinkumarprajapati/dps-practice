# 03: Bug Hunt: Notes App 🟢

**Stack:** FastAPI + React (JavaScript) · **Total time:** ~75 min · **Concepts:** debugging! DevTools (Console + Network),
reading tracebacks, CORS, `await`, immutable state, status codes

## The app

A simple notes app: list notes (newest first), add a note, delete a note.
**It is broken.** A colleague left 6 bugs in it before going on holiday. Your job is to find and fix them.

```
03-bug-hunt-notes/
├── backend/
│   ├── main.py          ← FastAPI routes + CORS config
│   └── test_main.py     ← 2 of 5 tests FAIL right now (that's part of the hunt)
└── frontend/src/
    ├── api.js           ← calls http://localhost:8000/api DIRECTLY (no Vite proxy in this project!)
    ├── App.jsx
    └── components/
        ├── NoteForm.jsx
        └── NoteCard.jsx
```

## Run it

```powershell
# Terminal 1
cd projects\03-bug-hunt-notes\backend
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2
cd projects\03-bug-hunt-notes\frontend
npm install
npm run dev
```
Open http://localhost:5173 **with DevTools open (F12)**.

## The rules of the hunt

For **every** bug, do these 4 steps, out loud (this is exactly what interviewers want to see):
1. **Reproduce**: what do you see? What did you expect?
2. **Locate the layer**: browser console? Network tab (request sent? status?)? Backend terminal? Test output?
3. **Explain the root cause** in one sentence *before* changing code.
4. **Fix + verify**: confirm the symptom is gone, and that you didn't break anything else.

Don't read the whole code looking for bugs. **Follow the symptoms.** In the interview you won't know where the bug is either.

---

## Bug reports from users (fix them in order)

### Bug report 1 (10 min)
> *"The app just says ⚠️ Failed to fetch. Nothing loads."*

Tip: the console message is long. Read it to the end.

### Bug report 2 (10 min)
> *"The notes load now, but they're all empty. Only the title and the date show."*

### Bug report 3 (15 min)
> *"When I add a note, an empty card with 'Invalid Date' appears. After a page reload it looks fine."*

Also look at the console warning. And: what happens now if you submit an **empty** title? Is the error shown?

### Bug report 4 (10 min)
> *"Delete does nothing! But after a reload, the note IS gone."*

### Bug report 5 + 6 (15 min)
> *"CI is red: 2 backend tests fail."*

Run `pytest -v` in the backend folder. Read each failure: what did the test expect, and what did it get?
Fix the **code**, not the tests. The tests describe the correct behaviour.

✅ All bugs are fixed when: the app loads, notes show their text, adding and deleting update the UI immediately,
an empty title shows an error, and `pytest` shows **5 passed**.

---

### Task 7: Feature (15 min)
> *"Now that it works: I need a search."*

- A search input above the notes. It filters by **title or content**, case-insensitive. Frontend only.
- If nothing matches: `No notes match "xyz".`

### Discussion questions (answer out loud)
- `DELETE /api/notes/999` returns 204 even though note 999 doesn't exist. Bug or OK? What would you choose, and why?
- Why does the browser send an `OPTIONS` request before some requests in this project but not in project 02?

---

<details><summary>💡 Hints (one per bug, open only the one you need)</summary>

1. CORS: which origin does the backend allow? Which origin is the frontend actually running on?
2. Network tab → `GET /api/notes` → Response. What is the field called? What does `NoteCard` use?
3. What does `api.createNote(...)` return if you don't `await` it?
4. `splice` changes the existing array. Does React re-render when you pass the **same** array to `setNotes`?
5. `KeyError: 999` → what should happen when a resource doesn't exist? See how other projects use `HTTPException`.
6. `assert 200 == 201`: which parameter of `@app.post(...)` sets the success status code?
</details>

Solution: [`solutions/03-bug-hunt-notes.md`](../../solutions/03-bug-hunt-notes.md)
