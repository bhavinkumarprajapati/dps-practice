import { useEffect, useState } from "react";
import * as api from "./api.js";
import EventCard from "./components/EventCard.jsx";

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getEvents()
      .then(setEvents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // The backend returns the updated event → replace it in the list.
  function replaceEvent(updated) {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }

  return (
    <div className="container wide">
      <h1>🎟 Event Booking</h1>
      {error && <p className="error">⚠️ {error}</p>}
      {loading && <p>Loading…</p>}
      <div className="grid">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onUpdated={replaceEvent} />
        ))}
      </div>
    </div>
  );
}
