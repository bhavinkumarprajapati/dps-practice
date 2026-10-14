# L2: FastAPI basics (≈ 2 h)

A small **Books API** with data kept in memory. One file, `main.py`, read in STEP order.

## Run it

```powershell
cd basics\L2-fastapi
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- `main:app` → in the file **main**.py, use the object **app**
- `--reload` → restarts the server automatically when you save a file

Now open:
- http://localhost:8000/api/books → raw JSON
- http://localhost:8000/docs → **Swagger UI**. Click an endpoint → "Try it out" → "Execute".
  This is the fastest way to test a backend change during the interview, without touching the frontend.

Run the tests: `pytest -v`

## Part A: Explore (15 min)

In Swagger, do each of these and **predict the status code before you click Execute**:
1. `GET /api/books?read=false`
2. `GET /api/books/2` and `GET /api/books/99`
3. `POST /api/books` with `{"title": "Dune", "author": "Frank Herbert", "year": 1965}`
4. `POST /api/books` with `{"title": "", "author": "X", "year": 1965}`. Read the 422 `detail`: which field, and why?
5. `PATCH /api/books/2` with `{"read": true}`
6. `DELETE /api/books/1`, then `GET /api/books/1`

## Part B: Exercises (write them yourself, use CHEATSHEET.md / docs only)

Make each change, check it in Swagger, then add a test to `test_main.py`.

### Exercise 1: Count endpoint (10 min) 🟢
`GET /api/books/count` returns `{"total": 3, "read": 1, "unread": 2}`.

> ⚠️ Gotcha: put this route **above** `/api/books/{book_id}` in the file, otherwise FastAPI tries to
> treat `"count"` as a `book_id` and answers 422. Routes are matched top to bottom!

### Exercise 2: Filter by author (15 min) 🟢
`GET /api/books?author=tolkien` returns only books whose author **contains** the text, ignoring upper/lower case.
It must still work together with `?read=`.

### Exercise 3: New field `pages` (20 min) 🟡
Every book gets a `pages` field (whole number, must be > 0). Update the model and the 3 seed books.
`POST` with `"pages": 0` must return 422.

### Exercise 4: Sorting (15 min) 🟡
`GET /api/books?sort=year` sorts by year (oldest first), `?sort=title` sorts alphabetically.
Any other value returns **400** with `detail: "Cannot sort by xyz"`.

### Exercise 5: Business rule (15 min) 🟠
A book with the same title (case-insensitive) can't be added twice → **409 Conflict**.
Write a test for it.

<details><summary>💡 Hints</summary>

- Ex 1: `sum(1 for b in books if b.read)`
- Ex 2: add `author: str | None = None` to `list_books`; `author.lower() in book.author.lower()`
- Ex 3: `pages: int = Field(gt=0)`
- Ex 4: `sorted(result, key=lambda b: b.year)`; `raise HTTPException(status_code=400, detail=...)`
- Ex 5: check before `books.append(...)`; `status.HTTP_409_CONFLICT`
</details>

<details><summary>✅ Solution (open only after trying!)</summary>

```python
# Ex 1: place ABOVE get_book
@app.get("/api/books/count")
def count_books():
    read_count = sum(1 for b in books if b.read)
    return {"total": len(books), "read": read_count, "unread": len(books) - read_count}


# Ex 2 + Ex 4: replace list_books
@app.get("/api/books", response_model=list[Book])
def list_books(read: bool | None = None, author: str | None = None, sort: str | None = None):
    result = books
    if read is not None:
        result = [b for b in result if b.read == read]
    if author:
        result = [b for b in result if author.lower() in b.author.lower()]
    if sort is not None:
        if sort not in ("year", "title"):
            raise HTTPException(status_code=400, detail=f"Cannot sort by {sort}")
        result = sorted(result, key=lambda b: getattr(b, sort))
    return result


# Ex 3: in BookIn
    pages: int = Field(gt=0)
# ...and add pages=310 etc. to every seed Book(...)


# Ex 5: at the start of create_book
    if any(b.title.lower() == book_in.title.lower() for b in books):
        raise HTTPException(status_code=409, detail="Book already exists")

# test
def test_duplicate_title_returns_409():
    response = client.post("/api/books", json={"title": "the hobbit", "author": "X", "year": 2000, "pages": 10})
    assert response.status_code == 409
```
</details>

## Say it out loud (interview practice)

"FastAPI reads the path parameter from the URL, simple-typed arguments from the query string, and Pydantic-model
arguments from the JSON body. It validates all of them automatically and returns 422 if they're wrong. For
business errors I raise `HTTPException` with the right status code."
