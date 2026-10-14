# Solution 01: Click Counter

> Open this only after you've tried every task. Your solution doesn't have to look identical.
> What matters: it works, it handles the error case, and you can **explain** it.

## How to approach it (what to say out loud)

1. *"There's one source of truth: the backend. The frontend only displays what the server returns, so after each
   POST I replace my state with the response."*
2. *"For decrement I copy the increment route. That's the existing pattern."*
3. *"The 'not below zero' rule must be in the backend, because anyone can call the API directly, for example with curl or
   Swagger. Disabling the button in the frontend is only for user experience."*
4. *"For `updated_at` I created one helper `set_value()` that every route uses, so no route can forget to update the timestamp."*

## Key decisions

| Question | Choice | Why |
|---|---|---|
| Status code for "below zero"? | **409 Conflict** | The request is well-formed, but it conflicts with the current state. (400 would also be acceptable; say why you chose it.) |
| Where to check the rule? | **Both** | Backend = correctness and security. Frontend = nicer UX (button disabled). |
| Step size validation? | `Query(1, ge=1, le=10)` | FastAPI returns 422 automatically, with no manual `if` needed. |
| Repeated try/catch in React? | One `run(apiCall)` helper | Same pattern for 3 buttons → less duplication (DRY). |

## Final code

**`backend/main.py`**

```python
"""
Click Counter API

Run:  uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

from datetime import datetime

from fastapi import FastAPI, HTTPException, Query, status
from pydantic import BaseModel

app = FastAPI(title="Click Counter API")


class Counter(BaseModel):
    value: int
    updated_at: datetime | None = None  # Task 4


# The counter lives in memory, so it resets to 0 when the server restarts.
counter = {"value": 0, "updated_at": None}


def set_value(new_value: int):
    """One place that changes the value, so updated_at can never be forgotten (Task 4)."""
    counter["value"] = new_value
    counter["updated_at"] = datetime.now()
    return counter


@app.get("/api/counter", response_model=Counter)
def get_counter():
    return counter


@app.post("/api/counter/increment", response_model=Counter)
def increment(step: int = Query(1, ge=1, le=10)):  # Bonus: step size
    return set_value(counter["value"] + step)


# Task 1 + Task 3
@app.post("/api/counter/decrement", response_model=Counter)
def decrement():
    if counter["value"] <= 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Counter cannot go below 0")
    return set_value(counter["value"] - 1)


# Task 2
@app.post("/api/counter/reset", response_model=Counter)
def reset():
    return set_value(0)
```

**`backend/test_main.py`**

```python
import pytest
from fastapi.testclient import TestClient

import main

client = TestClient(main.app)


@pytest.fixture(autouse=True)
def reset_counter():
    main.counter.clear()
    main.counter.update({"value": 0, "updated_at": None})
    yield


def test_counter_starts_at_zero():
    response = client.get("/api/counter")
    assert response.status_code == 200
    assert response.json()["value"] == 0


def test_increment():
    client.post("/api/counter/increment")
    response = client.post("/api/counter/increment")
    assert response.status_code == 200
    assert response.json()["value"] == 2
    assert client.get("/api/counter").json()["value"] == 2


def test_decrement():
    client.post("/api/counter/increment")
    response = client.post("/api/counter/decrement")
    assert response.status_code == 200
    assert response.json()["value"] == 0


def test_reset():
    client.post("/api/counter/increment")
    client.post("/api/counter/increment")
    response = client.post("/api/counter/reset")
    assert response.status_code == 200
    assert response.json()["value"] == 0


def test_cannot_go_below_zero():
    response = client.post("/api/counter/decrement")
    assert response.status_code == 409
    assert response.json()["detail"] == "Counter cannot go below 0"
    assert client.get("/api/counter").json()["value"] == 0


def test_updated_at_is_null_until_first_change():
    assert client.get("/api/counter").json()["updated_at"] is None
    assert client.post("/api/counter/increment").json()["updated_at"] is not None


def test_step_size():
    assert client.post("/api/counter/increment", params={"step": 5}).json()["value"] == 5
    assert client.post("/api/counter/increment", params={"step": 11}).status_code == 422
```

**`frontend/src/api.js`**

```js
// All backend calls for the counter.

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.detail === "string" ? body.detail : `Request failed (${response.status})`);
  }
  return response.json();
}

export function getCounter() {
  return request("/counter");
}

export function increment(step = 1) {
  return request(`/counter/increment?step=${step}`, { method: "POST" });
}

export function decrement() {
  return request("/counter/decrement", { method: "POST" });
}

export function reset() {
  return request("/counter/reset", { method: "POST" });
}
```

**`frontend/src/App.jsx`**

```jsx
import { useEffect, useState } from "react";
import * as api from "./api.js";

export default function App() {
  const [counter, setCounter] = useState(null); // { value, updated_at } once loaded
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // Bonus
  const [saving, setSaving] = useState(false); // Bonus

  useEffect(() => {
    api
      .getCounter()
      .then(setCounter)
      .catch((err) => setError(err.message));
  }, []);

  // One helper for every button: run the API call, show the result or the error.
  async function run(apiCall) {
    setSaving(true);
    try {
      setCounter(await apiCall());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (!window.confirm("Reset the counter?")) return; // Task 2
    run(api.reset);
  }

  return (
    <div className="card">
      <h1>Click Counter</h1>

      {error && <p className="error">⚠️ {error}</p>}

      {counter === null ? (
        <p>Loading…</p>
      ) : (
        <>
          <p className="value">{counter.value}</p>
          <div className="buttons">
            {/* Task 1 + Task 3 */}
            <button onClick={() => run(api.decrement)} disabled={saving || counter.value === 0}>
              −1
            </button>
            <button className="primary" onClick={() => run(() => api.increment(step))} disabled={saving}>
              +{step}
            </button>
            {/* Task 2 */}
            <button onClick={handleReset} disabled={saving}>
              Reset
            </button>
          </div>

          {/* Bonus: step size */}
          <p>
            <label>
              Step:{" "}
              <select value={step} onChange={(e) => setStep(Number(e.target.value))}>
                <option value={1}>1</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </label>
          </p>

          {/* Task 4 */}
          <p className="muted">
            {saving
              ? "Saving…"
              : counter.updated_at
                ? `Last updated: ${new Date(counter.updated_at).toLocaleTimeString()}`
                : "Never updated"}
          </p>
        </>
      )}
    </div>
  );
}
```

## Common mistakes

- Defining the route as `@app.get("/api/counter/decrement")`. It changes data, so it must be **POST**.
- `counter.value - 1` in React without asking the server. The UI and the server then disagree after a reload.
- `new Date(updated_at)` when `updated_at` is `null` gives "1/1/1970". Check for null first.
- Forgetting that `<select>` gives a **string**: `"5"`. Without `Number(...)`, the URL is still OK, but comparisons like
  `step === 5` would be false.
