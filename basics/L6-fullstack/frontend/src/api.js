// ALL communication with the backend lives in this file.
// Components never call fetch() directly; they call these functions.
// Benefit: if a URL changes, you change it in ONE place.

const BASE_URL = "/api"; // relative → goes through the Vite proxy to http://localhost:8000

// One helper that every function uses: sends the request, handles errors, parses JSON.
async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    // Try to show the backend's error message. Both backends send {"detail": ...}:
    //   a string ("Item 5 not found") or a list (validation errors).
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body.detail === "string") {
        message = body.detail;
      } else if (Array.isArray(body.detail)) {
        // FastAPI: [{ msg: "...", loc: [...] }]   Flask (ours): ["..."]
        message = body.detail.map((d) => d.msg ?? d).join(", ");
      }
    } catch {
      // the body wasn't JSON, so keep the generic message
    }
    throw new Error(message);
  }

  if (response.status === 204) return null; // No Content → nothing to parse
  return response.json();
}

export function getItems() {
  return request("/items");
}

export function createItem(name) {
  return request("/items", { method: "POST", body: JSON.stringify({ name }) });
}

export function updateItem(id, changes) {
  return request(`/items/${id}`, { method: "PATCH", body: JSON.stringify(changes) });
}

export function deleteItem(id) {
  return request(`/items/${id}`, { method: "DELETE" });
}
