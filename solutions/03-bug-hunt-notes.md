# Solution 03: Bug Hunt: Notes App

## The 6 bugs

| # | Symptom | Where you find it | Root cause | Fix |
|---|---|---|---|---|
| 1 | "Failed to fetch" | **Console**: `blocked by CORS policy … No 'Access-Control-Allow-Origin'` | Backend allows origin `http://localhost:3000`, but Vite runs on **5173** | `allow_origins=["http://localhost:5173"]` |
| 2 | Note text empty | **Network** → Response shows `content` | `NoteCard` renders `note.text` (doesn't exist → `undefined` → renders nothing) | `note.content` |
| 3 | Blank "Invalid Date" card + key warning; empty-title error not shown | Console warning about `key`; `console.log(created)` shows `Promise {…}` | Missing `await`: `created` is a Promise, so `created.id`/`.title` are `undefined`. Errors are never caught | `const created = await api.createNote(...)` |
| 4 | Delete only visible after reload | Network shows `204`, so the backend is fine → frontend state | `notes.splice(...)` **mutates** the array; `setNotes(notes)` passes the **same** reference → React skips the re-render | `setNotes(prev => prev.filter(n => n.id !== id))` |
| 5 | Test `get_unknown_note_returns_404` fails with `KeyError` | pytest traceback | `notes[note_id]` raises `KeyError` → 500 in production | `if note_id not in notes: raise HTTPException(404, ...)` |
| 6 | Test `create_note_returns_201` fails `200 == 201` | pytest | POST route has no `status_code` | `@app.post(..., status_code=201)` |

## How to talk through bug 4 (example)

> "The DELETE request returns 204, so the backend works. The problem must be in the frontend state update.
> Here we `splice` the existing array and pass the same array to `setNotes`. React compares by reference, sees the
> same array, and skips the re-render. I'll use `filter`, which returns a new array."

## Discussion answers

- **DELETE of a missing note → 204?** Both are defensible. *Idempotent delete* (204 even if it's already gone) is common
  and makes retries safe. *Strict* (404) tells the client something was wrong. Pick one, say why, and be consistent
  across the API. Here, `GET` returns 404, so a strict 404 would be more consistent.
- **Why OPTIONS?** Here the browser calls a **different origin** (5173 → 8000) with a `Content-Type: application/json`
  header, so it first sends a CORS *preflight* (`OPTIONS`) to ask for permission. In project 02 the Vite proxy makes it
  the **same origin**, so there's no CORS check and no preflight.

## Final code (changed files)

**`backend/main.py`**

```python
"""
Notes API

Run:  uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

from datetime import datetime

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Notes API")

# The React dev server calls this API directly from the browser, so we must allow its origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # BUG 1 fixed: was :3000, but Vite runs on :5173
    allow_methods=["*"],
    allow_headers=["*"],
)


class NoteIn(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    content: str = Field(default="", max_length=2000)


class Note(NoteIn):
    id: int
    created_at: datetime


notes: dict[int, Note] = {
    1: Note(id=1, title="Welcome", content="This app has a few bugs. Find them!", created_at=datetime(2026, 10, 1, 9, 0)),
    2: Note(id=2, title="Shopping", content="Milk, Brezeln, apples", created_at=datetime(2026, 10, 2, 18, 30)),
    3: Note(id=3, title="Interview", content="Fri 30 Oct, 9:00. Talk out loud!", created_at=datetime(2026, 10, 3, 12, 0)),
}
next_id = 4


@app.get("/api/notes", response_model=list[Note])
def list_notes():
    # newest first
    return sorted(notes.values(), key=lambda note: note.created_at, reverse=True)


@app.get("/api/notes/{note_id}", response_model=Note)
def get_note(note_id: int):
    # BUG 5 fixed: notes[note_id] raised KeyError → 500. A missing resource must be a 404.
    if note_id not in notes:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Note {note_id} not found")
    return notes[note_id]


@app.post("/api/notes", response_model=Note, status_code=status.HTTP_201_CREATED)  # BUG 6 fixed: was 200
def create_note(note_in: NoteIn):
    global next_id
    note = Note(id=next_id, created_at=datetime.now(), **note_in.model_dump())
    notes[note.id] = note
    next_id += 1
    return note


@app.delete("/api/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int):
    notes.pop(note_id, None)
```

**`frontend/src/App.jsx`**

```jsx
import { useEffect, useState } from "react";
import * as api from "./api.js";
import NoteForm from "./components/NoteForm.jsx";
import NoteCard from "./components/NoteCard.jsx";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(""); // Task 7

  useEffect(() => {
    api
      .getNotes()
      .then(setNotes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(title, content) {
    try {
      // BUG 3 fixed: without `await`, `created` was a Promise, not a note,
      // and errors (e.g. 422 for an empty title) were never caught.
      const created = await api.createNote(title, content);
      setNotes((prev) => [created, ...prev]); // newest first
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteNote(id);
      // BUG 4 fixed: splice() mutated the SAME array, so React saw no change.
      // filter() returns a NEW array → React re-renders.
      setNotes((prev) => prev.filter((note) => note.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  // Task 7: derived list, case-insensitive search in title and content
  const query = search.trim().toLowerCase();
  const visibleNotes = notes.filter(
    (note) => note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query)
  );

  return (
    <div className="container">
      <h1>📝 Notes</h1>
      <NoteForm onAdd={handleAdd} />
      {error && <p className="error">⚠️ {error}</p>}
      {loading && <p>Loading…</p>}

      <input
        className="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search notes…"
        style={{ width: "100%", marginBottom: 12 }}
      />
      {!loading && visibleNotes.length === 0 && query && <p className="muted">No notes match "{search}".</p>}

      <div className="notes">
        {visibleNotes.map((note) => (
          <NoteCard key={note.id} note={note} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
```

**`frontend/src/components/NoteCard.jsx`**

```jsx
export default function NoteCard({ note, onDelete }) {
  const created = new Date(note.created_at).toLocaleString();

  return (
    <article className="note">
      <header>
        <h3>{note.title}</h3>
        <button onClick={() => onDelete(note.id)} aria-label={`Delete ${note.title}`}>
          🗑
        </button>
      </header>
      {/* BUG 2 fixed: the API field is `content`, not `text` (check the Network tab → Response) */}
      <p>{note.content}</p>
      <footer className="muted">{created}</footer>
    </article>
  );
}
```
