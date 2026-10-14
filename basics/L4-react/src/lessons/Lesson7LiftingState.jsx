/*
 * LESSON 7: Lifting state up (how components talk to each other)
 * ----------------------------------------------------------------
 * This is the most important pattern for the interview. Almost every real app is built like this.
 *
 * Problem: <AddItemForm> creates items, <ItemList> shows them. They are siblings, so how do they share data?
 * Answer:  move ("lift") the state UP to their common parent, then:
 *    - pass DATA down as props           → <ItemList items={items} />
 *    - pass FUNCTIONS (callbacks) down   → <AddItemForm onAdd={addItem} />
 *    - the child CALLS the function       → props.onAdd("Milk")   ("events go up")
 *
 *                 ShoppingPage  (owns: items, addItem, removeItem)
 *                 /            \
 *   AddItemForm (onAdd)     ItemList (items, onRemove)
 *                                \
 *                           ItemRow (item, onRemove)
 *
 * Naming convention: props that are callbacks start with "on" (onAdd, onRemove, onChange),
 * the functions that implement them often start with "handle" or a verb (handleAdd, addItem).
 *
 * 🧪 TRY IT
 *   a) Add a <Summary items={items} /> component that shows "3 items, 1 bought".
 *   b) Add a "bought" checkbox in ItemRow → needs a new callback onToggle passed down 2 levels.
 *   c) Add a "Clear all" button in ShoppingPage.
 *   d) Draw the component tree on paper with the props on each arrow. Do this in the interview too!
 */
import { useState } from "react";

function AddItemForm({ onAdd }) {
  // Local state: only the form needs to know what's being typed
  const [name, setName] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim()); // ← tell the parent. The child does NOT change the list itself.
    setName("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add an item…" />{" "}
      <button type="submit" className="primary">Add</button>
    </form>
  );
}

function ItemRow({ item, onRemove }) {
  return (
    <li>
      {item.name} <button onClick={() => onRemove(item.id)}>✕</button>
    </li>
  );
}

function ItemList({ items, onRemove }) {
  if (items.length === 0) return <p>The list is empty.</p>;
  return (
    <ul>
      {items.map((item) => (
        <ItemRow key={item.id} item={item} onRemove={onRemove} />
      ))}
    </ul>
  );
}

function ShoppingPage() {
  // The SHARED state lives in the common parent
  const [items, setItems] = useState([
    { id: 1, name: "Brezel", bought: false },
    { id: 2, name: "Apples", bought: true },
  ]);

  function addItem(name) {
    setItems([...items, { id: Date.now(), name, bought: false }]);
  }

  function removeItem(id) {
    setItems(items.filter((item) => item.id !== id));
  }

  return (
    <div className="card">
      <h3>Shopping list</h3>
      <AddItemForm onAdd={addItem} />
      <ItemList items={items} onRemove={removeItem} />
    </div>
  );
}

export default function Lesson7LiftingState() {
  return (
    <>
      <h1>Lesson 7: Lifting state up</h1>
      <ShoppingPage />
      <p className="note">
        In L6-fullstack you'll see exactly this structure, but addItem/removeItem also call the backend.
      </p>
    </>
  );
}
