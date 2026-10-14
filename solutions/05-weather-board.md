# Solution 05: Weather Board

## How to approach it (what to say out loud)

1. **Task 1:** *"`humidity` is in the JSON file but not in the response, because `response_model=Weather` only returns the
   declared fields. So it's a one-line change in the model. Then the TS interface, then the card. `typecheck` confirms
   I didn't miss anything."*
2. **Task 2:** *"Every card needs the unit, so the state goes in the common parent, `App`, and comes down as a prop.
   The conversion is a pure helper `formatTemp`, so the API stays in Celsius: one source of truth."*
3. **Task 3:** *"I validate with the backend before adding, because only the backend knows which cities exist. The
   backend returns the official spelling, which I store. That makes the duplicate check simple."*
4. **Task 4:** *"The forecast is loaded lazily in the click handler, not in `useEffect`, so we don't send 5 extra requests
   when the page opens. I cache it in state, so hiding and showing again doesn't re-fetch."*

## Key decisions

| Question | Choice | Why |
|---|---|---|
| Where does `unit` live? | `App` | Shared by all cards → lift state up. |
| Convert in backend or frontend? | Frontend | It's a display concern; the data stays in one unit. |
| Case-insensitive lookup | Loop + `lower()` in `find_city` | One helper used by both endpoints (DRY), returns the canonical name. |
| When to load the forecast | On click, once | Lazy loading = fewer requests; caching in state = no duplicates. |
| `localStorage` with try/catch | Yes | It can be disabled or hold invalid JSON. Never let it crash the app. |
| `useState(loadSavedCities)` (no parentheses!) | Lazy initial state | The function runs only on the first render, not on every render. |

**Bonus "sort by temperature":** the temperatures live inside each card's own state, so `App` can't sort by them.
You'd need to **lift the weather data up**: `App` loads all cities (or an endpoint `GET /api/weather?cities=a,b,c`)
and passes each card its `weather` as a prop. Explaining this trade-off is worth more than the code.

## Final code (changed files)

**`backend/main.py`**

```python
"""
Weather Board API (mock data from data/weather.json, no real weather service)

Run:  uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

import json
from pathlib import Path

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

app = FastAPI(title="Weather Board API")

DATA_FILE = Path(__file__).parent / "data" / "weather.json"
# { "Munich": {"temperature_c": 12.4, "condition": "Cloudy", ...}, ... }
WEATHER = json.loads(DATA_FILE.read_text(encoding="utf-8"))


class Weather(BaseModel):
    city: str
    temperature_c: float
    condition: str
    wind_kph: int
    humidity: int  # Task 1


class ForecastDay(BaseModel):  # Task 4
    day: str
    min_c: float
    max_c: float
    condition: str


def find_city(city: str) -> str:
    """Task 3: case-insensitive lookup. Returns the official spelling, or raises 404."""
    for name in WEATHER:
        if name.lower() == city.strip().lower():
            return name
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"City '{city}' not found")


@app.get("/api/cities", response_model=list[str])
def list_cities():
    return sorted(WEATHER.keys())


@app.get("/api/weather/{city}", response_model=Weather)
def get_weather(city: str):
    name = find_city(city)
    # response_model=Weather only returns the fields declared in the model; extra keys in the data are dropped
    return {"city": name, **WEATHER[name]}


# Task 4
@app.get("/api/weather/{city}/forecast", response_model=list[ForecastDay])
def get_forecast(city: str):
    return WEATHER[find_city(city)]["forecast"]
```

**`backend/test_main.py`**

