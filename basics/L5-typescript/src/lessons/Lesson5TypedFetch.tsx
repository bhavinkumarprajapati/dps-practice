/*
 * LESSON 5: Typed fetch: an API module
 * ------------------------------------
 * ⚠️ Needs a backend on port 8000 (L2 FastAPI or L3 Flask).
 *
 * Real apps put all backend calls in ONE place (src/api.ts) with typed return values.
 * Components then call `await getBooks()` and get a Book[], without knowing URLs or fetch details.
 * This file has the API functions at the top so you can see everything at once.
 *
 *   async function getBooks(): Promise<Book[]>        // "returns a Promise that resolves to Book[]"
 *
 * ⚠️ `response.json()` returns `any`, so TS trusts you blindly here. If the backend sends different
 *    field names, TS can't know. Your types must match the backend's response models!
 *
 * 🧪 TRY IT
 *   a) Write `deleteBook(id: number): Promise<void>` and add a Delete button.
 *   b) Add a typed form that calls createBook(newBook: NewBook).
 *   c) Rename `year` to `published` in types.ts only. TS errors show every place that uses it.
 *      (That's why types help you during a refactor.) Then undo.
 */
import { useEffect, useState } from "react";
import type { Book, NewBook } from "../types";

// ---------- API functions (in a real app: src/api.ts) ----------
async function getBooks(): Promise<Book[]> {
  const response = await fetch("/api/books");
  if (!response.ok) throw new Error(`GET /api/books failed: ${response.status}`);
  return response.json();
}

async function setRead(id: number, read: boolean): Promise<Book> {
  const response = await fetch(`/api/books/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ read }),
  });
  if (!response.ok) throw new Error(`PATCH failed: ${response.status}`);
  return response.json();
}

// Not used yet. For exercise b)
export async function createBook(newBook: NewBook): Promise<Book> {
  const response = await fetch("/api/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newBook),
  });
  if (!response.ok) throw new Error(`POST failed: ${response.status}`);
  return response.json();
}

// ---------- Component ----------
export default function Lesson5TypedFetch() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBooks()
      .then(setBooks)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(book: Book) {
    try {
      const updated = await setRead(book.id, !book.read);
      setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch (err) {
      // in a catch block, err has type `unknown`, so check it before using .message
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <>
      <h1>Lesson 5: Typed fetch</h1>
      {error && <p className="error">⚠️ {error} (is the backend running?)</p>}
      <div className="card">
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              <label>
                <input type="checkbox" checked={book.read} onChange={() => handleToggle(book)} />{" "}
                <span className={book.read ? "done" : ""}>{book.title}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
