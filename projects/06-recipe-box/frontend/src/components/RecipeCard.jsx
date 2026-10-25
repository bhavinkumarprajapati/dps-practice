export default function RecipeCard({ recipe, onDelete }) {
  return (
    <article className="recipe-card">
      <header>
        <h3>
          {recipe.title} {recipe.vegetarian && <span title="Vegetarian">🌱</span>}
        </h3>
        <button onClick={() => onDelete(recipe.id)} aria-label={`Delete ${recipe.title}`}>
          🗑
        </button>
      </header>
      <p className="muted">🍽 {recipe.servings} servings</p>
      <ul>
        {recipe.ingredients.map((ingredient) => (
          <li key={ingredient}>{ingredient}</li>
        ))}
      </ul>
    </article>
  );
}
