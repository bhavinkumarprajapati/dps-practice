import { useState } from "react";
import * as api from "../api.js";

// Props: event, onUpdated(updatedEvent)
// This card calls the API itself for its own booking form, then tells the parent about the new event data.
export default function EventCard({ event, onUpdated }) {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  async function handleBook(e) {
    e.preventDefault();
    try {
      const updated = await api.bookEvent(event.id, name);
      onUpdated(updated);
      setName("");
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <article className="event-card">
      <h3>{event.title}</h3>
      <p className="muted">
        📅 {event.date.split("-").reverse().join(".")} · {event.attendees.length} / {event.capacity} booked
      </p>

      <ul className="attendees">
        {event.attendees.map((attendee) => (
          <li key={attendee}>{attendee}</li>
        ))}
      </ul>

      <form className="row" onSubmit={handleBook}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        <button type="submit" className="primary">
          Book
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </article>
  );
}
