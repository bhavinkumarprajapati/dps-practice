# L6: Full-stack app: Shopping list (≈ 3 h)

Everything comes together here: **React frontend + Python backend + SQLite database**.
There are **two interchangeable backends** with the exact same API. Run either one and the frontend works with both.

```
L6-fullstack/
├── frontend/                 React (JavaScript) + Vite
│   └── src/
│       ├── main.jsx          entry point
│       ├── App.jsx           owns the state, calls the API          ("smart" component)
│       ├── api.js            ALL fetch calls live here
│       └── components/
│           ├── ItemForm.jsx  input + Add button                    ("presentational")
│           ├── ItemList.jsx  renders the list
│           └── ItemRow.jsx   one row: checkbox, name, delete
│
├── backend-fastapi/          FastAPI + SQLAlchemy ORM
│   ├── app/
│   │   ├── main.py           routes
│   │   ├── database.py       engine, session, get_db dependency
│   │   ├── models.py         SQLAlchemy model = database table
│   │   └── schemas.py        Pydantic schemas = API JSON shape
│   └── tests/test_items.py
│
└── backend-flask/            Flask + sqlite3 (plain SQL)
    ├── app.py                create_app() + routes
    ├── db.py                 connection per request
    ├── schema.sql            CREATE TABLE
    └── tests/test_items.py
```

## The API (identical in both backends)

| Method | URL | Body | Response |
|---|---|---|---|
| GET | `/api/items` | – | `200` `[{"id":1,"name":"Milk","bought":false}, ...]` |
| POST | `/api/items` | `{"name":"Coffee"}` | `201` the new item · `422` invalid name |
| PATCH | `/api/items/{id}` | `{"bought":true}` and/or `{"name":"..."}` | `200` the updated item · `404` · `422` |
| DELETE | `/api/items/{id}` | – | `204` · `404` |

## Run it (two terminals)

**Terminal 1, backend. Choose ONE:**
```powershell
# Option A: FastAPI
cd basics\L6-fullstack\backend-fastapi
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Option B: Flask
cd basics\L6-fullstack\backend-flask
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
flask --app app run --debug --port 8000
```

**Terminal 2, frontend:**
```powershell
cd basics\L6-fullstack\frontend
npm install
npm run dev
```
Open http://localhost:5173. Tests: `pytest -v` inside either backend folder.

The database is a file `shopping.db` that's created on first start, with 3 example items.
**To reset it, stop the backend and delete `shopping.db`.**

---

## Part A: Follow one click through the whole stack (30 min, the most important skill!)

Do this with the code open. **Say each step out loud** as if explaining it to an interviewer.
The user types "Coffee" and clicks **Add**:

| # | Where | What happens |
|---|---|---|
| 1 | `ItemForm.jsx` | `onChange` has been storing every keystroke in `name` state. Submitting the form calls `handleSubmit` → `event.preventDefault()` → `onAdd(name)` |
| 2 | `App.jsx` | `onAdd` is really `handleAdd` (passed as a prop). It calls `api.createItem("Coffee")` |
| 3 | `api.js` | `request("/items", { method: "POST", body: '{"name":"Coffee"}' })` → `fetch("/api/items", ...)` |
| 4 | `vite.config.js` | the URL starts with `/api`, so the dev server **proxies** it to `http://localhost:8000/api/items` |
| 5a | FastAPI `main.py` | `@app.post("/api/items")` matches. FastAPI validates the body against `ItemCreate` (422 if the name is empty) and `Depends(get_db)` provides a DB session |
| 5b | Flask `app.py` | `@app.post("/api/items")` matches. `request.get_json()` → `validate_name()` → `INSERT INTO items ...` |
| 6 | Database | a new row is written. The DB assigns `id = 4` |
| 7 | Backend | returns **201** + `{"id":4,"name":"Coffee","bought":false}` |
| 8 | `api.js` | `response.ok` is true → `response.json()` → returns the item |
| 9 | `App.jsx` | `setItems(prev => [...prev, created])` → React re-renders |
| 10 | `ItemList.jsx` → `ItemRow.jsx` | the new row appears |

✅ **Check it yourself:** open DevTools (F12) → Network → Fetch/XHR, add an item, click the request and find
the method, status, Payload and Response. Then watch the backend terminal: you'll see `POST /api/items 201`.

Now trace **"tick the checkbox"** and **"click 🗑"** the same way, on paper, without looking at this table.

---

## Part B: Exercises (interview-style!)

Work on a branch (`git checkout -b practice/L6`). Use the FastAPI backend first.

### Exercise 1: Add `quantity` end-to-end (45 min) 🟡 ← THE classic interview task
> *"Users want to say how many of each item they need, e.g. 3 × Apples."*

Requirements:
- An item has a `quantity`: a whole number, at least 1, default 1.
- The form gets a number input next to the name.
- The list shows `3 × Apples` (no `1 ×` prefix when the quantity is 1).
- POST with `quantity: 0` → 422 and the error is shown in the UI.

