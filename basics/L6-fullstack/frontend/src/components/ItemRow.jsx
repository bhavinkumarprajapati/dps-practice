// Props: item ({ id, name, bought }), onToggle(item), onDelete(id)
export default function ItemRow({ item, onToggle, onDelete }) {
  return (
    <li>
      <input type="checkbox" checked={item.bought} onChange={() => onToggle(item)} />
      <span className={`name ${item.bought ? "bought" : ""}`}>{item.name}</span>
      <button onClick={() => onDelete(item.id)} aria-label={`Delete ${item.name}`}>
        🗑
      </button>
    </li>
  );
}
