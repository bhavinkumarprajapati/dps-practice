import { useEffect, useState } from "react";
import * as api from "./api.js";
import BookTable from "./components/BookTable.jsx";
import BookDetails from "./components/BookDetails.jsx";

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    api
      .getBooks()
      .then(setBooks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container wide">
      <h1>📚 Book Library</h1>

      {error && <p className="error">⚠️ {error}</p>}

      <div className="layout">
        <section>
          {loading ? <p>Loading…</p> : <BookTable books={books} selectedId={selectedId} onSelect={setSelectedId} />}
        </section>
        <aside>
          <BookDetails bookId={selectedId} />
        </aside>
      </div>
    </div>
  );
}
