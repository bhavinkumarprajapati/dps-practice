# Solution 06: Recipe Box

## How to approach it (what to say out loud)

1. **Task 1:** *"This is an add-a-field task, so I go backend first: seed data, validation, the dict in `create_recipe`.
   I check it with pytest before touching React. Then the form state, the input, `Number()` because inputs give strings,
   and finally the card."*
2. **Task 2:** *"Query params in Flask are strings, so I convert `max_time` with `int()` inside `try/except` and return 400
   for bad input. In React, the two checkboxes are state, and the fetch effect depends on them, so a change re-fetches."*
3. **Task 3:** *"`favorite` is a server-side field, toggled with PATCH. The order 'favourites first' is a display concern,
   so I sort a **copy** in the render. The state keeps the server order."*

## Key decisions

| Question | Choice | Why |
|---|---|---|
| Validation message | Exact text from the task | The UI shows `detail` directly, so the backend owns the wording. |
| `True` as cooking_time | Rejected | `isinstance(True, int)` is `True` in Python. That's why there's a helper `is_whole_number`. |
| Filtering | Backend | Works for big data sets; frontend only builds the URL. |
| Sorting favourites | Frontend, on a copy | `sort()` mutates. `[...recipes].sort(...)` keeps state immutable. |
| PATCH vs PUT for favourite | PATCH | We change one field, not the whole recipe. |

## Answers to the follow-up questions

1. **Why validate in the backend too?** Anyone can call the API directly (curl, Swagger, another app). The frontend input
   can be bypassed with DevTools. The backend is the only place we can trust.
2. **`bool` vs `int`?** In Python, `bool` is a subclass of `int`: `True == 1`. Without the extra check, `{"cooking_time": true}` would pass.
3. **Sort in the backend when:** the list is paginated (the frontend only has one page), or many clients need the same order.
4. **Old rows in a real DB:** they'd have no value. You'd write a **migration** that adds the column with a default
   (or allows NULL), and decide what the UI shows for "unknown".

**Edge case worth mentioning:** with "Quick" active, a new 45-minute recipe still appears in the list until the next
re-fetch. Options: re-fetch after creating, or check the filter before adding it to state.

## Final code (changed files)

**`backend/app.py`**

