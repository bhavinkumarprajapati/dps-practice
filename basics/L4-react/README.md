# L4: React basics in JavaScript (≈ 3 h)

One app, **7 lessons**. Each is one file in `src/lessons/`. Pick a lesson in the left menu, read its file
(the big comment at the top explains the concept), then do its 🧪 **TRY IT** exercises.

## Run it

```powershell
cd basics\L4-react
npm install
npm run dev
```
Open http://localhost:5173.

For **Lesson 6** you also need a backend on port 8000. Use L2 (FastAPI) **or** L3 (Flask), in a second terminal.
Both work, because they have the same API.

## Project structure (most Vite + React apps look like this, including the interview repo)

```
L4-react/
├── index.html           ← the single HTML page, has <div id="root">
├── package.json         ← dependencies + scripts (npm run dev / build)
├── vite.config.js       ← dev server settings + /api proxy to the backend
└── src/
    ├── main.jsx         ← entry: renders <App /> into #root
    ├── App.jsx          ← top-level component
    ├── index.css        ← global styles
    └── lessons/         ← one component per file
```

> 🎯 In the interview, read files in this order: `package.json` (what libraries?), then `vite.config.*` (proxy?),
> then `main.jsx`, then `App.jsx`, and follow the imports from there.

## The lessons

| # | File | Concept | Must remember |
|---|---|---|---|
| 1 | `Lesson1JSX.jsx` | JSX | `{}` = JavaScript, `className`, one root element, `cond ? a : b`, `cond && a` |
| 2 | `Lesson2Props.jsx` | Props | inputs from the parent, read-only, `children`, default values |
| 3 | `Lesson3State.jsx` | `useState` | never mutate; setter re-renders; `setX(prev => ...)`; `{...obj}` / `[...arr]` |
| 4 | `Lesson4Lists.jsx` | Lists | `.map` + `key={item.id}`, `.filter`, derived values instead of extra state |
| 5 | `Lesson5Forms.jsx` | Forms | controlled inputs, `onSubmit` + `preventDefault()`, `e.target.checked`, `Number()` |
| 6 | `Lesson6Effects.jsx` | `useEffect` + `fetch` | dependency array, loading/error/data, `response.ok`, JSON body + headers |
| 7 | `Lesson7LiftingState.jsx` | Lifting state | state in the common parent, data down via props, events up via `onX` callbacks |

## Final challenge (45 min, no AI!) 🟠

Create `src/lessons/Lesson8Challenge.jsx` and add it to the menu in `App.jsx`. Build a **Reading list**:
1. Load the books from `/api/books` (loading + error states).
2. A form to add a book (title, author, year) with a POST. Show the backend's 422 message if it fails.
3. A "Delete" button per book.
4. A text input that filters the visible books by title (filtering happens in the frontend only).
5. Split it into components: `BookForm`, `BookList`, `BookRow`.

Then compare with `Lesson6Effects.jsx` and `Lesson7LiftingState.jsx`. That's the pattern you'll see again in L6.

<details><summary>✅ Possible solution</summary>

```jsx
import { useEffect, useState } from "react";

function BookForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await onCreate({ title, author, year: Number(year) });
    if (ok) { setTitle(""); setAuthor(""); setYear(""); }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" />
      <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" />
      <button type="submit">Add</button>
    </form>
  );
}

function BookRow({ book, onDelete }) {
  return <li>{book.title} ({book.year}) <button onClick={() => onDelete(book.id)}>Delete</button></li>;
}

function BookList({ books, onDelete }) {
  if (books.length === 0) return <p>No books.</p>;
  return <ul>{books.map((b) => <BookRow key={b.id} book={b} onDelete={onDelete} />)}</ul>;
}

export default function Lesson8Challenge() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/books")
      .then((r) => { if (!r.ok) throw new Error(`Status ${r.status}`); return r.json(); })
      .then(setBooks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function createBook(data) {
    const r = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await r.json();
    if (!r.ok) { setError(JSON.stringify(body.detail)); return false; }
    setBooks([...books, body]);
    setError(null);
    return true;
  }

  async function deleteBook(id) {
    const r = await fetch(`/api/books/${id}`, { method: "DELETE" });
    if (r.ok) setBooks(books.filter((b) => b.id !== id));
  }

  const visible = books.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="card">
      <h1>Reading list</h1>
      <BookForm onCreate={createBook} />
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" />
      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && <BookList books={visible} onDelete={deleteBook} />}
    </div>
  );
}
```
</details>
