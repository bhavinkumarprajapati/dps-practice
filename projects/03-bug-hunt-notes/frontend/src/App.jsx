import { useEffect, useState } from "react";
import * as api from "./api.js";
import NoteForm from "./components/NoteForm.jsx";
import NoteCard from "./components/NoteCard.jsx";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getNotes()
      .then(setNotes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(title, content) {
    try {
      const created = api.createNote(title, content);
      setNotes([created, ...notes]); // newest first
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
      const index = notes.findIndex((note) => note.id === id);
      notes.splice(index, 1);
      setNotes(notes);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <h1>📝 Notes</h1>
      <NoteForm onAdd={handleAdd} />
      {error && <p className="error">⚠️ {error}</p>}
      {loading && <p>Loading…</p>}
      <div className="notes">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