```python
"""
Recipe Box API (Flask, in-memory)

Run:  flask --app app run --debug --port 8000
Try:  http://localhost:8000/api/recipes?max_time=30&vegetarian=true
"""

from flask import Flask, abort, jsonify, request

app = Flask(__name__)

recipes = [
    {
        "id": 1,
        "title": "Pancakes",
        "ingredients": ["flour", "milk", "eggs", "sugar"],
        "servings": 4,
        "vegetarian": True,
        "cooking_time": 20,  # Task 1
        "favorite": False,  # Task 3
    },
    {
        "id": 2,
        "title": "Chicken Curry",
        "ingredients": ["chicken", "onion", "tomato", "curry paste", "rice"],
        "servings": 3,
        "vegetarian": False,
        "cooking_time": 45,
        "favorite": False,
    },
    {
        "id": 3,
        "title": "Dal Tadka",
        "ingredients": ["lentils", "onion", "garlic", "cumin", "ghee"],
        "servings": 4,
        "vegetarian": True,
        "cooking_time": 40,
        "favorite": False,
    },
    {
        "id": 4,
        "title": "Obatzda",
        "ingredients": ["camembert", "butter", "onion", "paprika"],
        "servings": 2,
        "vegetarian": True,
        "cooking_time": 10,
        "favorite": False,
    },
]
next_id = 5


# ---------- JSON error responses ----------
@app.errorhandler(400)
def bad_request(error):
    return jsonify({"detail": error.description}), 400


@app.errorhandler(404)
def not_found(error):
    return jsonify({"detail": error.description}), 404


def find_recipe(recipe_id):
    for recipe in recipes:
        if recipe["id"] == recipe_id:
            return recipe
    abort(404, description=f"Recipe {recipe_id} not found")


def is_whole_number(value):
    # bool is a subclass of int in Python (True == 1), so exclude it explicitly
    return isinstance(value, int) and not isinstance(value, bool)


def validate_recipe(data):
    """Return an error message (str) if the data is invalid, otherwise None."""
    title = data.get("title")
    if not isinstance(title, str) or not title.strip():
        return "title is required"

    ingredients = data.get("ingredients")
    if (
        not isinstance(ingredients, list)
        or len(ingredients) == 0
        or not all(isinstance(i, str) and i.strip() for i in ingredients)
    ):
        return "ingredients must be a non-empty list of strings"

    servings = data.get("servings")
    if not is_whole_number(servings) or not 1 <= servings <= 20:
        return "servings must be a whole number between 1 and 20"

    if not isinstance(data.get("vegetarian", False), bool):
        return "vegetarian must be true or false"

    # Task 1
    cooking_time = data.get("cooking_time")
    if not is_whole_number(cooking_time) or not 1 <= cooking_time <= 600:
        return "cooking_time must be a whole number between 1 and 600"

    return None


# ---------- routes ----------
@app.get("/api/recipes")
def list_recipes():
    result = recipes

    # Task 2: max_time filter (query params are always strings!)
    max_time = request.args.get("max_time")
    if max_time is not None:
        try:
            max_time = int(max_time)
        except ValueError:
            abort(400, description="max_time must be a positive number")
        if max_time <= 0:
            abort(400, description="max_time must be a positive number")
        result = [r for r in result if r["cooking_time"] <= max_time]

    # Task 2: vegetarian filter
    if request.args.get("vegetarian", "").lower() == "true":
        result = [r for r in result if r["vegetarian"]]

    # Bonus: ingredient search
    ingredient = request.args.get("ingredient", "").strip().lower()
    if ingredient:
        result = [r for r in result if any(ingredient in i.lower() for i in r["ingredients"])]

    return jsonify(result)


@app.get("/api/recipes/<int:recipe_id>")
def get_recipe(recipe_id):
    return find_recipe(recipe_id)


@app.post("/api/recipes")
def create_recipe():
    global next_id
    data = request.get_json(silent=True) or {}
    error = validate_recipe(data)
    if error:
        abort(400, description=error)

    recipe = {
        "id": next_id,
        "title": data["title"].strip(),
        "ingredients": [i.strip() for i in data["ingredients"]],
        "servings": data["servings"],
        "vegetarian": data.get("vegetarian", False),
        "cooking_time": data["cooking_time"],  # Task 1
        "favorite": False,  # Task 3: new recipes are never favourites
    }
    next_id += 1
    recipes.append(recipe)
    return recipe, 201


# Task 3
@app.patch("/api/recipes/<int:recipe_id>")
def update_recipe(recipe_id):
    recipe = find_recipe(recipe_id)
    data = request.get_json(silent=True) or {}
    if not isinstance(data.get("favorite"), bool):
        abort(400, description="favorite must be true or false")
    recipe["favorite"] = data["favorite"]
    return recipe


@app.delete("/api/recipes/<int:recipe_id>")
def delete_recipe(recipe_id):
    recipes.remove(find_recipe(recipe_id))
    return "", 204
```

**`backend/test_app.py`**

