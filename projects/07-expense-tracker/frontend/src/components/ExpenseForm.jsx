import { useState } from "react";

// Today as "YYYY-MM-DD" in LOCAL time (the format <input type="date"> and the API use).
// (new Date().toISOString() would give the UTC date, which is "yesterday" just after midnight in Germany.)
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Props: onCreate(expense) → async, resolves to an error message or null on success
export default function ExpenseForm({ onCreate }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [spentOn, setSpentOn] = useState(today());
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const message = await onCreate({ description, amount: Number(amount), spent_on: spentOn });
    if (message) {
      setError(message);
    } else {
      setError(null);
      setDescription("");
      setAmount("");
    }
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <input
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount €"
        style={{ width: 110 }}
      />
      <input type="date" value={spentOn} onChange={(e) => setSpentOn(e.target.value)} />
      <button type="submit" className="primary">
        Add
      </button>
      {error && <p className="error full">{error}</p>}
    </form>
  );
}
