import { useEffect, useState } from "react";
import * as api from "./api.js";
import ExpenseForm from "./components/ExpenseForm.jsx";
import ExpenseTable from "./components/ExpenseTable.jsx";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getExpenses()
      .then(setExpenses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Returns an error message for the form, or null on success
  async function handleCreate(expense) {
    try {
      const created = await api.createExpense(expense);
      // keep "newest first": put it in the right place by re-sorting a copy
      setExpenses((prev) =>
        [...prev, created].sort((a, b) => b.spent_on.localeCompare(a.spent_on) || b.id - a.id)
      );
      return null;
    } catch (err) {
      return err.message;
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="container wide">
      <h1>💶 Expense Tracker</h1>
      <ExpenseForm onCreate={handleCreate} />

      {error && <p className="error">⚠️ {error}</p>}
      {loading ? <p>Loading…</p> : <ExpenseTable expenses={expenses} onDelete={handleDelete} />}

      <p className="total">
        Total: <strong>{total.toFixed(2)} €</strong>
      </p>
    </div>
  );
}