```python
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_list_cities():
    cities = client.get("/api/cities").json()
    assert "Munich" in cities
    assert cities == sorted(cities)


def test_get_weather():
    response = client.get("/api/weather/Munich")
    assert response.status_code == 200
    body = response.json()
    assert body["city"] == "Munich"
    assert set(body) == {"city", "temperature_c", "condition", "wind_kph", "humidity"}  # Task 1


def test_unknown_city_returns_404():
    response = client.get("/api/weather/Atlantis")
    assert response.status_code == 404
    assert response.json()["detail"] == "City 'Atlantis' not found"


# Task 3
def test_city_lookup_is_case_insensitive():
    response = client.get("/api/weather/mUnIcH")
    assert response.status_code == 200
    assert response.json()["city"] == "Munich"


# Task 4
def test_forecast():
    forecast = client.get("/api/weather/berlin/forecast").json()
    assert len(forecast) == 5
    assert set(forecast[0]) == {"day", "min_c", "max_c", "condition"}


def test_forecast_unknown_city_returns_404():
    assert client.get("/api/weather/Atlantis/forecast").status_code == 404
```

**`frontend/src/types.ts`**

```ts
// Must match the backend's Pydantic response models in backend/main.py
export interface Weather {
  city: string;
  temperature_c: number;
  condition: string;
  wind_kph: number;
  humidity: number; // Task 1
}

// Task 4
export interface ForecastDay {
  day: string;
  min_c: number;
  max_c: number;
  condition: string;
}

// Task 2
export type Unit = "C" | "F";

export function formatTemp(celsius: number, unit: Unit, decimals = 1): string {
  const value = unit === "C" ? celsius : (celsius * 9) / 5 + 32;
  return `${value.toFixed(decimals)} °${unit}`;
}
```

**`frontend/src/api.ts`**

```ts
import type { ForecastDay, Weather } from "./types";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`/api${path}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.detail === "string" ? body.detail : `Request failed (${response.status})`);
  }
  return response.json();
}

export function getCities(): Promise<string[]> {
  return request<string[]>("/cities");
}

export function getWeather(city: string): Promise<Weather> {
  // encodeURIComponent: city names could contain spaces or special characters
  return request<Weather>(`/weather/${encodeURIComponent(city)}`);
}

// Task 4
export function getForecast(city: string): Promise<ForecastDay[]> {
  return request<ForecastDay[]>(`/weather/${encodeURIComponent(city)}/forecast`);
}
```

**`frontend/src/App.tsx`**

```tsx
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import * as api from "./api";
import type { Unit } from "./types";
import WeatherCard from "./components/WeatherCard";

const DEFAULT_CITIES = ["Munich", "Berlin", "Hamburg"];
const STORAGE_KEY = "weather-board-cities"; // Bonus

// Bonus: read saved cities once (try/catch: localStorage can be blocked or contain garbage)
function loadSavedCities(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return Array.isArray(saved) ? saved : DEFAULT_CITIES;
  } catch {
    return DEFAULT_CITIES;
  }
}

export default function App() {
  const [cities, setCities] = useState<string[]>(loadSavedCities);
  const [newCity, setNewCity] = useState("");
  const [addError, setAddError] = useState<string | null>(null); // Task 3
  const [unit, setUnit] = useState<Unit>("C"); // Task 2: lives here because ALL cards need it

  // Bonus: save whenever the list changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
    } catch {
      // ignore (e.g. private mode)
    }
  }, [cities]);

  // Task 3: validate with the API before adding a card
  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newCity.trim();
    if (!name) return;

    try {
      const weather = await api.getWeather(name); // throws on 404
      const official = weather.city; // "munich" → "Munich"
      if (cities.some((c) => c.toLowerCase() === official.toLowerCase())) {
        setAddError(`${official} is already on the board`);
        return;
      }
      setCities((prev) => [...prev, official]);
      setNewCity("");
      setAddError(null);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Could not add city");
    }
  }

  // Bonus
  function handleRemove(city: string) {
    setCities((prev) => prev.filter((c) => c !== city));
  }

  return (
    <div className="container wide">
      <div className="toolbar-top">
        <h1>🌤 Weather Board</h1>
        {/* Task 2 */}
        <div className="row">
          <button className={unit === "C" ? "active" : ""} onClick={() => setUnit("C")}>
            °C
          </button>
          <button className={unit === "F" ? "active" : ""} onClick={() => setUnit("F")}>
            °F
          </button>
        </div>
      </div>

      <form className="add-city" onSubmit={handleAdd}>
        <input
          value={newCity}
          onChange={(e) => {
            setNewCity(e.target.value);
            setAddError(null);
          }}
          placeholder="Add a city, e.g. Garching"
        />
        <button type="submit" className="primary">
          Add
        </button>
      </form>
      {addError && <p className="error">{addError}</p>}

      <div className="cards">
        {cities.map((city) => (
          <WeatherCard key={city} city={city} unit={unit} onRemove={handleRemove} />
        ))}
      </div>
    </div>
  );
}
```

**`frontend/src/components/WeatherCard.tsx`**

```tsx
import { useEffect, useState } from "react";
import * as api from "../api";
import { formatTemp } from "../types";
import type { ForecastDay, Unit, Weather } from "../types";

