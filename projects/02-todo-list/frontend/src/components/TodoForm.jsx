import { useState } from "react";

export default function TodoForm({ onAdd }) {
  const [title, setTitle] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const ok = await onAdd(title);
    if (ok) setTitle("");
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" />
      <button type="submit" className="primary">
        Add
      </button>
    </form>
  );
}
