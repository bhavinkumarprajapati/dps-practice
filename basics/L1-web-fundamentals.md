# L1: Web fundamentals (how a React + Python app works)

## 1. The big picture

```
 ┌──────────────────────────┐        HTTP request         ┌──────────────────────────┐       SQL        ┌──────────┐
 │  BROWSER                 │  GET /api/books             │  BACKEND (Python)        │  SELECT * ...    │ DATABASE │
 │  React app               │ ──────────────────────────► │  FastAPI or Flask        │ ───────────────► │ SQLite   │
 │  (runs on YOUR computer, │                             │  (runs on a server,      │                  │          │
 │   in the browser)        │ ◄────────────────────────── │   locally: port 8000)    │ ◄─────────────── │          │
 │  dev server: port 5173   │  200 OK  [{"id":1,...}]     │                          │      rows        │          │
 └──────────────────────────┘     HTTP response (JSON)    └──────────────────────────┘                  └──────────┘
```

- The **frontend** (React) is what the user sees. It holds UI **state** and talks to the backend over HTTP.
- The **backend** (Python) holds the **business rules** ("you can't book more seats than exist") and the **data**.
- They talk in **JSON**: plain text that looks like a Python dict / JavaScript object.

**Rule of thumb:** anything that must be *true* or *safe* (validation, prices, permissions) belongs in the backend.
The frontend can be changed by any user with DevTools, so you can't rely on its checks.

## 2. Anatomy of an HTTP request and response

```
POST /api/books?notify=true HTTP/1.1          ← METHOD  PATH  ?QUERY-STRING
Host: localhost:8000
Content-Type: application/json                 ← HEADERS (metadata)

{"title": "Dune", "author": "Herbert"}         ← BODY (the data you send)
```

```
HTTP/1.1 201 Created                           ← STATUS CODE
Content-Type: application/json

{"id": 4, "title": "Dune", "author": "Herbert"}
```

### The three ways to send data to the backend

| Where | Example | Used for | FastAPI | Flask |
|---|---|---|---|---|
| **Path parameter** | `/api/books/4` | *Which* resource | `def get(book_id: int)` with `"/api/books/{book_id}"` | `"/api/books/<int:book_id>"` |
| **Query parameter** | `/api/books?author=Tolkien&sort=year` | Filter / sort / paginate | `def list(author: str \| None = None)` | `request.args.get("author")` |
| **Request body** (JSON) | `{"title": "Dune"}` | Data to create/update | `def create(book: BookIn)` | `request.get_json()` |

## 3. HTTP methods = verbs (REST)

A **resource** is a noun (`/api/books`). The **method** says what to do with it.

| Method | URL | Meaning | Success code |
|---|---|---|---|
| `GET` | `/api/books` | List all books | 200 OK |
| `GET` | `/api/books/4` | Get one book | 200 OK |
| `POST` | `/api/books` | Create a new book | **201 Created** |
| `PUT` | `/api/books/4` | Replace the whole book | 200 OK |
| `PATCH` | `/api/books/4` | Change *some* fields (e.g. `{"read": true}`) | 200 OK |
| `DELETE` | `/api/books/4` | Delete the book | **204 No Content** (empty body) |

## 4. Status codes you must know

| Code | Name | When to use it |
|---|---|---|
| 200 | OK | Normal success |
| 201 | Created | After a successful POST |
| 204 | No Content | Success with no body (typical for DELETE) |
| 400 | Bad Request | The request is wrong in general (Flask apps often use this for validation) |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | Logged in, but not allowed to do this |
| 404 | Not Found | The resource doesn't exist (`/api/books/999`) |
| 409 | Conflict | It breaks a business rule / state (e.g. "already booked", "duplicate name") |
| 422 | Unprocessable Entity | The body has the wrong shape or values. **FastAPI sends this automatically** when Pydantic validation fails |
| 500 | Internal Server Error | Bug in the backend. Check the backend terminal for the traceback! |

Easy way to remember: **2xx** = success, **4xx** = the client (frontend) did something wrong, **5xx** = the server crashed.

## 5. Ports, dev servers, proxy and CORS

Locally, you run **two servers**:
- `npm run dev` → Vite serves the React app at **http://localhost:5173**
- `uvicorn` / `flask run` → Python API at **http://localhost:8000**

Browsers block a page on one *origin* (`localhost:5173`) from reading responses from another origin
(`localhost:8000`) unless the server explicitly allows it. That is **CORS** (Cross-Origin Resource Sharing).

There are two ways to deal with it, and you'll see both:

1. **Vite proxy** (what this repo uses). React calls a *relative* URL `fetch("/api/books")`. Vite receives it on
   port 5173 and forwards it to port 8000. To the browser it looks like the same origin, so CORS never applies.
   ```js
   // vite.config.js
   server: { proxy: { "/api": "http://localhost:8000" } }
   ```
2. **Enable CORS in the backend.** React calls `fetch("http://localhost:8000/api/books")` directly and the backend says "I allow 5173":
   ```python
   # FastAPI
   from fastapi.middleware.cors import CORSMiddleware
   app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"])
   # Flask
   from flask_cors import CORS
   CORS(app, origins=["http://localhost:5173"])
   ```

> 🎯 Interview tip: when you open their repo, look at `vite.config.*` for a proxy, or for an
> `API_URL` / `VITE_API_URL` setting. That tells you how the frontend reaches the backend.

## 6. JSON ↔ Python ↔ JavaScript

| JSON | Python | JavaScript |
|---|---|---|
| `{"a": 1}` | `dict` | object |
| `[1, 2]` | `list` | array |
| `"text"` | `str` | string |
| `true` / `false` | `True` / `False` | `true` / `false` |
| `null` | `None` | `null` |

⚠️ Naming: Python uses `snake_case` (`cooking_time`), JavaScript uses `camelCase` (`cookingTime`). Many apps
just keep the backend's `snake_case` in the frontend too. **Copy whatever the existing code does.**

## 7. Your browser's DevTools: your best debugging tool

Press **F12** in Chrome or Edge:
- **Console** tab: JavaScript errors and your `console.log(...)` output.
- **Network** tab: every HTTP request. Click one to see its **Headers** (method, URL, status), **Payload** (the body you sent)
  and **Response** (what came back). Tick **"Fetch/XHR"** to hide images, CSS and so on.

When something doesn't work, find out **which layer is broken**:
1. Is there a request in the Network tab? No → the bug is in React (handler not called?).
2. Is the status 4xx? → React sent the wrong data. Compare the Payload with what the backend expects.
3. Is the status 500? → backend bug. Read the traceback in the **backend terminal**.
4. Is the status 200 but the UI is wrong? → React doesn't use the response correctly (wrong key? state not updated?).

## 8. Quiz (answer out loud, then check)

1. A user wants to see only unread books. Path param, query param or body?
2. What should `DELETE /api/books/999` return if book 999 doesn't exist?
3. You send `{"year": "abc"}` to a FastAPI endpoint that expects `year: int`. What status do you get?
4. Your React app shows "Failed to fetch". Name the first two things you check.
5. Why shouldn't the frontend compute the final price of a shopping cart?

<details><summary>Answers</summary>

1. Query param: `GET /api/books?read=false` (it filters the list, it isn't a different resource).
2. `404 Not Found`.
3. `422 Unprocessable Entity`. FastAPI and Pydantic do this automatically and describe the problem in `detail`.
4. Is the backend running (look at its terminal)? Does the request show in the Network tab, and with what URL/status?
5. The user can change anything in the browser. The server has to compute or verify prices, otherwise someone could pay €0.
</details>
