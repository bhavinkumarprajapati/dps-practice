async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    let message = `Request failed (${response.status})`;
    if (typeof body.detail === "string") message = body.detail;
    // FastAPI validation errors (422): [{ loc: ["body", "amount"], msg: "..." }, ...]
    else if (Array.isArray(body.detail)) message = body.detail.map((d) => `${d.loc.at(-1)}: ${d.msg}`).join(", ");
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function getExpenses() {
  return request("/expenses");
}

export function createExpense(expense) {
  return request("/expenses", { method: "POST", body: JSON.stringify(expense) });
}

export function deleteExpense(id) {
  return request(`/expenses/${id}`, { method: "DELETE" });
}
