"""
Notes API

Run:  uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

from datetime import datetime

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Notes API")

# The React dev server calls this API directly from the browser, so we must allow its origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
    return notes[note_id]


@app.post("/api/notes", response_model=Note)
def create_note(note_in: NoteIn):
    global next_id
    note = Note(id=next_id, created_at=datetime.now(), **note_in.model_dump())
    notes[note.id] = note
    next_id += 1
    return note


@app.delete("/api/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int):
    notes.pop(note_id, None)
