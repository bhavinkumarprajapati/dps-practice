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

export function getRecipes() {
  return request("/recipes");
}

export function createRecipe(recipe) {
  return request("/recipes", { method: "POST", body: JSON.stringify(recipe) });
}

export function deleteRecipe(id) {
  return request(`/recipes/${id}`, { method: "DELETE" });
}
