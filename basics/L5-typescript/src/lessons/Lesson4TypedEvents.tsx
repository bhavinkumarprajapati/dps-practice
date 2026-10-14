/*
 * LESSON 4: Typed events & forms
 * ------------------------------
 * Inline handlers need NO types, because TS infers them:
 *     <input onChange={(e) => setTitle(e.target.value)} />
 *
 * Separate handler functions DO need the event type:
 *     function handleChange(e: React.ChangeEvent<HTMLInputElement>) { ... }
 *     function handleSubmit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); ... }
 *     function handleClick(e: React.MouseEvent<HTMLButtonElement>) { ... }
 *     <select> → React.ChangeEvent<HTMLSelectElement>
 *
 * Trick: don't remember them, just hover over `onChange` in VS Code and it shows you the type.
 *
 * 🧪 TRY IT
 *   a) Add a <select> for the language level (A1–C2) with a typed handler function.
 *   b) Add validation: email must contain "@".
 *   c) Make one form state object instead of 3 states:
 *        const [form, setForm] = useState<SignupForm>({ name: "", email: "", newsletter: false });
 *        and one handler: setForm({ ...form, [e.target.name]: e.target.value })
 */
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

type Signup = { name: string; email: string; newsletter: boolean };

export default function Lesson4TypedEvents() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Name needs at least 2 characters");
      return;
    }
    setSignups([...signups, { name: name.trim(), email, newsletter }]);
    setName("");
    setEmail("");
    setNewsletter(false);
    setError(null);
  }

  return (
    <>
      <h1>Lesson 4: Typed events & forms</h1>
      <form className="card" onSubmit={handleSubmit}>
        <p>
          <input value={name} onChange={handleNameChange} placeholder="Name" />{" "}
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        </p>
        <p>
          <label>
            <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} /> Newsletter
          </label>
        </p>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="primary">Sign up</button>
      </form>
      <div className="card">
        <ul>
          {signups.map((s, i) => (
            <li key={i}>
              {s.name} ({s.email || "no email"}) {s.newsletter && "📬"}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
