import { useState } from "react";
import Lesson1Types from "./lessons/Lesson1Types";
import Lesson2TypedProps from "./lessons/Lesson2TypedProps";
import Lesson3TypedState from "./lessons/Lesson3TypedState";
import Lesson4TypedEvents from "./lessons/Lesson4TypedEvents";
import Lesson5TypedFetch from "./lessons/Lesson5TypedFetch";

// An array of objects with a declared shape. `() => JSX.Element` = "a component with no props".
const lessons: { title: string; component: () => JSX.Element }[] = [
  { title: "1. TS basics", component: Lesson1Types },
  { title: "2. Typed props", component: Lesson2TypedProps },
  { title: "3. Typed state", component: Lesson3TypedState },
  { title: "4. Typed events & forms", component: Lesson4TypedEvents },
  { title: "5. Typed fetch", component: Lesson5TypedFetch },
];

export default function App() {
  const [current, setCurrent] = useState(0);
  const CurrentLesson = lessons[current].component;

  return (
    <div className="layout">
      <nav className="sidebar">
        <h2>TypeScript + React</h2>
        {lessons.map((lesson, index) => (
          <button key={lesson.title} className={index === current ? "active" : ""} onClick={() => setCurrent(index)}>
            {lesson.title}
          </button>
        ))}
      </nav>
      <main>
        <CurrentLesson />
      </main>
    </div>
  );
}
