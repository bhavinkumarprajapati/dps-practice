/*
 * LESSON 4: Lists, keys and derived values
 * ----------------------------------------
 * Render an array with .map(): each item becomes a JSX element.
 *   {tasks.map(task => <li key={task.id}>{task.title}</li>)}
 *
 * - Every element in a list needs a unique, STABLE `key` (usually the id from the database).
 *   React uses it to know which item changed. Avoid using the array index as key when items can be
 *   added, removed or reordered.
 * - .filter() → keep some items     .map() → transform each item     .reduce() / .length → summaries
 * - DERIVED values: if you can CALCULATE something from existing state (counts, filtered lists, totals),
 *   calculate it during render. DON'T store it in a second useState (it can get out of sync).
 *
 * 🧪 TRY IT
 *   a) Add a "Delete" button to each task:  setTasks(tasks.filter(t => t.id !== task.id))
 *   b) Add a filter "Done" option.
 *   c) Show "No tasks to show 🎉" when the filtered list is empty.
 *   d) Sort the visible tasks alphabetically. Hint: [...visibleTasks].sort((a, b) => a.title.localeCompare(b.title))
 *      (copy first with [...], because .sort() mutates the array!)
 */
import { useState } from "react";

const initialTasks = [
  { id: 1, title: "Install Python and Node", done: true },
  { id: 2, title: "Finish React basics", done: false },
  { id: 3, title: "Build the full-stack app", done: false },
  { id: 4, title: "Book the DPS interview", done: true },
];

export default function Lesson4Lists() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("all"); // "all" | "open"

  // Toggle one item: map over the list, replace ONLY the matching item with a changed copy.
  function toggleTask(id) {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  }

  // Derived values: computed on every render, no extra state needed.
  const visibleTasks = filter === "open" ? tasks.filter((task) => !task.done) : tasks;
  const openCount = tasks.filter((task) => !task.done).length;

  return (
    <>
      <h1>Lesson 4: Lists & keys</h1>
      <div className="card">
        <p>
          <b>{openCount}</b> of {tasks.length} tasks open
        </p>

        <label>
          Show:{" "}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="open">Open</option>
          </select>
        </label>

        <ul>
          {visibleTasks.map((task) => (
            <li key={task.id}>
              <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />{" "}
              <span className={task.done ? "done" : ""}>{task.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
