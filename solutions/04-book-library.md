# Solution 04: Book Library

## How to approach it (what to say out loud)

1. *"I'll do search and sorting in the backend so the frontend only displays what it gets. That also works when the
   catalogue grows to thousands of books."*
2. *"Query params in Flask are always strings, so I use `request.args.get("q", "")` with a default and normalise it with
   `strip().lower()`."*
3. *"For invalid sort fields I return 400 with a clear message, because silently ignoring bad input hides bugs."*
4. *"In React, the search, sort and genre live in state. The fetch runs in a `useEffect` with `[search, sortValue, genre]`
   as dependencies, so any change re-fetches. The cleanup function cancels the previous timer, and that gives me the debounce."*

## Key decisions

| Question | Choice | Why |
|---|---|---|
| Filter in frontend or backend? | Backend | The task says so, and it's the scalable choice. Mention the trade-off. |
| 400 vs 422 for `sort=price`? | 400 | Flask has no automatic 422. 400 = "bad request" fits a bad query param. |
| Sort titles case-insensitively | `.lower()` in the sort key | Otherwise "the Hobbit" and "The Hobbit" sort differently. |
| Genres from API or hard-coded? | API | A new genre in the JSON appears automatically: single source of truth. |
| Empty filter values | Left out of the URL | `?q=&genre=` is noise. `URLSearchParams` + skipping empty values keeps URLs clean. |
| Debounce | `setTimeout` + cleanup in `useEffect` | Without it, typing "tolkien" sends 7 requests. |

## Final code (changed files)

**`backend/app.py`**

```python
"""
Book Library API (Flask, read-only, data from data/books.json)

Run:  flask --app app run --debug --port 8000
Try:  http://localhost:8000/api/books?q=martin&sort=year&order=desc
"""

import json
from pathlib import Path

from flask import Flask, abort, jsonify, request

app = Flask(__name__)

DATA_FILE = Path(__file__).parent / "data" / "books.json"
books = json.loads(DATA_FILE.read_text(encoding="utf-8"))  # list of dicts, loaded once at startup

SORT_FIELDS = ("title", "year", "pages")
ORDERS = ("asc", "desc")


@app.errorhandler(400)
def bad_request(error):
    return jsonify({"detail": error.description}), 400


@app.errorhandler(404)
def not_found(error):
    return jsonify({"detail": error.description}), 404


@app.get("/api/books")
def list_books():
    result = books

    # Task 1: search in title OR author, case-insensitive
    q = request.args.get("q", "").strip().lower()
    if q:
        result = [b for b in result if q in b["title"].lower() or q in b["author"].lower()]

    # Task 4: genre filter (exact match, case-insensitive)
    genre = request.args.get("genre", "").strip().lower()
    if genre:
        result = [b for b in result if b["genre"].lower() == genre]

    # Task 2: sorting
    sort = request.args.get("sort")
    order = request.args.get("order", "asc")
    if order not in ORDERS:
        abort(400, description=f"Cannot order by '{order}' (use asc or desc)")
    if sort is not None:
        if sort not in SORT_FIELDS:
            abort(400, description=f"Cannot sort by '{sort}'")
        # lower() for titles so "the" and "The" sort the same; numbers are used as they are
        result = sorted(
            result,
            key=lambda b: b[sort].lower() if isinstance(b[sort], str) else b[sort],
            reverse=(order == "desc"),
        )

    return jsonify(result)


# Task 4
@app.get("/api/genres")
def list_genres():
    return jsonify(sorted({b["genre"] for b in books}))  # a set removes duplicates


@app.get("/api/books/<int:book_id>")
def get_book(book_id):
    for book in books:
        if book["id"] == book_id:
            return book
    abort(404, description=f"Book {book_id} not found")
```

**`backend/test_app.py`**

```python
from app import app

client = app.test_client()


def titles(response):
    return [b["title"] for b in response.get_json()]


def test_list_books():
    response = client.get("/api/books")
    assert response.status_code == 200
    assert len(response.get_json()) == 15


def test_get_book():
    response = client.get("/api/books/4")
    assert response.status_code == 200
    assert response.get_json()["title"] == "Dune"


def test_get_unknown_book_returns_404():
    response = client.get("/api/books/99")
    assert response.status_code == 404
    assert response.get_json()["detail"] == "Book 99 not found"


# Task 1
def test_search_by_author_is_case_insensitive():
    assert titles(client.get("/api/books", query_string={"q": "TOLKIEN"})) == ["The Hobbit", "The Silmarillion"]


def test_search_by_title():
    assert len(client.get("/api/books", query_string={"q": "  design "}).get_json()) == 2


def test_search_without_results():
    assert client.get("/api/books", query_string={"q": "xyz"}).get_json() == []


# Task 2
def test_sort_by_year_desc():
    books = client.get("/api/books", query_string={"sort": "year", "order": "desc"}).get_json()
    assert books[0]["year"] == 2017


def test_search_and_sort_together():
    result = titles(client.get("/api/books", query_string={"q": "martin", "sort": "year", "order": "desc"}))
    assert result == ["Designing Data-Intensive Applications", "Clean Code", "Refactoring"]


def test_invalid_sort_returns_400():
    response = client.get("/api/books", query_string={"sort": "price"})
    assert response.status_code == 400
    assert response.get_json()["detail"] == "Cannot sort by 'price'"


def test_invalid_order_returns_400():
    assert client.get("/api/books", query_string={"sort": "year", "order": "up"}).status_code == 400


# Task 4
def test_genres():
    assert client.get("/api/genres").get_json() == ["Design", "Fantasy", "Product", "Programming", "Science Fiction"]


def test_filter_by_genre():
    books = client.get("/api/books", query_string={"genre": "programming"}).get_json()
    assert len(books) == 4
    assert all(b["genre"] == "Programming" for b in books)
```

