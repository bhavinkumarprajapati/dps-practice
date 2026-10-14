import { useEffect, useState } from "react";
import * as api from "./api.js";
import TodoForm from "./components/TodoForm.jsx";
import TodoList from "./components/TodoList.jsx";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getTodos()
      .then(setTodos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(title) {
    try {
      const created = await api.createTodo(title);
      setTodos((prev) => [...prev, created]);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  return (
    <div className="container">
      <h1>✅ Todo List</h1>
      <TodoForm onAdd={handleAdd} />
      {error && <p className="error">⚠️ {error}</p>}
      {loading ? <p>Loading…</p> : <TodoList todos={todos} />}
    </div>
  );
}
