# Cheat sheet: React + FastAPI + Flask

Looking up syntax is allowed in the interview. Keep this open in a browser tab.

- [FastAPI](#fastapi)
- [Flask](#flask)
- [SQLAlchemy 2.0](#sqlalchemy-20-with-fastapi)
- [sqlite3 (plain SQL)](#sqlite3-plain-sql-common-with-flask)
- [pytest](#pytest)
- [React](#react)
- [fetch](#fetch)
- [TypeScript in React](#typescript-in-react)
- [JavaScript array methods](#javascript-array--object-methods-you-use-constantly)
- [Git](#git)

---

## FastAPI

```python
from fastapi import FastAPI, HTTPException, status, Depends, Query
from pydantic import BaseModel, Field, ConfigDict

app = FastAPI()

class ItemIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    price: float = Field(gt=0)
    tags: list[str] = []
    note: str | None = None          # optional

class ItemOut(ItemIn):
    model_config = ConfigDict(from_attributes=True)   # read from ORM objects
    id: int

@app.get("/api/items", response_model=list[ItemOut])
def list_items(q: str | None = None, limit: int = Query(10, ge=1, le=100)):   # query params
    ...

@app.get("/api/items/{item_id}", response_model=ItemOut)        # path param
def get_item(item_id: int):
    raise HTTPException(status_code=404, detail="Item not found")

@app.post("/api/items", response_model=ItemOut, status_code=status.HTTP_201_CREATED)
def create_item(item: ItemIn):                                  # JSON body
    data = item.model_dump()                                    # → dict
    ...

@app.patch("/api/items/{item_id}")
def patch_item(item_id: int, changes: ItemUpdate):
    for key, value in changes.model_dump(exclude_unset=True).items():
        ...

@app.delete("/api/items/{item_id}", status_code=204)
def delete_item(item_id: int): ...
```

| Need | Code |
|---|---|
| Run | `uvicorn main:app --reload --port 8000` / `uvicorn app.main:app --reload` |
| Docs | http://localhost:8000/docs |
| Enum field | `class Status(str, Enum): todo = "todo"; done = "done"` then `status: Status = Status.todo` |
| Dependency | `def get_db(): ...yield db...` then `db: Session = Depends(get_db)` |
| Custom validation | `@field_validator("name")` + `@classmethod def check(cls, v): ...; return v` |
| Header | `from fastapi import Header`; `authorization: str \| None = Header(default=None)` |
| CORS | `app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"])` |
| Router (split files) | `router = APIRouter(prefix="/api/items")` → `app.include_router(router)` |
| Dates | `from datetime import date, datetime`; Pydantic converts ISO strings automatically |

⚠️ Route order: define `/api/items/stats` **before** `/api/items/{item_id}`.

## Flask

```python
from flask import Flask, request, jsonify, abort

app = Flask(__name__)

@app.get("/api/items")
def list_items():
    q = request.args.get("q")                        # query param → str or None
    limit = request.args.get("limit", 10, type=int)  # with default + conversion
    return jsonify(items)                            # list → jsonify; dict can be returned directly

@app.get("/api/items/<int:item_id>")
def get_item(item_id):
    abort(404, description="Item not found")

@app.post("/api/items")
def create_item():
    data = request.get_json(silent=True) or {}       # body → dict
    if not data.get("name"):
        return {"detail": "name is required"}, 400   # (body, status)
    return new_item, 201

@app.delete("/api/items/<int:item_id>")
def delete_item(item_id):
    return "", 204

@app.errorhandler(404)
def not_found(e):
    return jsonify({"detail": e.description}), 404
```

| Need | Code |
|---|---|
| Run | `flask --app app run --debug --port 8000` |
| Older route style | `@app.route("/api/items", methods=["GET", "POST"])` then `if request.method == "POST": ...` |
| Blueprint (split files) | `bp = Blueprint("items", __name__, url_prefix="/api/items")` → `app.register_blueprint(bp)` |
| Header | `request.headers.get("Authorization")` |
| CORS | `from flask_cors import CORS; CORS(app)` |
| Per-request storage | `from flask import g` |
| Flask-SQLAlchemy | `db = SQLAlchemy(app)`; `Item.query.all()`, `db.session.get(Item, id)`, `db.session.add(x); db.session.commit()` |

## SQLAlchemy 2.0 (with FastAPI)

```python
from sqlalchemy import String, ForeignKey, select, func
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session

class Author(Base):
    __tablename__ = "authors"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    books: Mapped[list["Book"]] = relationship(back_populates="author", cascade="all, delete-orphan")

class Book(Base):
    __tablename__ = "books"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    note: Mapped[str | None]                                   # nullable column
    author_id: Mapped[int] = mapped_column(ForeignKey("authors.id"))
    author: Mapped["Author"] = relationship(back_populates="books")
```

| Need | Code |
|---|---|
| All rows | `db.scalars(select(Book)).all()` |
| By id | `db.get(Book, book_id)` → object or `None` |
| Filter | `select(Book).where(Book.title.ilike(f"%{q}%"))` |
| Sort / paginate | `.order_by(Book.title.desc()).offset(20).limit(10)` |
| Count | `db.scalar(select(func.count()).select_from(Book))` |
| Group by | `db.execute(select(Book.author_id, func.count()).group_by(Book.author_id)).all()` |
| Create | `db.add(obj); db.commit(); db.refresh(obj)` |
| Update | change attributes, then `db.commit()` |
| Delete | `db.delete(obj); db.commit()` |

## sqlite3 (plain SQL, common with Flask)

```python
conn = sqlite3.connect("app.db"); conn.row_factory = sqlite3.Row
rows = conn.execute("SELECT * FROM items WHERE name LIKE ? ORDER BY id", (f"%{q}%",)).fetchall()
row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()   # or None
cur = conn.execute("INSERT INTO items (name) VALUES (?)", (name,)); conn.commit(); new_id = cur.lastrowid
conn.execute("UPDATE items SET name = ? WHERE id = ?", (name, item_id)); conn.commit()
conn.execute("ALTER TABLE items ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1")
```
⚠️ Always use `?` placeholders, never f-strings in SQL (SQL injection!).

## pytest

```python
# FastAPI
from fastapi.testclient import TestClient
client = TestClient(app)
r = client.get("/api/items", params={"q": "milk"})
r = client.post("/api/items", json={"name": "Milk"})
assert r.status_code == 201 and r.json()["name"] == "Milk"

# Flask
client = app.test_client()
r = client.get("/api/items", query_string={"q": "milk"})
assert r.get_json() == [...]

@pytest.fixture
def client(): ...                      # setup; use as a test parameter: def test_x(client):

@pytest.mark.parametrize("qty,code", [(0, 422), (1, 201)])
def test_qty(client, qty, code): ...
```
Run: `pytest -v` · one test: `pytest -k quantity` · stop at first failure: `pytest -x` · show prints: `pytest -s`

## React

```jsx
import { useState, useEffect } from "react";

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {                        // runs after the first render
    fetch("/api/todos")
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(setTodos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);                                  // [] = once. [x] = when x changes

  function handleSubmit(e) {
    e.preventDefault();
    setTodos([...todos, { id: Date.now(), text, done: false }]);   // add
    setText("");
  }

  const toggle = (id) => setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));  // update
  const remove = (id) => setTodos(todos.filter((t) => t.id !== id));                              // delete

  if (loading) return <p>Loading…</p>;
  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit" disabled={!text.trim()}>Add</button>
      {error && <p className="error">{error}</p>}
      {todos.length === 0 ? <p>Empty</p> : (
        <ul>{todos.map((t) => <li key={t.id} onClick={() => toggle(t.id)}>{t.text}</li>)}</ul>
      )}
    </form>
  );
}
```

| Need | Code |
|---|---|
| Checkbox | `checked={x} onChange={(e) => setX(e.target.checked)}` |
| Select | `<select value={v} onChange={(e) => setV(e.target.value)}><option value="a">A</option></select>` |
| Number input | `Number(e.target.value)`; the value is always a string |
| Conditional class | ``className={`row ${done ? "done" : ""}`}`` |
| Pass a callback | `<Row item={item} onDelete={handleDelete} />` → in Row: `onClick={() => onDelete(item.id)}` |
| Update from the old value | `setCount((c) => c + 1)` |
| Interval + cleanup | `useEffect(() => { const id = setInterval(load, 5000); return () => clearInterval(id); }, [])` |
| Debounce search | `useEffect(() => { const t = setTimeout(() => search(q), 300); return () => clearTimeout(t); }, [q])` |
| Context | `const Ctx = createContext(null)`; `<Ctx.Provider value={...}>`; `useContext(Ctx)` |
| React Router | `<Route path="/jobs/:id" element={<Job />} />`; `useParams()`, `useNavigate()`, `<Link to="/">` |
| Query string | `const [params, setParams] = useSearchParams(); params.get("q")` |
| Date display | `new Date(iso).toLocaleDateString("de-DE")` |

## fetch

```js
const res = await fetch("/api/items", {
  method: "POST",                                    // GET is the default
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Milk" }),
});
if (!res.ok) {                                       // ⚠️ fetch does NOT throw on 4xx/5xx
  const err = await res.json().catch(() => ({}));
  throw new Error(err.detail ?? `HTTP ${res.status}`);
}
const data = res.status === 204 ? null : await res.json();

// query string
const url = `/api/items?${new URLSearchParams({ q: "milk", page: 2 })}`;
// auth header
headers: { Authorization: `Bearer ${token}` }
```

## TypeScript in React

```tsx
interface Item { id: number; name: string; done: boolean; note?: string }
type Status = "todo" | "doing" | "done";
type ItemRowProps = { item: Item; onDelete: (id: number) => void; children?: React.ReactNode };

function ItemRow({ item, onDelete }: ItemRowProps) { ... }
const [items, setItems] = useState<Item[]>([]);
const [selected, setSelected] = useState<Item | null>(null);
function handleChange(e: React.ChangeEvent<HTMLInputElement>) { ... }
function handleSubmit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); }
async function getItems(): Promise<Item[]> { const r = await fetch("/api/items"); return r.json(); }
type NewItem = Omit<Item, "id">;   type ItemPatch = Partial<Item>;
```
Check: `npx tsc --noEmit`. Tip: hover over anything in VS Code to see its type.

## JavaScript array & object methods you use constantly

```js
items.map((i) => i.name)                         // transform
items.filter((i) => !i.done)                     // keep some
items.find((i) => i.id === 3)                    // first match or undefined
items.some((i) => i.done) / items.every(...)     // boolean
items.reduce((sum, i) => sum + i.price, 0)       // total
[...items].sort((a, b) => a.price - b.price)     // numbers (copy first!)
[...items].sort((a, b) => a.name.localeCompare(b.name))   // strings
items.slice(0, 10)                               // first 10 (no mutation)
const { name, price } = item                     // destructuring
const copy = { ...item, price: 5 }               // copy + override
item?.author?.name ?? "Unknown"                  // optional chaining + default
Object.entries(obj).map(([key, value]) => ...)   // loop over an object
```

## Git

```bash
git clone <url> && cd <repo>
git checkout -b feature/quantity
git status / git diff
git add -A && git commit -m "Add quantity to items"
git log --oneline -5
git stash / git stash pop                        # put changes aside temporarily
git checkout -- <file>                           # discard changes in a file
```
