import { useEffect, useState } from "react";
import * as api from "../api.js";

// Loads the full book from GET /api/books/:id whenever bookId changes.
export default function BookDetails({ bookId }) {
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookId === null) return;
    setError(null);
    api
      .getBook(bookId)
      .then(setBook)
      .catch((err) => setError(err.message));
  }, [bookId]); // ← re-run when the selected book changes

  if (bookId === null) return <p className="muted">Click a book to see details.</p>;
  if (error) return <p className="error">{error}</p>;
  if (!book) return <p>Loading…</p>;

  return (
    <div className="details">
      <h2>{book.title}</h2>
      <dl>
        <dt>Author</dt>
        <dd>{book.author}</dd>
        <dt>Year</dt>
        <dd>{book.year}</dd>
        <dt>Genre</dt>
        <dd>{book.genre}</dd>
        <dt>Pages</dt>
        <dd>{book.pages}</dd>
      </dl>
    </div>
  );
}