const ICONS: Record<string, string> = {
  Sunny: "☀️",
  Cloudy: "☁️",
  Rainy: "🌧",
  Windy: "💨",
  Foggy: "🌫",
};

type WeatherCardProps = {
  city: string;
  unit: Unit; // Task 2
  onRemove: (city: string) => void; // Bonus
};

// Each card loads its own data when it appears (and again if `city` changes).
export default function WeatherCard({ city, unit, onRemove }: WeatherCardProps) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [failed, setFailed] = useState(false);
  // Task 4: null = not loaded yet; we only load it when the user asks for it
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
  const [showForecast, setShowForecast] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getWeather(city)
      .then(setWeather)
      .catch(() => setFailed(true));
  }, [city]);

  async function toggleForecast() {
    if (!showForecast && forecast === null) {
      try {
        setForecast(await api.getForecast(city)); // load on first open only
      } catch (err) {
        setForecastError(err instanceof Error ? err.message : "Could not load forecast");
      }
    }
    setShowForecast(!showForecast);
  }

  const removeButton = (
    <button className="remove" onClick={() => onRemove(city)} aria-label={`Remove ${city}`}>
      ✕
    </button>
  );

  if (failed) return <div className="weather-card">{removeButton}Something went wrong.</div>;
  if (!weather) return <div className="weather-card">Loading…</div>;

  return (
    <div className="weather-card">
      {removeButton}
      <h3>{weather.city}</h3>
      <div className="icon">{ICONS[weather.condition] ?? "🌡"}</div>
      <div className="temp">{formatTemp(weather.temperature_c, unit)}</div>
      <div className="muted">{weather.condition}</div>
      <div className="muted">💨 {weather.wind_kph} km/h</div>
      <div className="muted">💧 {weather.humidity}%</div>

      {/* Task 4 */}
      <button onClick={toggleForecast} style={{ marginTop: 8 }}>
        {showForecast ? "Hide forecast" : "Show forecast"}
      </button>
      {showForecast && forecastError && <p className="error">{forecastError}</p>}
      {showForecast && forecast && (
        <table className="forecast">
          <tbody>
            {forecast.map((day) => (
              <tr key={day.day}>
                <td>{day.day}</td>
                <td>{ICONS[day.condition] ?? "🌡"}</td>
                <td>
                  {formatTemp(day.min_c, unit, 0)} / {formatTemp(day.max_c, unit, 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

## Common mistakes

- Adding `humidity` to the TS interface only. TypeScript is happy, but the value is `undefined`, because the API doesn't send it.
  **TS types don't check the real API response!**
- Converting °F by changing the stored data (`weather.temperature_c = ...`). Toggling twice then gives nonsense.
- `catch (err) { setAddError(err.message) }` → TS error: `err` is `unknown`. Use `err instanceof Error`.
- Loading the forecast in a `useEffect` with `[showForecast]`. It works, but it's harder to read and easy to make loop.
