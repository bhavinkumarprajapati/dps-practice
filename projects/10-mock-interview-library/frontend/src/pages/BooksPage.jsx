import { useEffect, useState } from "react";
import * as api from "../api.js";
import LendForm from "../components/LendForm.jsx";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [lendingBookId, setLendingBookId] = useState(null); // which row shows the lend form
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  function loadBooks() {
    return api
      .getBooks()
      .then(setBooks)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadBooks();
    api
      .getMembers()
      .then(setMembers)
      .catch((err) => setError(err.message));
  }, []);

  async function handleLend(book, memberId) {
    try {
      const loan = await api.lendBook(book.id, memberId);
      setMessage(`"${loan.book.title}" lent to ${loan.member.name}.`);
      setError(null);
      setLendingBookId(null);
      await loadBooks(); // availability changed
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      {error && <p className="error">⚠️ {error}</p>}
      {message && <p className="success">✅ {message}</p>}
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>
                <span className={book.available ? "pill green" : "pill grey"}>
                  {book.available ? "Available" : "On loan"}
                </span>
              </td>
              <td className="actions">
                {book.available &&
                  (lendingBookId === book.id ? (
                    <LendForm
                      members={members}
                      onLend={(memberId) => handleLend(book, memberId)}
                      onCancel={() => setLendingBookId(null)}
                    />
                  ) : (
                    <button onClick={() => setLendingBookId(book.id)}>Lend…</button>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
