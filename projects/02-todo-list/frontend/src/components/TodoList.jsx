import TodoItem from "./TodoItem.jsx";

export default function TodoList({ todos }) {
  if (todos.length === 0) {
    return <p className="muted">No todos yet.</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
