/*
 * LESSON 1: JSX
 * -------------
 * A React component is a FUNCTION that returns JSX (HTML-like syntax inside JavaScript).
 * Rules:
 *   1. Component names start with a Capital letter: <Lesson1JSX />, not <lesson1JSX />.
 *   2. Return ONE root element. Wrap siblings in <div> or a Fragment <>...</>.
 *   3. {curly braces} = "switch to JavaScript": variables, calculations, function calls.
 *   4. Use className instead of class, and style={{ color: "red" }} (an object) instead of a string.
 *   5. Every tag must be closed: <br />, <img />, <input />.
 *
 * 🧪 TRY IT
 *   a) Change `name` to your own name and save. The page updates instantly (hot reload).
 *   b) Add a variable `city = "Munich"` and show "I am moving to Munich".
 *   c) Show "Good morning" if hour < 12, else "Good afternoon" (use a ternary: cond ? a : b).
 *   d) Break rule 2 on purpose (return two <p> without a wrapper) and read the error.
 */

export default function Lesson1JSX() {
  const name = "Jahanvi";
  const skills = ["Python", "FastAPI", "React"];
  const hour = new Date().getHours();
  const isLearning = true;

  return (
    <>
      <h1>Lesson 1: JSX</h1>

      <div className="card">
        {/* This is a comment inside JSX */}
        <p>Hello, {name}! 👋</p>
        <p>2 + 3 = {2 + 3}</p>
        <p>Your name in capitals: {name.toUpperCase()}</p>
        <p>You know {skills.length} skills: {skills.join(", ")}</p>
        <p>The current hour is {hour}.</p>
      </div>

      <div className="card">
        {/* Conditional rendering, way 1: ternary (if/else) */}
        <p>{isLearning ? "📚 Currently learning" : "😴 Taking a break"}</p>

        {/* Conditional rendering, way 2: && (show only if true) */}
        {isLearning && <p className="note">This line only appears when isLearning is true.</p>}

        {/* Inline style is an object: outer {} = JS, inner {} = object */}
        <p style={{ color: "#3b5bdb", fontWeight: "bold" }}>Styled with an object</p>
      </div>
    </>
  );
}
