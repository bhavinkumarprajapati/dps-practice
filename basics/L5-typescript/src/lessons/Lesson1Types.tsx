/*
 * LESSON 1: TypeScript basics
 * ---------------------------
 * TypeScript = JavaScript + types. The types are CHECKED by your editor and by `npm run typecheck`,
 * then removed. The browser runs plain JavaScript. Types catch typos and wrong data BEFORE you run the app.
 *
 * Python type hints are very similar!
 *   Python:      def add(a: int, b: int) -> int:
 *   TypeScript:  function add(a: number, b: number): number {
 *
 * 🧪 TRY IT (watch the red squiggles in VS Code, and run `npm run typecheck`)
 *   a) Set `age = "twenty"`. What error do you get?
 *   b) Remove `email` from `anna`. Error? Then mark email optional in the interface (`email?: string`).
 *   c) Call formatPrice("10"). Error? Fix it.
 *   d) Add "archived" to the Status type and use it.
 */

// --- Primitive types -------------------------------------------------------
let age: number = 27;
const name: string = "Jahanvi";
const isStudent: boolean = false;
// Often you don't need to write the type: TS INFERS it from the value.
const city = "Munich"; // inferred: string

// --- Arrays ----------------------------------------------------------------
const skills: string[] = ["Python", "React"];
const scores: number[] = [90, 85];

// --- Objects: interface (or type) describes the SHAPE ----------------------
interface Person {
  name: string;
  email: string;
  age?: number; // ? = optional (may be missing → type is number | undefined)
}
const anna: Person = { name: "Anna", email: "anna@example.com" };

// --- Union types: "one of these" --------------------------------------------
type Status = "todo" | "in_progress" | "done";
const taskStatus: Status = "in_progress";
let maybeName: string | null = null; // very common: a value that might not exist yet
maybeName = "Ben";

// --- Functions: types for parameters and the return value -------------------
function formatPrice(amount: number, currency: string = "€"): string {
  return `${amount.toFixed(2)} ${currency}`;
}
// Arrow function with types
const double = (n: number): number => n * 2;

// --- Generics: "a list of SOMETHING", the <T> fills in the something --------
function first<T>(items: T[]): T | undefined {
  return items[0];
}
const firstSkill = first(skills); // TS knows: string | undefined

// --- Narrowing: TS understands if-checks ------------------------------------
function greet(person: Person): string {
  if (person.age === undefined) {
    return `Hi ${person.name}!`;
  }
  return `Hi ${person.name}, you are ${person.age}`; // here TS knows age is a number
}

export default function Lesson1Types() {
  return (
    <>
      <h1>Lesson 1: TypeScript basics</h1>
      <div className="card">
        <p>{name}, {age}, student: {String(isStudent)}, moving to {city}</p>
        <p>Skills: {skills.join(", ")} · scores: {scores.join(", ")}</p>
        <p>{greet(anna)}</p>
        <p>Status: {taskStatus} · maybeName: {maybeName ?? "(none)"}</p>
        <p>Price: {formatPrice(9.5)} · double(21) = {double(21)} · first skill: {firstSkill}</p>
      </div>
      <p className="note">
        <code>??</code> is the "nullish coalescing" operator: use the right side if the left is null/undefined.
        <br />
        <code>?.</code> is optional chaining: <code>user?.address?.city</code> doesn't crash if something is missing.
      </p>
    </>
  );
}
