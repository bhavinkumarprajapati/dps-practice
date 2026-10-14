/*
 * LESSON 2: Typed props
 * ---------------------
 * Describe the props with a type, then use it in the function signature:
 *
 *   type BadgeProps = { label: string; color?: "green" | "red" };
 *   function Badge({ label, color = "green" }: BadgeProps) { ... }
 *
 * - Callback props:   onSelect: (id: number) => void      ("a function taking a number, returning nothing")
 * - children:         children: React.ReactNode             (anything renderable)
 * - Now if a parent forgets a required prop or passes the wrong type → red squiggle. 🎉
 *
 * 🧪 TRY IT
 *   a) Remove `label` from one <Badge />. Read the error.
 *   b) Pass color="blue". Error? Add "blue" to the union and to the colors map.
 *   c) Add an optional prop `subtitle?: string` to Panel and render it only if given.
 */
import type { ReactNode } from "react";

type BadgeProps = {
  label: string;
  color?: "green" | "red" | "gray";
};

const colors = { green: "#2f9e44", red: "#c92a2a", gray: "#868e96" };

function Badge({ label, color = "gray" }: BadgeProps) {
  return (
    <span style={{ background: colors[color], color: "white", padding: "2px 8px", borderRadius: 12, fontSize: 12 }}>
      {label}
    </span>
  );
}

type PanelProps = {
  title: string;
  children: ReactNode;
};

function Panel({ title, children }: PanelProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

type Member = { id: number; name: string; role: string; active: boolean };

type MemberListProps = {
  members: Member[];
  onSelect: (id: number) => void; // a callback prop
};

function MemberList({ members, onSelect }: MemberListProps) {
  return (
    <ul>
      {members.map((m) => (
        <li key={m.id}>
          <button onClick={() => onSelect(m.id)}>{m.name}</button> {m.role}{" "}
          <Badge label={m.active ? "active" : "away"} color={m.active ? "green" : "red"} />
        </li>
      ))}
    </ul>
  );
}

const team: Member[] = [
  { id: 1, name: "Anna", role: "PM", active: true },
  { id: 2, name: "Ben", role: "Designer", active: false },
  { id: 3, name: "Chen", role: "Engineer", active: true },
];

export default function Lesson2TypedProps() {
  return (
    <>
      <h1>Lesson 2: Typed props</h1>
      <Panel title="Team">
        <MemberList members={team} onSelect={(id) => alert(`Selected member ${id}`)} />
      </Panel>
      <Panel title="Badges">
        <Badge label="default" /> <Badge label="ok" color="green" /> <Badge label="blocked" color="red" />
      </Panel>
    </>
  );
}