**Checklist: the order to work in (memorise this, it fits almost every "add a field" task):**
1. **Database model**: `models.py` → add the column
2. **Reset the DB**: stop the server and delete `shopping.db` (this project has no migrations; `create_all` only creates *missing tables*, it doesn't add columns)
3. **Schemas**: `ItemCreate`, `ItemUpdate`, `ItemOut` in `schemas.py`
4. **Route**: does `create_item` need a change? (yes: it only copies `name` right now)
5. **Test the backend in `/docs`** before touching React!
6. **api.js**: send the new field
7. **Form**: new state + input, pass the value up via `onAdd`
8. **Display**: `ItemRow.jsx`
9. **Test**: run `pytest`. One existing test now fails because the response has a new key. That's expected, so update it.
   Then add a test for quantity 0 → 422
10. **Click through the UI** once more, including the error case

<details><summary>💡 Hints</summary>

- Model: `quantity: Mapped[int] = mapped_column(default=1)`
- Schema: `quantity: int = Field(default=1, ge=1)`; in `ItemUpdate`: `quantity: int | None = Field(default=None, ge=1)`
- Route: `Item(name=item_in.name.strip(), quantity=item_in.quantity)`
- `onAdd(name, quantity)`, then `handleAdd(name, quantity)`, then `api.createItem(name, quantity)`
- Number inputs give strings, so use `Number(quantity)`
</details>

<details><summary>✅ Solution (FastAPI + frontend)</summary>

```python
# models.py
    quantity: Mapped[int] = mapped_column(default=1)

# schemas.py
class ItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    quantity: int = Field(default=1, ge=1)

class ItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    bought: bool | None = None
    quantity: int | None = Field(default=None, ge=1)

class ItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    bought: bool
    quantity: int

# main.py, create_item
    item = Item(name=item_in.name.strip(), quantity=item_in.quantity)

# tests/test_items.py
def test_quantity_must_be_positive(client):
    assert client.post("/api/items", json={"name": "Milk", "quantity": 0}).status_code == 422
```
```jsx
// api.js
export function createItem(name, quantity) {
  return request("/items", { method: "POST", body: JSON.stringify({ name, quantity }) });
}

// App.jsx
async function handleAdd(name, quantity) {
  try {
    const created = await api.createItem(name, quantity);
    ...

// ItemForm.jsx
const [quantity, setQuantity] = useState(1);
...
const ok = await onAdd(name, Number(quantity));
if (ok) { setName(""); setQuantity(1); }
...
<input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ width: 70 }} />

// ItemRow.jsx
<span className={`name ${item.bought ? "bought" : ""}`}>
  {item.quantity > 1 && `${item.quantity} × `}{item.name}
</span>
```
</details>

### Exercise 2: The same in the Flask backend (30 min) 🟡
Switch to `backend-flask` and add `quantity` there. Your frontend from Exercise 1 must work **unchanged**.
Touch: `schema.sql`, `row_to_dict`, validation, the `INSERT`, and PATCH support. Delete `shopping.db` first!

<details><summary>✅ Solution (Flask)</summary>

```sql
-- schema.sql
    quantity INTEGER NOT NULL DEFAULT 1
```
```python
def row_to_dict(row):
    return {"id": row["id"], "name": row["name"], "bought": bool(row["bought"]), "quantity": row["quantity"]}

def validate_quantity(quantity):
    if not isinstance(quantity, int) or isinstance(quantity, bool) or quantity < 1:
        return "quantity must be a whole number >= 1"
    return None

# create_item
    quantity = data.get("quantity", 1)
    error = validate_name(data.get("name")) or validate_quantity(quantity)
    if error:
        return {"detail": [error]}, 422
    cursor = conn.execute("INSERT INTO items (name, quantity) VALUES (?, ?)", (data["name"].strip(), quantity))

# update_item
    if "quantity" in data:
        error = validate_quantity(data["quantity"])
        if error:
            return {"detail": [error]}, 422
        conn.execute("UPDATE items SET quantity = ? WHERE id = ?", (data["quantity"], item_id))
```
</details>

### Exercise 3: "Clear bought items" button (30 min) 🟡
- Backend: `DELETE /api/items/bought` deletes every bought item and returns `200 {"deleted": 2}`.
- Frontend: a "Clear bought" button under the list, **disabled** when nothing is bought.

> ⚠️ FastAPI gotcha: `/api/items/bought` must be defined **before** `/api/items/{item_id}`.
> Otherwise FastAPI tries `item_id = "bought"` → 422. Try it the wrong way first and read the error!

### Exercise 4: No duplicates (20 min) 🟠
Adding an item whose name already exists (case-insensitive) → **409 Conflict** with
`detail: "Milk is already on the list"`. The UI shows that message. Write a test.

### Exercise 5: Edit a name inline (40 min) 🟠
Double-click a name → it turns into an input. Enter saves (PATCH `{"name": ...}`), Escape cancels.
Hint: `ItemRow` gets its own `isEditing` state and `draft` state. `onKeyDown={(e) => e.key === "Enter" && ...}`.

### Bonus: bugs to find yourself
- Try adding an item whose name is only spaces (`"   "`). What happens in each backend? Why are they different? Fix it.
- What happens if you click 🗑 twice very quickly? (Look at the network tab.)

---

## Say it out loud

"The frontend keeps the list in state in `App`. Child components get data through props and report user actions
through callbacks. All HTTP calls go through `api.js`. The backend validates input, writes to SQLite and returns
the saved object, and the frontend updates its state from the server's response, so the UI always shows
what's really stored."
