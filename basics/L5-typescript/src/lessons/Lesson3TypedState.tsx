/*
 * LESSON 3: Typed state
 * ---------------------
 * useState usually INFERS the type from the initial value:
 *     const [count, setCount] = useState(0);            // number
 * But you must write it with <...> when the initial value doesn't show the full type:
 *     const [books, setBooks] = useState<Book[]>([]);           // [] alone would be never[]
 *     const [selected, setSelected] = useState<Book | null>(null);  // null now, a Book later
 *     const [filter, setFilter] = useState<Filter>("all");          // only "all" | "read" | "unread"
 *
 * 🧪 TRY IT
 *   a) Call setFilter("everything"). Error!
 *   b) Remove <Book[]> from useState and see what breaks.
 *   c) In the details card, try `selected.title` without the null-check. Why does TS complain?
 */
import { useState } from "react";
import type { Book, Filter } from "../types";

const sampleBooks: Book[] = [
  { id: 1, title: "The Hobbit", author: "J.R.R. Tolkien", year: 1937, read: true },
  { id: 2, title: "Clean Code", author: "Robert C. Martin", year: 2008, read: false },
  { id: 3, title: "Refactoring", author: "Martin Fowler", year: 1999, read: false },
];

export default function Lesson3TypedState() {
  const [books] = useState<Book[]>(sampleBooks);
  const [selected, setSelected] = useState<Book | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const visible = books.filter((b) => (filter === "all" ? true : filter === "read" ? b.read : !b.read));

  return (
    <>
      <h1>Lesson 3: Typed state</h1>
      <div className="card">
        {/* `as Filter` = a type assertion: we know the select only contains valid values */}
        <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
          <option value="all">All</option>
          <option value="read">Read</option>
          <option value="unread">Unread</option>
        </select>
        <ul>
          {visible.map((b) => (
            <li key={b.id}>
              <button onClick={() => setSelected(b)}>{b.title}</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Details</h3>
        {/* selected can be null, so check before using it */}
        {selected === null ? (
          <p>Click a book.</p>
        ) : (
          <p>
            <b>{selected.title}</b> by {selected.author}, {selected.year}
          </p>
        )}
      </div>
    </>
  );
}