**`frontend/src/api.js`**

```js
async function request(path) {
  const response = await fetch(`/api${path}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.detail === "string" ? body.detail : `Request failed (${response.status})`);
  }
  return response.json();
}

// Task 3/4: build the query string from an object, leaving out empty values.
// getBooks({ q: "tolkien", sort: "year", order: "desc", genre: "" }) → /books?q=tolkien&sort=year&order=desc
export function getBooks(filters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return request(query ? `/books?${query}` : "/books");
}

export function getBook(id) {
  return request(`/books/${id}`);
}

export function getGenres() {
  return request("/genres");
}
```

**`frontend/src/App.jsx`**

```jsx
import { useEffect, useState } from "react";
import * as api from "./api.js";
import BookTable from "./components/BookTable.jsx";
import BookDetails from "./components/BookDetails.jsx";

// Task 3: one select value holds "field:order"
const SORT_OPTIONS = [
  { value: "title:asc", label: "Title A–Z" },
  { value: "year:desc", label: "Year (newest first)" },
  { value: "year:asc", label: "Year (oldest first)" },
  { value: "pages:desc", label: "Pages (most first)" },
];

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const [search, setSearch] = useState(""); // Task 3
  const [sortValue, setSortValue] = useState("title:asc"); // Task 3 (also changed by clicking headers: Bonus)
  const [genre, setGenre] = useState(""); // Task 4
  const [genres, setGenres] = useState([]); // Task 4

  // Task 4: load the genre options once
  useEffect(() => {
    api
      .getGenres()
      .then(setGenres)
      .catch((err) => setError(err.message));
  }, []);

  // Task 3: re-fetch whenever a filter changes. Bonus: debounce by 300 ms.
  useEffect(() => {
    const [sort, order] = sortValue.split(":");
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .getBooks({ q: search.trim(), sort, order, genre })
        .then((data) => {
          setBooks(data);
          setError(null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer); // cleanup: cancel the previous timer if the user keeps typing
  }, [search, sortValue, genre]);

  // Bonus: click a column header → sort by it, click again → reverse
  function handleSortColumn(field) {
    const [currentField, currentOrder] = sortValue.split(":");
    const nextOrder = currentField === field && currentOrder === "asc" ? "desc" : "asc";
    setSortValue(`${field}:${nextOrder}`);
  }

  return (
    <div className="container wide">
      <h1>📚 Book Library</h1>

      <div className="controls">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or author…" />
        <select value={sortValue} onChange={(e) => setSortValue(e.target.value)}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
          {/* a header click can create a combination that isn't in the list, e.g. "pages:asc" */}
          {!SORT_OPTIONS.some((o) => o.value === sortValue) && <option value={sortValue}>Custom ({sortValue})</option>}
        </select>
        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error">⚠️ {error}</p>}

      <div className="layout">
        <section>
          {loading && books.length === 0 ? (
            <p>Loading…</p>
          ) : books.length === 0 ? (
            <p className="muted">No books found{search.trim() ? ` for "${search.trim()}"` : ""}.</p>
          ) : (
            <>
              <p className="muted">
                Showing {books.length} {books.length === 1 ? "book" : "books"}
              </p>
              <BookTable
                books={books}
                selectedId={selectedId}
                onSelect={setSelectedId}
                sortValue={sortValue}
                onSortColumn={handleSortColumn}
              />
            </>
          )}
        </section>
        <aside>
          <BookDetails bookId={selectedId} />
        </aside>
      </div>
    </div>
  );
}
```

**`frontend/src/components/BookTable.jsx`**

```jsx
// Bonus: sortable headers. Only title/year/pages can be sorted by the backend.
const COLUMNS = [
  { field: "title", label: "Title", sortable: true },
  { field: "author", label: "Author", sortable: false },
  { field: "year", label: "Year", sortable: true },
  { field: "genre", label: "Genre", sortable: false },
];

export default function BookTable({ books, selectedId, onSelect, sortValue, onSortColumn }) {
  const [sortField, sortOrder] = sortValue.split(":");

  return (
    <table>
      <thead>
        <tr>
          {COLUMNS.map((col) => (
            <th
              key={col.field}
              onClick={col.sortable ? () => onSortColumn(col.field) : undefined}
              style={{ cursor: col.sortable ? "pointer" : "default" }}
            >
              {col.label} {sortField === col.field && (sortOrder === "asc" ? "▲" : "▼")}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {books.map((book) => (
          <tr key={book.id} className={book.id === selectedId ? "selected" : ""} onClick={() => onSelect(book.id)}>
            <td>{book.title}</td>
            <td>{book.author}</td>
            <td>{book.year}</td>
            <td>{book.genre}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Common mistakes

- `request.args["q"]` (square brackets) → **400 Bad Request** from Flask when `q` is missing. Use `.get()`.
- `sorted(..., key=lambda b: b["title"])` puts uppercase before lowercase. Fine here, but know why.
- Forgetting `genre` in the `useEffect` dependency array → changing the genre does nothing.
- Building the URL by hand: `` `/books?q=${search}` `` breaks for input like `a&b`. `URLSearchParams` encodes it correctly.
- Showing "No books found" while the first request is still loading. Check `loading` first.
