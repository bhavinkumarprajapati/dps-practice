import { useEffect, useState } from "react";
import * as api from "../api.js";
import { formatDate } from "../format.js";

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getActiveLoans()
      .then(setLoans)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleReturn(loan) {
    try {
      await api.returnLoan(loan.id);
      setLoans((prev) => prev.filter((l) => l.id !== loan.id)); // no longer active
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <section>
      {error && <p className="error">⚠️ {error}</p>}
      {loans.length === 0 ? (
        <p className="muted">No books are on loan right now.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Book</th>
              <th>Member</th>
              <th>Loaned on</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.book.title}</td>
                <td>{loan.member.name}</td>
                <td>{formatDate(loan.loaned_on)}</td>
                <td className="actions">
                  <button onClick={() => handleReturn(loan)}>Mark returned</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
