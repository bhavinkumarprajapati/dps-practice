"""
Event Booking API (FastAPI, in-memory)

Run:  uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

from datetime import date, timedelta

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field

app = FastAPI(title="Event Booking API")


class Event(BaseModel):
    id: int
    title: str
    date: date
    capacity: int
    attendees: list[str]


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


@app.get("/api/events", response_model=list[Event])
def list_events():
    return sorted(events.values(), key=lambda e: e.date)


@app.post("/api/events/{event_id}/bookings", response_model=Event, status_code=status.HTTP_201_CREATED)
def book_event(event_id: int, booking: BookingIn):
    event = get_event_or_404(event_id)
    event.attendees.append(booking.name.strip())
    return event
