// All backend calls for the counter.

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.detail === "string" ? body.detail : `Request failed (${response.status})`);
  }
  return response.json();
}

export function getCounter() {
  return request("/counter");
}

export function increment() {
  return request("/counter/increment", { method: "POST" });
}
