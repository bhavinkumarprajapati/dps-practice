import { useState } from "react";

export default function NoteForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const ok = await onAdd(title, content);
    if (ok) {
      setTitle("");
      setContent("");
    }
  }

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write something…" rows={3} />
      <button type="submit" className="primary">
        Add note
      </button>
    </form>
  );
}
