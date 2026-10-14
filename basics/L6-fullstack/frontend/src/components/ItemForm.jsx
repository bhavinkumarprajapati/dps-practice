import { useState } from "react";

// Props: onAdd(name) → async, returns true if the item was saved
export default function ItemForm({ onAdd }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const ok = await onAdd(name);
    setSaving(false);
    if (ok) setName(""); // only clear the input if the backend accepted it
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="What do you need?" />
      <button type="submit" className="primary" disabled={saving}>
        {saving ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
