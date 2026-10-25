import { useState } from "react";

// Inline form in a table row: pick a member, confirm or cancel.
export default function LendForm({ members, onLend, onCancel }) {
  const [memberId, setMemberId] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (memberId) onLend(Number(memberId));
  }

  return (
    <form className="row lend-form" onSubmit={handleSubmit}>
      <select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
        <option value="">Choose member…</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
      <button type="submit" className="primary" disabled={!memberId}>
        Lend
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}