```python
import copy

import pytest

import app as recipe_app

client = recipe_app.app.test_client()

VALID = {"title": "Toast", "ingredients": ["bread", "butter"], "servings": 1, "vegetarian": True, "cooking_time": 5}


@pytest.fixture(autouse=True)
def reset_data():
    saved, saved_next_id = copy.deepcopy(recipe_app.recipes), recipe_app.next_id
    yield
    recipe_app.recipes[:] = saved
    recipe_app.next_id = saved_next_id


def titles(response):
    return [r["title"] for r in response.get_json()]


def test_list_recipes():
    response = client.get("/api/recipes")
    assert response.status_code == 200
    assert len(response.get_json()) == 4


def test_create_recipe():
    response = client.post("/api/recipes", json=VALID)
    assert response.status_code == 201
    assert response.get_json()["id"] == 5
    assert response.get_json()["cooking_time"] == 5  # Task 1
    assert response.get_json()["favorite"] is False


def test_create_recipe_without_ingredients_returns_400():
    response = client.post("/api/recipes", json={**VALID, "ingredients": []})
    assert response.status_code == 400
    assert response.get_json()["detail"] == "ingredients must be a non-empty list of strings"


def test_delete_recipe():
    assert client.delete("/api/recipes/1").status_code == 204
    assert client.get("/api/recipes/1").status_code == 404


# Task 1
@pytest.mark.parametrize("bad", [0, 601, "20", True, None])
def test_invalid_cooking_time_returns_400(bad):
    response = client.post("/api/recipes", json={**VALID, "cooking_time": bad})
    assert response.status_code == 400
    assert response.get_json()["detail"] == "cooking_time must be a whole number between 1 and 600"


# Task 2
def test_filter_quick_and_vegetarian():
    response = client.get("/api/recipes", query_string={"max_time": "30", "vegetarian": "true"})
    assert titles(response) == ["Pancakes", "Obatzda"]


def test_filter_invalid_max_time_returns_400():
    assert client.get("/api/recipes", query_string={"max_time": "soon"}).status_code == 400
    assert client.get("/api/recipes", query_string={"max_time": "-5"}).status_code == 400


# Task 3
def test_mark_favorite():
    response = client.patch("/api/recipes/3", json={"favorite": True})
    assert response.status_code == 200
    assert response.get_json()["favorite"] is True


def test_mark_favorite_invalid_returns_400():
    assert client.patch("/api/recipes/3", json={"favorite": "yes"}).status_code == 400


# Bonus
def test_filter_by_ingredient():
    assert titles(client.get("/api/recipes", query_string={"ingredient": "ONION"})) == [
        "Chicken Curry",
        "Dal Tadka",
        "Obatzda",
    ]
```

**`frontend/src/api.js`**

```js
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

// Task 2: filters → query string, e.g. { maxTime: 30, vegetarian: true } → ?max_time=30&vegetarian=true
export function getRecipes({ maxTime, vegetarian } = {}) {
  const params = new URLSearchParams();
  if (maxTime) params.set("max_time", maxTime);
  if (vegetarian) params.set("vegetarian", "true");
  const query = params.toString();
  return request(query ? `/recipes?${query}` : "/recipes");
}

export function createRecipe(recipe) {
  return request("/recipes", { method: "POST", body: JSON.stringify(recipe) });
}

// Task 3
export function setFavorite(id, favorite) {
  return request(`/recipes/${id}`, { method: "PATCH", body: JSON.stringify({ favorite }) });
}

export function deleteRecipe(id) {
  return request(`/recipes/${id}`, { method: "DELETE" });
}
```

**`frontend/src/App.jsx`**

```jsx
import { useEffect, useState } from "react";
import * as api from "./api.js";
import RecipeForm from "./components/RecipeForm.jsx";
import RecipeCard from "./components/RecipeCard.jsx";

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quickOnly, setQuickOnly] = useState(false); // Task 2
  const [vegOnly, setVegOnly] = useState(false); // Task 2

  // Task 2: re-fetch whenever a filter changes
  useEffect(() => {
    setLoading(true);
    api
      .getRecipes({ maxTime: quickOnly ? 30 : null, vegetarian: vegOnly })
      .then((data) => {
        setRecipes(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [quickOnly, vegOnly]);

  // Returns an error message for the form, or null on success
  async function handleCreate(recipe) {
    try {
      const created = await api.createRecipe(recipe);
      setRecipes((prev) => [...prev, created]);
      return null;
    } catch (err) {
      return err.message;
    }
  }

  // Task 3
  async function handleToggleFavorite(recipe) {
    try {
      const updated = await api.setFavorite(recipe.id, !recipe.favorite);
      setRecipes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteRecipe(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  // Task 3: favourites first. Sort a COPY (sort() mutates!). Stable sort keeps the original order otherwise.
  const sortedRecipes = [...recipes].sort((a, b) => Number(b.favorite) - Number(a.favorite));

  return (
    <div className="container wide">
      <h1>🍳 Recipe Box</h1>
      <RecipeForm onCreate={handleCreate} />

      {/* Task 2 */}
      <div className="filters">
        <label>
          <input type="checkbox" checked={quickOnly} onChange={(e) => setQuickOnly(e.target.checked)} /> Quick (≤ 30
          min)
        </label>
        <label>
          <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} /> Vegetarian only
        </label>
      </div>

      {error && <p className="error">⚠️ {error}</p>}
      {loading && <p>Loading…</p>}
      {!loading && !error && recipes.length === 0 && <p className="muted">No recipes match your filters.</p>}

      <div className="grid">
        {sortedRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}
```

