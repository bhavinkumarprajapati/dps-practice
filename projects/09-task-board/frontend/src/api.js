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

export function getTasks() {
  return request("/tasks");
}

export function createTask(title) {
  return request("/tasks", { method: "POST", body: JSON.stringify({ title }) });
}
