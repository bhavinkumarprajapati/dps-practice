/*
 * LESSON 5: Forms (controlled inputs)
 * -----------------------------------
 * A CONTROLLED input: React state is the single source of truth for what's in the input.
 *   <input value={title} onChange={(e) => setTitle(e.target.value)} />
 *     - value={title}  → the input shows the state
 *     - onChange       → every keystroke updates the state
 *
 * Submitting:
 *   <form onSubmit={handleSubmit}>  +  <button type="submit">
 *   function handleSubmit(event) { event.preventDefault(); ... }
 *   preventDefault() stops the browser's default behaviour (reloading the page!).
 *   Using a <form> means pressing Enter also submits. 👍
 *
 * Checkbox: checked={x} and e.target.checked (not .value!)
 * Number input: e.target.value is ALWAYS a string → convert with Number(...)
 *
 * 🧪 TRY IT
 *   a) Add a "priority" <select> (low / medium / high) and show it in the list.
 *   b) Validation: the title must be at least 3 characters, otherwise show an error message.
 *   c) Disable the submit button while the title is empty:  disabled={title.trim() === ""}
 *   d) Show a live character counter under the input: "12 / 50".
 */
import { useState } from "react";

export default function Lesson5Forms() {
  // one piece of state per input
  const [title, setTitle] = useState("");
  const [hours, setHours] = useState(1);
  const [urgent, setUrgent] = useState(false);
  const [error, setError] = useState("");
  const [entries, setEntries] = useState([]);

  function handleSubmit(event) {
    event.preventDefault(); // ← don't reload the page

    if (title.trim() === "") {
      setError("Please enter a title.");
      return;
    }

    const newEntry = { id: Date.now(), title: title.trim(), hours: Number(hours), urgent };
    setEntries([...entries, newEntry]); // new array = old items + new item

    // reset the form
    setTitle("");
    setHours(1);
    setUrgent(false);
    setError("");
  }

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

  return (
    <>
      <h1>Lesson 5: Forms</h1>

      <form className="card" onSubmit={handleSubmit}>
        <h3>Plan a study session</h3>
        <p>
          <label>
            Topic:{" "}
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. useEffect" />
          </label>
        </p>
        <p>
          <label>
            Hours:{" "}
            <input type="number" min="1" max="8" value={hours} onChange={(e) => setHours(e.target.value)} />
          </label>
        </p>
        <p>
          <label>
            <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} /> Urgent
          </label>
        </p>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="primary">Add session</button>
      </form>

      <div className="card">
        <h3>Planned: {totalHours} h</h3>
        {entries.length === 0 ? (
          <p>Nothing planned yet.</p>
        ) : (
          <ul>
            {entries.map((entry) => (
              <li key={entry.id}>
                {entry.urgent && "🔥 "}
                {entry.title}: {entry.hours} h
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="note">Live state (for debugging): {JSON.stringify({ title, hours, urgent })}</p>
    </>
  );
}
