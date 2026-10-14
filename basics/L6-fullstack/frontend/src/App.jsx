// App = the "smart" component: it OWNS the state and talks to the API.
// The components in ./components are "presentational": they get data + callbacks via props.
import { useEffect, useState } from "react";
import * as api from "./api.js";
import ItemForm from "./components/ItemForm.jsx";
import ItemList from "./components/ItemList.jsx";

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load the list once when the page opens
  useEffect(() => {
    api
      .getItems()
      .then((data) => setItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Each handler: call the API, then update local state with the SERVER's answer.
  async function handleAdd(name) {
    try {
      const created = await api.createItem(name);
      setItems((prev) => [...prev, created]);
      setError(null);
      return true; // tells the form it can clear its input
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  async function handleToggle(item) {
    try {
      const updated = await api.updateItem(item.id, { bought: !item.bought });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  const boughtCount = items.filter((i) => i.bought).length;

  return (
    <div className="container">
      <h1>🛒 Shopping list</h1>
      <ItemForm onAdd={handleAdd} />

      {error && <p className="error">⚠️ {error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <ItemList items={items} onToggle={handleToggle} onDelete={handleDelete} />
          <p className="summary">
            {items.length} items · {boughtCount} bought
          </p>
        </>
      )}
    </div>
  );
}
