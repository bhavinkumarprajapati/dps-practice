// NOTE: this whole board is ONE big component on purpose. Task 2 asks you to split it up.
import { useEffect, useState } from "react";
import * as api from "./api.js";

const COLUMNS = [
  { status: "todo", title: "To do" },
  { status: "doing", title: "Doing" },
  { status: "done", title: "Done" },
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getTasks()
      .then(setTasks)
      .catch((err) => setError(err.message));
  }, []);

  async function handleAdd(event) {
    event.preventDefault();
    try {
      const created = await api.createTask(newTitle);
      setTasks((prev) => [...prev, created]);
      setNewTitle("");
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="board-page">
      <h1>🗂 Task Board</h1>

      <form className="todo-form" onSubmit={handleAdd}>
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New task…" />
        <button type="submit" className="primary">
          Add
        </button>
      </form>
      {error && <p className="error">⚠️ {error}</p>}

      <div className="board">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.status);
          return (
            <section key={column.status} className="column">
              <h2>
                {column.title} <span className="count">{columnTasks.length}</span>
              </h2>
              {columnTasks.length === 0 && <p className="muted">Nothing here</p>}
              {columnTasks.map((task) => (
                <div key={task.id} className="task-card">
                  <span>{task.title}</span>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
