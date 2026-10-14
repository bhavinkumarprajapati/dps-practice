async function request(path) {
  const response = await fetch(`/api${path}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.detail === "string" ? body.detail : `Request failed (${response.status})`);
  }
  return response.json();
}

export function getBooks() {
  return request("/books");
}

export function getBook(id) {
  return request(`/books/${id}`);
}
