/*
 * LESSON 6: useEffect + fetch (talking to the backend)
 * ----------------------------------------------------
 * ⚠️ Start a backend first (L2 FastAPI OR L3 Flask) on port 8000. Both work, since they have the same API!
 *
 * useEffect(() => { ...code... }, [dependencies])
 *   - runs AFTER the component renders
 *   - []            → run once, when the component first appears (perfect for "load initial data")
 *   - [filter]      → run again whenever `filter` changes
 *   - no array      → run after EVERY render (almost never what you want)
 *
 * The standard data-loading pattern uses THREE pieces of state:
 *   data (books), loading (true/false), error (null or a message)
 *
 * fetch() basics:
 *   const response = await fetch("/api/books");      // GET
 *   if (!response.ok) throw new Error(...)            // fetch does NOT throw on 404/500, so check .ok yourself!
 *   const data = await response.json();               // parse the JSON body
 *
 *   await fetch("/api/books", {                       // POST with a JSON body
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ title: "Dune", ... }),
 *   });
 *
 * 🧪 TRY IT
 *   a) Stop the backend and click "Reload". You should see the error message. Start it again.
 *   b) Open DevTools (F12) → Network tab → click "Reload" → inspect the request & response.
 *   c) Add a "Delete" button per book: fetch(`/api/books/${id}`, { method: "DELETE" }), then reload the list.
 *   d) Add a small form to create a book (title, author, year) with a POST request.
 *      Try year = -1 and show the 422 error from the backend.
 */
import { useEffect, useState } from "react";

export default function Lesson6Effects() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onlyUnread, setOnlyUnread] = useState(false);

  // An async helper. (The function passed to useEffect itself can't be async, so we call a helper inside.)
  async function loadBooks() {
    setLoading(true);
    setError(null);
    try {
      const url = onlyUnread ? "/api/books?read=false" : "/api/books";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Server answered ${response.status}`);
      }
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError(err.message + " (is the backend running on port 8000?)");
    } finally {
      setLoading(false); // runs on success AND error
    }
  }

  // Run on first render AND whenever onlyUnread changes
  useEffect(() => {
    loadBooks();
  }, [onlyUnread]);

  // PATCH one book, then update local state with the server's answer
  async function toggleRead(book) {
    const response = await fetch(`/api/books/${book.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !book.read }),
    });
    if (!response.ok) {
      setError(`Could not update book (${response.status})`);
      return;
    }
    const updated = await response.json();
    setBooks(books.map((b) => (b.id === updated.id ? updated : b)));
  }

  return (
    <>
      <h1>Lesson 6: useEffect + fetch</h1>
      <div className="card">
        <label>
          <input type="checkbox" checked={onlyUnread} onChange={(e) => setOnlyUnread(e.target.checked)} /> Only
          unread
        </label>{" "}
        <button onClick={loadBooks}>Reload</button>

        {/* The three UI states: loading / error / data */}
        {loading && <p>Loading…</p>}
        {error && <p className="error">⚠️ {error}</p>}
        {!loading && !error && (
          <ul>
            {books.map((book) => (
              <li key={book.id}>
                <span className={book.read ? "done" : ""}>
                  {book.title}, {book.author} ({book.year})
                </span>{" "}
                <button onClick={() => toggleRead(book)}>{book.read ? "Mark unread" : "Mark read"}</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="note">
        The browser calls <code>/api/books</code> on port 5173 → the Vite proxy forwards it to port 8000. See vite.config.js.
      </p>
    </>
  );
}
