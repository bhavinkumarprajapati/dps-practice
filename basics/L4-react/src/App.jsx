// The App is just a menu that shows one lesson at a time.
// (This itself is an example of state: `current` remembers which lesson is selected.)
import { useState } from "react";
import Lesson1JSX from "./lessons/Lesson1JSX.jsx";
import Lesson2Props from "./lessons/Lesson2Props.jsx";
import Lesson3State from "./lessons/Lesson3State.jsx";
import Lesson4Lists from "./lessons/Lesson4Lists.jsx";
import Lesson5Forms from "./lessons/Lesson5Forms.jsx";
import Lesson6Effects from "./lessons/Lesson6Effects.jsx";
import Lesson7LiftingState from "./lessons/Lesson7LiftingState.jsx";

const lessons = [
  { title: "1. JSX", component: Lesson1JSX },
  { title: "2. Props", component: Lesson2Props },
  { title: "3. State", component: Lesson3State },
  { title: "4. Lists & keys", component: Lesson4Lists },
  { title: "5. Forms", component: Lesson5Forms },
  { title: "6. useEffect + fetch", component: Lesson6Effects },
  { title: "7. Lifting state up", component: Lesson7LiftingState },
];

export default function App() {
  const [current, setCurrent] = useState(0);
  const CurrentLesson = lessons[current].component; // a component stored in a variable must start with a capital letter

  return (
    <div className="layout">
      <nav className="sidebar">
        <h2>React basics</h2>
        {lessons.map((lesson, index) => (
          <button
            key={lesson.title}
            className={index === current ? "active" : ""}
            onClick={() => setCurrent(index)}
          >
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
