export default function BookTable({ books, selectedId, onSelect }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Year</th>
          <th>Genre</th>
        </tr>
      </thead>
      <tbody>
        {books.map((book) => (
          <tr key={book.id} className={book.id === selectedId ? "selected" : ""} onClick={() => onSelect(book.id)}>
            <td>{book.title}</td>
            <td>{book.author}</td>
            <td>{book.year}</td>
            <td>{book.genre}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
