# Solution 08: Event Booking

## How to approach it (what to say out loud)

1. **Task 1:** *"`seats_left` is derived from capacity and attendees, so I calculate it instead of storing it. Then it can
   never get out of sync. A Pydantic `computed_field` adds it to every response automatically."*
2. **Task 2:** *"These are business rules, so they belong in the backend. I wrote the tests first: sold out, double
   booking, last seat. I normalise the name once with `strip()`, and compare with `lower()`. I use 409 Conflict because the
   request itself is well-formed, but it conflicts with the current state of the event."*
3. **Task 3:** *"DELETE returns 204 with no body, so the frontend doesn't get the new event back. I re-load the list after
   cancelling. It's one extra request, but simple and always correct. The alternative would be returning 200 with the event."*

## Status codes in this project

| Code | When | Why this one |
|---|---|---|
| 201 | Booking created | A new booking resource exists now |
| 204 | Booking cancelled | Success, nothing to return |
| 404 | Unknown event / no such booking | The resource doesn't exist |
| 409 | Sold out, double booking, past event | Valid request, but it **conflicts with the current state** |
| 422 | Empty name | The **body** has the wrong shape. Pydantic does this automatically |

## Answers to the follow-up questions

1. **Rule in the backend:** the UI can be bypassed (DevTools, curl, a second tab with old data). Only the server sees the
   true current state.
2. **Race condition:** both requests read "1 seat left", both append → overbooked. A real DB helps with a **transaction +
   constraint or row lock** (e.g. `SELECT ... FOR UPDATE`, or a `UNIQUE(event_id, user_id)` plus a capacity check in the
   same transaction).
3. **Stored vs calculated:** stored is faster to read and easy to query ("all events with seats left"), but it must be
   updated on every booking/cancel and can drift. Calculated is always correct.
4. **Name as identifier:** no. Two people can be called "Anna", and names change. Use a **user id** (after login) and give
   each booking its own id: `DELETE /api/bookings/{booking_id}`.

## Final code (changed files)

**`backend/main.py`**

```python
"""
Event Booking API (FastAPI, in-memory)

Run:  uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

from datetime import date, timedelta

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field, computed_field

app = FastAPI(title="Event Booking API")


class Event(BaseModel):
    id: int
    title: str
    date: date
    capacity: int
    attendees: list[str]

    # Task 1: calculated on every response, never stored, so it can't get out of sync
    @computed_field
    @property
    def seats_left(self) -> int:
        return self.capacity - len(self.attendees)


class BookingIn(BaseModel):
    name: str = Field(min_length=1, max_length=50)


def make_seed_events() -> dict[int, Event]:
    today = date.today()
    return {
        1: Event(id=1, title="React Workshop", date=today + timedelta(days=3), capacity=5, attendees=["Anna", "Ben"]),
        2: Event(id=2, title="Pitch Night", date=today + timedelta(days=10), capacity=3, attendees=["Chen", "Dana", "Eli"]),
        3: Event(id=3, title="Design Thinking 101", date=today + timedelta(days=6), capacity=10, attendees=[]),
        4: Event(id=4, title="Welcome Breakfast", date=today - timedelta(days=2), capacity=20, attendees=["Anna"]),
    }


events: dict[int, Event] = make_seed_events()


def get_event_or_404(event_id: int) -> Event:
    if event_id not in events:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event {event_id} not found")
    return events[event_id]


def find_attendee(event: Event, name: str) -> str | None:
    """Case-insensitive lookup. Returns the stored spelling, or None."""
    for attendee in event.attendees:
        if attendee.lower() == name.strip().lower():
            return attendee
    return None


@app.get("/api/events", response_model=list[Event])
def list_events(upcoming: bool = False):  # Bonus
    result = sorted(events.values(), key=lambda e: e.date)
    if upcoming:
        result = [e for e in result if e.date >= date.today()]
    return result


@app.post("/api/events/{event_id}/bookings", response_model=Event, status_code=status.HTTP_201_CREATED)
def book_event(event_id: int, booking: BookingIn):
    event = get_event_or_404(event_id)
    name = booking.name.strip()

    # Task 2 + Bonus: business rules → 409 Conflict (the request is valid, but conflicts with the current state)
    if event.date < date.today():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Event has already taken place")
    if event.seats_left <= 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Event is sold out")
    existing = find_attendee(event, name)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"{existing} has already booked this event")

    event.attendees.append(name)
    return event


# Task 3
@app.delete("/api/events/{event_id}/bookings/{name}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_booking(event_id: int, name: str):
    event = get_event_or_404(event_id)
    attendee = find_attendee(event, name)
    if attendee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No booking for {name}")
    event.attendees.remove(attendee)
```

**`backend/test_main.py`**

