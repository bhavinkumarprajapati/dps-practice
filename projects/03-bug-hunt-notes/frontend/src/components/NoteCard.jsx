export default function NoteCard({ note, onDelete }) {
  const created = new Date(note.created_at).toLocaleString();

  return (
    <article className="note">
      <header>
        <h3>{note.title}</h3>
        <button onClick={() => onDelete(note.id)} aria-label={`Delete ${note.title}`}>
          🗑
        </button>
      </header>
      <p>{note.text}</p>
      <footer className="muted">{created}</footer>
    </article>
  );
}
