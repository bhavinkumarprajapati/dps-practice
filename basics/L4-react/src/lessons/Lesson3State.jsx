/*
 * LESSON 3: State (useState)
 * --------------------------
 * State = data that CHANGES over time and should update the screen when it changes.
 *
 *   const [count, setCount] = useState(0);
 *          ^value  ^setter            ^initial value
 *
 * - NEVER change state directly (count = 5 ❌). Always use the setter (setCount(5) ✅).
 *   Calling the setter tells React "re-run this component function and update the screen".
 * - A normal variable (let x = 0) resets on every render, so the screen never sees changes. That's why we need state.
 * - If the new value depends on the old one, use the updater form: setCount(c => c + 1).
 * - Objects/arrays: create a NEW object/array, don't mutate:
 *       setUser({ ...user, name: "Ben" })     setItems([...items, newItem])
 *
 * 🧪 TRY IT
 *   a) Add a "−1" button. Then make it impossible to go below 0 (disable the button when count is 0).
 *   b) Add a "Reset" button.
 *   c) Add a "+5" button that calls setCount(count + 1) five times. Why does it only add 1?
 *      Fix it with the updater form setCount(c => c + 1).
 *   d) In the profile card, add a button that toggles `isOnline` (true/false).
 */
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="card">
      <h3>Counter</h3>
      <p style={{ fontSize: 32, margin: "8px 0" }}>{count}</p>
      <button className="primary" onClick={() => setCount(count + 1)}>+1</button>{" "}
      {count >= 10 && <span className="note">That's a lot of clicks!</span>}
    </div>
  );
}

function ToggleText() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="card">
      <h3>Show / hide</h3>
      <button onClick={() => setIsOpen(!isOpen)}>{isOpen ? "Hide" : "Show"} details</button>
      {isOpen && <p>🎉 Here are the hidden details!</p>}
    </div>
  );
}

function ProfileEditor() {
  // State can be an object. Update it by creating a NEW object with the spread operator (...).
  const [user, setUser] = useState({ name: "Jahanvi", city: "Ahmedabad", isOnline: false });

  function moveToMunich() {
    setUser({ ...user, city: "Munich" }); // copy all fields, then overwrite city
  }

  return (
    <div className="card">
      <h3>Object in state</h3>
      <p>
        {user.name} lives in <b>{user.city}</b> and is {user.isOnline ? "🟢 online" : "⚪ offline"}.
      </p>
      <button onClick={moveToMunich}>Move to Munich</button>
    </div>
  );
}

export default function Lesson3State() {
  return (
    <>
      <h1>Lesson 3: State</h1>
      <Counter />
      <ToggleText />
      <ProfileEditor />
      <p className="note">
        Each component has its OWN state. If you render two &lt;Counter /&gt;s, they count independently.
      </p>
    </>
  );
}