```python
import pytest
from fastapi.testclient import TestClient

import main

client = TestClient(main.app)


@pytest.fixture(autouse=True)
def reset_events():
    main.events.clear()
    main.events.update(main.make_seed_events())
    yield


def book(event_id, name):
    return client.post(f"/api/events/{event_id}/bookings", json={"name": name})


def test_list_events_sorted_by_date():
    titles = [e["title"] for e in client.get("/api/events").json()]
    assert titles == ["Welcome Breakfast", "React Workshop", "Design Thinking 101", "Pitch Night"]


def test_book_event():
    response = book(1, " Fatima ")
    assert response.status_code == 201
    assert response.json()["attendees"] == ["Anna", "Ben", "Fatima"]


def test_book_unknown_event_returns_404():
    assert book(99, "Fatima").status_code == 404


# Task 1
def test_seats_left_is_calculated():
    event = client.get("/api/events").json()[1]  # React Workshop: 5 seats, 2 attendees
    assert event["seats_left"] == 3
    assert book(1, "Fatima").json()["seats_left"] == 2


# Task 2
def test_sold_out_returns_409():
    response = book(2, "Fatima")  # Pitch Night is full
    assert response.status_code == 409
    assert response.json()["detail"] == "Event is sold out"
    assert len(client.get("/api/events").json()[3]["attendees"]) == 3  # nothing was added


def test_double_booking_returns_409_ignoring_case():
    response = book(1, "  anna ")
    assert response.status_code == 409
    assert response.json()["detail"] == "Anna has already booked this event"  # stored spelling


def test_can_book_last_seat_then_sold_out():
    for name in ["C", "D", "E"]:
        assert book(1, name).status_code == 201
    assert book(1, "F").status_code == 409


# Task 3
def test_cancel_booking():
    assert client.delete("/api/events/2/bookings/DANA").status_code == 204
    assert client.get("/api/events").json()[3]["attendees"] == ["Chen", "Eli"]
    assert book(2, "Fatima").status_code == 201  # the freed seat can be booked


def test_cancel_unknown_booking_returns_404():
    response = client.delete("/api/events/1/bookings/Fatima")
    assert response.status_code == 404
    assert response.json()["detail"] == "No booking for Fatima"


# Bonus
def test_upcoming_hides_past_events():
    titles = [e["title"] for e in client.get("/api/events", params={"upcoming": "true"}).json()]
    assert "Welcome Breakfast" not in titles


def test_cannot_book_past_event():
    assert book(4, "Fatima").json()["detail"] == "Event has already taken place"
```

**`frontend/src/api.js`**

```js
async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    let message = `Request failed (${response.status})`;
    if (typeof body.detail === "string") message = body.detail;
    else if (Array.isArray(body.detail)) message = body.detail.map((d) => `${d.loc.at(-1)}: ${d.msg}`).join(", ");
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

// Bonus: upcoming=true hides past events
export function getEvents({ upcoming = false } = {}) {
  return request(upcoming ? "/events?upcoming=true" : "/events");
}

export function bookEvent(eventId, name) {
  return request(`/events/${eventId}/bookings`, { method: "POST", body: JSON.stringify({ name }) });
}

// Task 3. encodeURIComponent: names can contain spaces or special characters
export function cancelBooking(eventId, name) {
  return request(`/events/${eventId}/bookings/${encodeURIComponent(name)}`, { method: "DELETE" });
}
```

**`frontend/src/App.jsx`**

```jsx
import { useEffect, useState } from "react";
import * as api from "./api.js";
import EventCard from "./components/EventCard.jsx";

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hidePast, setHidePast] = useState(false); // Bonus

  // Task 3: after a cancel (204, no body) we re-load the list, so loading lives in a reusable function
  function loadEvents() {
    return api
      .getEvents({ upcoming: hidePast })
      .then((data) => {
        setEvents(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadEvents();
  }, [hidePast]);

  // After a booking the backend returns the updated event → replace it in the list.
  function replaceEvent(updated) {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }

  // Local date as "YYYY-MM-DD", so it can be compared with event.date strings (same format → string compare works)
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return (
    <div className="container wide">
      <h1>🎟 Event Booking</h1>
      <label className="filters">
        <input type="checkbox" checked={hidePast} onChange={(e) => setHidePast(e.target.checked)} /> Hide past events
      </label>
      {error && <p className="error">⚠️ {error}</p>}
      {loading && <p>Loading…</p>}
      <div className="grid">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isPast={event.date < today}
            onUpdated={replaceEvent}
            onCancelled={loadEvents}
          />
        ))}
      </div>
    </div>
  );
}
```

**`frontend/src/components/EventCard.jsx`**

```jsx
import { useState } from "react";
import * as api from "../api.js";

// Props: event, isPast, onUpdated(updatedEvent), onCancelled()
// This card calls the API itself for its own actions, then tells the parent.
export default function EventCard({ event, isPast, onUpdated, onCancelled }) {
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
      setError(err.message); // e.g. "Event is sold out" from the backend (409)
    }
  }

  // Task 3: DELETE returns 204 without a body, so we ask the parent to reload the events
  async function handleCancel(attendee) {
    try {
      await api.cancelBooking(event.id, attendee);
      setError(null);
      await onCancelled();
    } catch (err) {
      setError(err.message);
    }
  }

  const soldOut = event.seats_left <= 0; // Task 1

  return (
    <article className={`event-card ${isPast ? "past" : ""}`}>
      <h3>{event.title}</h3>
      <p className="muted">
        📅 {event.date.split("-").reverse().join(".")} · {event.attendees.length} / {event.capacity} booked
      </p>
      {/* Task 1 */}
      <p className={soldOut ? "seats sold-out" : "seats"}>
        {soldOut ? "Sold out" : `${event.seats_left} ${event.seats_left === 1 ? "seat" : "seats"} left`}
      </p>

      <ul className="attendees">
        {event.attendees.map((attendee) => (
          <li key={attendee}>
            {attendee}
            {/* Task 3 */}
            <button onClick={() => handleCancel(attendee)} aria-label={`Cancel booking for ${attendee}`}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      {/* Task 1: no form when sold out */}
      {!soldOut && (
        <form className="row" onSubmit={handleBook}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <button type="submit" className="primary">
            Book
          </button>
        </form>
      )}
      {error && <p className="error">{error}</p>}
    </article>
  );
}
```
