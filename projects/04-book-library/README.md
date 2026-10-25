# 04: Book Library 🟢

**Stack:** Flask + React (JavaScript) · **Total time:** ~80 min · **Concepts:** query parameters in Flask
(`request.args`), building URLs with `URLSearchParams`, `useEffect` dependencies, empty states, 400 for bad input

## The app

A read-only library catalogue. The backend loads 15 books from `data/books.json` at startup.
The frontend shows them in a table. Clicking a row loads the details from `GET /api/books/<id>`.

```
04-book-library/
├── backend/
│   ├── app.py               ← Flask routes
│   ├── data/books.json      ← the data (id, title, author, year, genre, pages)
│   └── test_app.py
└── frontend/src/
    ├── api.js
    ├── App.jsx              ← loads the list
    └── components/
        ├── BookTable.jsx    ← the table
        └── BookDetails.jsx  ← loads + shows one book (look at its useEffect!)
```

## Run it

```powershell
# Terminal 1
cd projects\04-book-library\backend
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
flask --app app run --debug --port 8000

# Terminal 2
cd projects\04-book-library\frontend
npm install
npm run dev
```

## Before you start (5 min)

1. Click different rows and watch the Network tab. When exactly does `BookDetails` send a request? Why?
2. Open http://localhost:8000/api/books?q=dune in the browser. What happens? (Flask ignores unknown query params.)

---

## Tasks

### Task 1: Search (backend) (15 min)
> *"Find a book by part of its title or author."*

- `GET /api/books?q=tolkien` returns only books whose **title or author** contains `q`, **case-insensitive**.
- Leading/trailing spaces are ignored. An empty `q` returns all books.
- Tests: `?q=TOLKIEN` → 2 books; `?q=design` → 2 books; `?q=xyz` → `[]`.

### Task 2: Sorting (backend) (20 min)
> *"Show the newest books first."*

- `?sort=title|year|pages` and `?order=asc|desc` (default `asc`).
- Invalid `sort` → **400** `{"detail": "Cannot sort by 'price'"}`. Invalid `order` → **400** too.
- Must work together with `q`: `?q=martin&sort=year&order=desc`.
- Tests for: sort by year desc (first book is 2017), and invalid sort → 400.

### Task 3: Search + sort in the UI (25 min)
> *"Connect it to the frontend."*

- Above the table: a search `<input>` and a sort `<select>`:
  `Title A–Z` · `Year (newest first)` · `Year (oldest first)` · `Pages (most first)`.
- Every change **re-fetches** from the backend with the right query string.
- Under the controls: `Showing 4 books`.
- No results: `No books found for "xyz".` instead of an empty table.

💬 Explain: why does the list re-load automatically? What's in your `useEffect` dependency array, and why?

### Task 4: Genre filter (20 min)
> *"I only want Programming books."*

- Backend: `GET /api/genres` → sorted list of unique genres: `["Design", "Fantasy", ...]`.
- Backend: `?genre=programming` → exact genre match, case-insensitive. Combines with `q` and `sort`.
- Frontend: a `<select>` with **All genres** plus the genres **loaded from the API** (not hard-coded!).

### Bonus
- **Debounce** the search: only fetch 300 ms after the user stops typing.
- Click a **column header** to sort by it; click again to reverse. Show ▲ / ▼ on the active column.

---

<details><summary>💡 Hints</summary>

- Flask: `q = request.args.get("q", "").strip().lower()`
- Sort: `sorted(result, key=lambda b: b[sort], reverse=(order == "desc"))`. Titles: sort by `b["title"].lower()`?
- Unique genres: `sorted({b["genre"] for b in books})`. Note: a `set` comprehension!
- React: keep `search`, `sort` and `genre` in state. In `useEffect(() => {...}, [search, sort, genre])` build the URL:
  `new URLSearchParams({ q: search, sort: "year", order: "desc" }).toString()`
- A `<select>` option can hold two values in one string: `value="year:desc"`, then `const [sort, order] = value.split(":")`.
- Debounce: `useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search])`.
</details>

**Reference solution:** not in this branch. When you have finished all tasks, ask your mentor for the review / solution.
