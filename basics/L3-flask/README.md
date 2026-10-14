# L3: Flask basics (≈ 1.5 h)

**The exact same Books API as L2**, written in Flask. Same URLs, same JSON, same status codes.
Open `../L2-fastapi/main.py` and `app.py` side by side (VS Code: right-click the tab → "Split Right").

## Run it

```powershell
cd basics\L3-flask
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
flask --app app run --debug --port 8000
```

- `--app app` → in the file **app**.py, find the Flask app
- `--debug` → auto-reload on save + detailed error pages

Flask has **no Swagger page**, so test it another way:
- GET requests: just open http://localhost:8000/api/books in the browser
- Other methods, in PowerShell:
  ```powershell
  Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/books -ContentType "application/json" -Body '{"title":"Dune","author":"Frank Herbert","year":1965}'
  Invoke-RestMethod -Method Delete -Uri http://localhost:8000/api/books/1
  ```
- Or use the tests: `pytest -v` (the best option)
- Or use the React app from L4. It talks to whichever backend is running on port 8000!

## FastAPI vs Flask: the translation table

| Task | FastAPI | Flask |
|---|---|---|
| Create app | `app = FastAPI()` | `app = Flask(__name__)` |
| Run | `uvicorn main:app --reload --port 8000` | `flask --app app run --debug --port 8000` |
| GET route | `@app.get("/api/books")` | `@app.get("/api/books")` (or `@app.route("/api/books", methods=["GET"])`) |
| Path param | `"/api/books/{book_id}"` + `book_id: int` | `"/api/books/<int:book_id>"` + `book_id` |
| Query param | function arg: `read: bool \| None = None` | `request.args.get("read")` → **always a string** |
| JSON body | function arg typed with a Pydantic model | `data = request.get_json()` → dict |
| Validation | automatic (Pydantic) → 422 | **by hand** (or a library such as marshmallow / pydantic) |
| Return JSON | `return dict_or_list_or_model` | `return dict` / `return jsonify(list)` |
| Set status | `@app.post(..., status_code=201)` | `return data, 201` |
| Error | `raise HTTPException(404, detail="...")` | `abort(404, description="...")` + `@app.errorhandler` |
| Empty 204 | `status_code=204`, return nothing | `return "", 204` |
| Docs | free at `/docs` | none built in |
| Test client | `TestClient(app)`, `r.json()` | `app.test_client()`, `r.get_json()` |
| Async | `async def` supported natively | mostly sync |

## Exercises: do the SAME 5 exercises as L2, but in Flask

1. `GET /api/books/count` → `{"total": 3, "read": 1, "unread": 2}`. (In Flask the order doesn't matter because
   `<int:book_id>` only matches numbers. Do you see why?)
2. `?author=tolkien` filter, case-insensitive "contains"
3. New field `pages` (> 0): add it to `validate_book`, the seed data and `create_book`
4. `?sort=year|title`, otherwise **400**. Use `abort(400, description=...)`
5. Duplicate title → **409**. Add a JSON error handler for 409, or `return {"detail": "..."}, 409`

<details><summary>✅ Solution (open only after trying!)</summary>

```python
@app.get("/api/books/count")
def count_books():
    read_count = sum(1 for b in books if b["read"])
    return {"total": len(books), "read": read_count, "unread": len(books) - read_count}


@app.get("/api/books")
def list_books():
    result = books
    read = request.args.get("read")
    if read is not None:
        result = [b for b in result if b["read"] == (read.lower() == "true")]
    author = request.args.get("author")
    if author:
        result = [b for b in result if author.lower() in b["author"].lower()]
    sort = request.args.get("sort")
    if sort is not None:
        if sort not in ("year", "title"):
            abort(400, description=f"Cannot sort by {sort}")
        result = sorted(result, key=lambda b: b[sort])
    return jsonify(result)


# in validate_book
    pages = data.get("pages")
    if not isinstance(pages, int) or isinstance(pages, bool) or pages <= 0:
        errors.append("pages must be a whole number > 0")
# in create_book: "pages": data["pages"],


# at the start of create_book (after validation)
    if any(b["title"].lower() == data["title"].lower() for b in books):
        return {"detail": "Book already exists"}, 409
```
</details>

## Say it out loud

"Flask is more minimal. I get the raw request and decide everything myself: parsing query strings,
validating the body, choosing status codes, and turning errors into JSON. FastAPI does the parsing and
validation for me from type hints and Pydantic models."
