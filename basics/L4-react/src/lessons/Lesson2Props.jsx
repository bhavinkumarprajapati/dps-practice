/*
 * LESSON 2: Props
 * ---------------
 * Props are the INPUTS of a component, like function arguments.
 * The PARENT passes them:   <ProfileCard name="Anna" role="Designer" />
 * The CHILD receives them:  function ProfileCard({ name, role }) { ... }   (destructuring)
 *
 * - Props are READ-ONLY. A child must never change its props.
 * - Any value can be a prop: strings, numbers ({42}), booleans, arrays, objects, even FUNCTIONS (Lesson 7).
 * - `children` is a special prop: whatever you put between <Card> ... </Card>.
 * - Default values: function Badge({ color = "gray" }).
 *
 * 🧪 TRY IT
 *   a) Add a 4th <ProfileCard /> for yourself.
 *   b) Add a prop `yearsOfExperience` (a number) and show it in the card.
 *   c) Make Badge show a red badge when the prop `urgent` is true.
 *   d) Forget to pass `name` to one card. What shows? (undefined renders as nothing)
 */

// A small reusable component with a DEFAULT prop value
function Badge({ text, color = "#868e96" }) {
  return (
    <span style={{ background: color, color: "white", padding: "2px 8px", borderRadius: 12, fontSize: 12 }}>
      {text}
    </span>
  );
}

// A component that uses `children`
function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

// A component built from other components
function ProfileCard({ name, role, isMentor }) {
  return (
    <Card title={name}>
      <p>
        Role: {role} {isMentor && <Badge text="Mentor" color="#2f9e44" />}
      </p>
    </Card>
  );
}

export default function Lesson2Props() {
  return (
    <>
      <h1>Lesson 2: Props</h1>
      <ProfileCard name="Anna" role="Product Manager" isMentor={true} />
      <ProfileCard name="Ben" role="Designer" isMentor={false} />
      <ProfileCard name="Chen" role="Software Engineer" />
      <p className="note">
        One component, three different outputs. Same idea as calling one function with different arguments.
      </p>
    </>
  );
}
