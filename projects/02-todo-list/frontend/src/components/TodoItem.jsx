export default function TodoItem({ todo }) {
  return (
    <li>
      <span className={todo.done ? "title done" : "title"}>{todo.title}</span>
    </li>
  );
}
