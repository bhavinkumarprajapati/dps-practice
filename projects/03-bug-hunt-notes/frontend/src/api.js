// This project calls the backend DIRECTLY (no Vite proxy), so CORS matters.
const API_URL = "http://localhost:8000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.detail === "string" ? body.detail : `Request failed (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function getNotes() {
  return request("/notes");
}

export function createNote(title, content) {
  return request("/notes", { method: "POST", body: JSON.stringify({ title, content }) });
}

export function deleteNote(id) {
  return request(`/notes/${id}`, { method: "DELETE" });
}
