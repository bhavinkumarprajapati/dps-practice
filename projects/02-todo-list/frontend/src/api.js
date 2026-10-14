// All backend calls for todos.

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
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

export function getTodos() {
  return request("/todos");
}

export function createTodo(title) {
  return request("/todos", { method: "POST", body: JSON.stringify({ title }) });
}
