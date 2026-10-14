import ItemRow from "./ItemRow.jsx";

// Props: items (array), onToggle(item), onDelete(id)
export default function ItemList({ items, onToggle, onDelete }) {
  if (items.length === 0) {
    return <p>Nothing on the list. Add something above!</p>;
  }

  return (
    <ul>
      {items.map((item) => (
        <ItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}
