export default function ExpenseTable({ expenses, onDelete }) {
  if (expenses.length === 0) return <p className="muted">No expenses yet.</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th className="num">Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((expense) => (
          <tr key={expense.id}>
            {/* "2026-10-25" → "25.10.2026" */}
            <td>{expense.spent_on.split("-").reverse().join(".")}</td>
            <td>{expense.description}</td>
            <td className="num">{expense.amount.toFixed(2)} €</td>
            <td className="actions">
              <button onClick={() => onDelete(expense.id)} aria-label={`Delete ${expense.description}`}>
                🗑
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