**`frontend/src/components/RecipeForm.jsx`**

```jsx
import { useState } from "react";

const EMPTY_FORM = { title: "", ingredients: "", servings: 2, cooking_time: 30, vegetarian: false }; // Task 1

// Props: onCreate(recipe) → async, resolves to an error message (string) or null on success
export default function RecipeForm({ onCreate }) {
  const [form, setForm] = useState(EMPTY_FORM); // one object for all fields
  const [error, setError] = useState(null);

  // One change handler for every input: uses the input's `name` attribute as the key
  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const recipe = {
      title: form.title,
      // textarea: one ingredient per line → array of strings
      ingredients: form.ingredients
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== ""),
      servings: Number(form.servings),
      cooking_time: Number(form.cooking_time), // Task 1: inputs give strings
      vegetarian: form.vegetarian,
    };
    const message = await onCreate(recipe);
    if (message) {
      setError(message); // show the backend's validation message
    } else {
      setError(null);
      setForm(EMPTY_FORM);
    }
  }

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      <h2>New recipe</h2>
      <input name="title" value={form.title} onChange={handleChange} placeholder="Title" />
      <textarea
        name="ingredients"
        value={form.ingredients}
        onChange={handleChange}
        placeholder={"Ingredients, one per line\nflour\nmilk"}
        rows={4}
      />
      <div className="row">
        <label>
          Servings{" "}
          <input name="servings" type="number" value={form.servings} onChange={handleChange} style={{ width: 70 }} />
        </label>
        {/* Task 1 */}
        <label>
          Cooking time (min){" "}
          <input
            name="cooking_time"
            type="number"
            value={form.cooking_time}
            onChange={handleChange}
            style={{ width: 80 }}
          />
        </label>
        <label>
          <input name="vegetarian" type="checkbox" checked={form.vegetarian} onChange={handleChange} /> Vegetarian
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <button type="submit" className="primary">
        Save recipe
      </button>
    </form>
  );
}
```

**`frontend/src/components/RecipeCard.jsx`**

```jsx
export default function RecipeCard({ recipe, onDelete, onToggleFavorite }) {
  return (
    <article className="recipe-card">
      <header>
        <h3>
          {recipe.title} {recipe.vegetarian && <span title="Vegetarian">🌱</span>}
        </h3>
        <div className="row">
          {/* Task 3 */}
          <button
            onClick={() => onToggleFavorite(recipe)}
            aria-label={recipe.favorite ? "Remove from favourites" : "Add to favourites"}
          >
            {recipe.favorite ? "★" : "☆"}
          </button>
          <button onClick={() => onDelete(recipe.id)} aria-label={`Delete ${recipe.title}`}>
            🗑
          </button>
        </div>
      </header>
      {/* Task 1 */}
      <p className="muted">
        🍽 {recipe.servings} servings · ⏱ {recipe.cooking_time} min
      </p>
      <ul>
        {recipe.ingredients.map((ingredient) => (
          <li key={ingredient}>{ingredient}</li>
        ))}
      </ul>
    </article>
  );
}
```
