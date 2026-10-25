# 08: Event Booking 🟡

**Stack:** FastAPI + React (JavaScript) · **Total time:** ~75 min · **Concepts:** **business rules in the backend**,
choosing status codes (404 / 409 / 422), computed fields, writing your own tests, nested resource URLs

## The app

Book a seat at DPS events. Each event has a capacity and a list of attendee names (in memory).
Right now **anyone can book anything**: there are no rules yet. Making the rules is your job.

```
08-event-booking/
├── backend/
│   ├── main.py             ← Event model, seed data, routes
│   └── test_main.py
└── frontend/src/
    ├── api.js
    ├── App.jsx             ← loads events, replaces one when it changes
    └── components/
        └── EventCard.jsx   ← one event + its own booking form
```

**API right now**

| Method | URL | Body | Response |
|---|---|---|---|
| GET | `/api/events` | – | `200` events sorted by date: `{id, title, date, capacity, attendees: [..]}` |
| POST | `/api/events/{id}/bookings` | `{"name": "Anna"}` | `201` the updated event · `404` · `422` empty name |

## Run it

```powershell
# Terminal 1
cd projects\08-event-booking\backend
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2
cd projects\08-event-booking\frontend
npm install
npm run dev
```

## Before you start (5 min)

1. Book "Pitch Night" (capacity 3, already full) with your name. It works, and it shouldn't!
2. Book "Ben" twice on "React Workshop". Look at the browser console. Why the warning?
3. Why is the booking URL `/api/events/{id}/bookings` and not `/api/bookings`?

---

## Tasks

### Task 1: Seats left (15 min)
> *"I want to see at a glance if there's still space."*

- The API returns a new field `seats_left` (= capacity − number of attendees) for every event.
  It's **calculated**, not stored.
- The card shows `3 seats left` (green, class `seats`) or `Sold out` (red, classes `seats sold-out`).
- When sold out, the booking form is **not shown**.

### Task 2: Booking rules (25 min) ← the core of this project
> *"No overbooking, and nobody books twice."*

| Situation | Response |
|---|---|
| Event is full | **409** `{"detail": "Event is sold out"}` |
| Same name already booked (ignore case and spaces: `" anna "` = `"Anna"`) | **409** `{"detail": "Anna has already booked this event"}` |
| Event doesn't exist | **404** (already works) |

- **Write the tests first** (at least 3), see them fail, then implement.
- The frontend already shows the error under the card's form. Check that it does.

💬 Why 409 and not 400 or 422 here? Prepare a one-sentence answer.

### Task 3: Cancel a booking (20 min)
> *"I can't come after all."*

- `DELETE /api/events/{id}/bookings/{name}` → **204**. Name matching ignores case.
  No such booking → **404** `{"detail": "No booking for Fatima"}`.
- In the card, every attendee chip gets a small ✕ button that cancels that booking.
  After cancelling, the seat counter updates.
  (Tip: a 204 has no body, so how does the frontend get the updated event? Choose a strategy and explain it.)
- Tests for both cases.

### Bonus
- `GET /api/events?upcoming=true` hides events in the past ("Welcome Breakfast"). In the UI, a checkbox
  "Hide past events". Past events that are shown get the CSS class `past`.
- Booking a past event → **409** `"Event has already taken place"`.

---

## Interviewer follow-up questions
1. Why must the "sold out" rule live in the backend even though the frontend hides the form?
2. Two people click "Book" on the last seat at the exact same moment. What could go wrong, and how would a real database help?
3. `seats_left` is calculated, not stored. What are the pros and cons of storing it instead?
4. Is it a good idea to identify a booking by the person's **name**? What would you use in a real system?

---

<details><summary>💡 Hints</summary>

- Task 1: easiest is a Pydantic computed field:
  ```python
  from pydantic import computed_field
  class Event(BaseModel):
      ...
      @computed_field
      @property
      def seats_left(self) -> int:
          return self.capacity - len(self.attendees)
  ```
- Task 2: normalise once: `name = booking.name.strip()`, then compare `name.lower()` with `a.lower()` for each attendee.
- Task 3: `@app.delete("/api/events/{event_id}/bookings/{name}", status_code=204)`. In React, either re-fetch all events
  after a 204, or let the backend return **200 + the updated event** instead. Both are fine if you can explain why.
</details>

**Reference solution:** not in this branch. When you have finished all tasks, ask your mentor for the review / solution.
