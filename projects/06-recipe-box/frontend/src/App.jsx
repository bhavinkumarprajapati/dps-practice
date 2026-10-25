import { useEffect, useState } from "react";
import * as api from "./api.js";
import RecipeForm from "./components/RecipeForm.jsx";
import RecipeCard from "./components/RecipeCard.jsx";

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getRecipes()
      .then(setRecipes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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

  async function handleDelete(id) {
    try {
      await api.deleteRecipe(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container wide">
      <h1>🍳 Recipe Box</h1>
      <RecipeForm onCreate={handleCreate} />

      {error && <p className="error">⚠️ {error}</p>}
      {loading && <p>Loading…</p>}

      <div className="grid">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
