async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    let message = `Request failed (${response.status})`;
    if (typeof body.detail === "string") message = body.detail;
    else if (Array.isArray(body.detail)) message = body.detail.map((d) => `${d.loc.at(-1)}: ${d.msg}`).join(", ");
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function getBooks() {
  return request("/books");
}

export function getMembers() {
  return request("/members");
}

export function getActiveLoans() {
  return request("/loans");
}

export function lendBook(bookId, memberId) {
  return request("/loans", { method: "POST", body: JSON.stringify({ book_id: bookId, member_id: memberId }) });
}

export function returnLoan(loanId) {
  return request(`/loans/${loanId}/return`, { method: "POST" });
}
