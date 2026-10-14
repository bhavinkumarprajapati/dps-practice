# 05: Weather Board 🟢

**Stack:** FastAPI + React (**TypeScript**) · **Total time:** ~80 min · **Concepts:** adding a field end-to-end,
`response_model` filtering, TS types that mirror the API, derived display values, proper 404 handling in the UI

## The app

A board of weather cards. The data is **mock data** from `backend/data/weather.json` (no real weather service).
Each card loads its own city with `GET /api/weather/{city}`. You can add more cities by name.

```
05-weather-board/
├── backend/
│   ├── main.py                 ← FastAPI: GET /api/cities, GET /api/weather/{city}
│   ├── data/weather.json       ← the data. Look inside: it has MORE fields than the API returns!
│   └── test_main.py
└── frontend/src/
    ├── types.ts                ← TS interface Weather (must match the backend model)
    ├── api.ts                  ← typed fetch functions
    ├── App.tsx                 ← list of cities + "add city" form
    └── components/
        └── WeatherCard.tsx     ← loads + shows one city
```

## Run it

```powershell
# Terminal 1
cd projects\05-weather-board\backend
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2
cd projects\05-weather-board\frontend
npm install
npm run dev
npm run typecheck     # run this after every change!
```

## Before you start (5 min)

1. Open `data/weather.json` and http://localhost:8000/api/weather/Munich. Which fields are in the file but **not** in the API
   response? Which line of code decides that?
2. Add the city `munich` (lowercase), then `Atlantis`. What happens? Add `Munich` a second time. Check the console.

---

## Tasks

### Task 1: Humidity (15 min)
> *"Show the humidity on each card."*

- The API returns `humidity` (an integer, percent). Update the model + test.
- The TS type gets the field. The card shows `💧 40%`.
- `npm run typecheck` passes.

💬 Explain the order you worked in, and why `humidity` didn't show up in the API before.

### Task 2: °C / °F toggle (15 min)
> *"Our American partners want Fahrenheit."*

- A toggle button at the top: **°C** / **°F**. It switches **all** cards at once.
- °F = °C × 9/5 + 32, shown with one decimal: `55.0 °F`.
- Frontend only. The API keeps sending Celsius.

💬 Where does the unit state live, and why there?

### Task 3: Unknown cities and duplicates (20 min)
> *"Typing a wrong city creates a broken card. And 'munich' doesn't work, but 'Munich' does."*

- Backend: city lookup is **case-insensitive**. `GET /api/weather/munich` works and returns `"city": "Munich"`
  (the official spelling from the data).
- Frontend: when adding a city, **check it with the API first**:
  - Unknown → show `City 'Atlantis' not found` under the input and **don't** add a card.
  - Already on the board (any spelling) → show `Munich is already on the board`.
  - Otherwise add the card with the official name, and clear the input.
- Backend test for the case-insensitive lookup.

### Task 4: 5-day forecast (25 min)
> *"I want to plan my weekend."*

- Backend: `GET /api/weather/{city}/forecast` → a list of `{day, min_c, max_c, condition}` from the data. Unknown city → 404.
- Frontend: each card gets a **Show forecast** button. Clicking it loads the forecast (only then, not before!) and shows a
  small table: `Thu ☁️ 8° / 15°`. The button text switches to **Hide forecast**.
- The forecast respects the °C/°F toggle.

### Bonus
- A ✕ button on each card removes it.
- Remember the chosen cities in `localStorage`, so they survive a page reload.
- A "sort by temperature" option. (Tricky: the temperatures live inside the cards! What would you need to change?)

---

<details><summary>💡 Hints</summary>

- Task 1: `response_model=Weather` filters the output. Fields not in the model are dropped, so add `humidity: int` to `Weather`.
- Task 2: keep `unit` in `App` and pass it to every card as a prop: `type Unit = "C" | "F"`. Write a small helper
  `formatTemp(celsius: number, unit: Unit): string`.
- Task 3 backend: loop over `WEATHER` and compare `name.lower() == city.lower()`; return the official `name`.
- Task 3 frontend: `handleAdd` becomes `async`. `try { const w = await api.getWeather(name); ... } catch (err) { ... }`.
  For the duplicate check, compare lowercase names. In TS, `err` in a catch is `unknown`: `err instanceof Error ? err.message : "..."`.
- Task 4: a new interface `ForecastDay`. In the card: `const [forecast, setForecast] = useState<ForecastDay[] | null>(null)`.
  Load it in the click handler, not in `useEffect`.
</details>

Solution: [`solutions/05-weather-board.md`](../../solutions/05-weather-board.md)
