import { useState } from "react";

const EMPTY_FORM = { title: "", ingredients: "", servings: 2, vegetarian: false };

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
