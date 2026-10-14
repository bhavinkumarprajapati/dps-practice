"""
L2: FastAPI basics. A tiny "Books" API.

Run:   uvicorn main:app --reload --port 8000
Docs:  http://localhost:8000/docs   <- interactive Swagger UI, try every endpoint there!

Read the file in STEP order. Each step adds one new idea.
"""

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field

# STEP 1: Create the app object. `uvicorn main:app` means "in main.py, run the object called app".
app = FastAPI(title="Books API (FastAPI basics)")


# STEP 2: Pydantic models describe the SHAPE of the JSON going in and out.
#   FastAPI uses them to (a) validate incoming JSON, (b) convert it to Python objects,
#   (c) build the docs at /docs. Invalid input gives an automatic 422 response.
class BookIn(BaseModel):
    """What the client SENDS to create/replace a book. No id: the server decides it."""

    title: str = Field(min_length=1, max_length=200)
    author: str = Field(min_length=1)
    year: int = Field(ge=0, le=2100)  # ge = greater or equal, le = less or equal
    read: bool = False  # a default value makes the field optional in the request


class Book(BookIn):
    """What the server RETURNS. Same fields as BookIn plus the id (inheritance)."""

    id: int


class ReadUpdate(BaseModel):
    """Body for PATCH: only the field we want to change."""

    read: bool


# STEP 3: A fake "database": just a Python list in memory.
#   It resets every time the server restarts. Real apps use a DB (see L6).
books: list[Book] = [
    Book(id=1, title="The Hobbit", author="J.R.R. Tolkien", year=1937, read=True),
    Book(id=2, title="Clean Code", author="Robert C. Martin", year=2008, read=False),
    Book(id=3, title="The Silmarillion", author="J.R.R. Tolkien", year=1977, read=False),
]
next_id = 4


def find_book(book_id: int) -> Book:
    """Small helper used by several routes. Raises 404 if the book doesn't exist."""
    for book in books:
        if book.id == book_id:
            return book
    # HTTPException stops the request and sends this status + JSON {"detail": "..."}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Book {book_id} not found")


# STEP 4: The simplest possible route. GET /api/health returns JSON.
#   Returning a dict/list makes FastAPI convert it to JSON for you.
@app.get("/api/health")
def health():
    return {"status": "ok"}


# STEP 5: List + optional QUERY parameter.
#   Any function argument that is NOT in the path and is a simple type (str, int, bool)
#   becomes a query parameter: GET /api/books?read=true
#   `bool | None = None` means "optional; None when not given".
#   response_model tells FastAPI (and the docs) what the response looks like.
@app.get("/api/books", response_model=list[Book])
def list_books(read: bool | None = None):
    if read is None:
        return books
    return [book for book in books if book.read == read]


# STEP 6: PATH parameter. {book_id} in the URL becomes the book_id argument.
#   The type hint `int` makes FastAPI convert "2" -> 2 (and send a 422 for "abc").
@app.get("/api/books/{book_id}", response_model=Book)
def get_book(book_id: int):
    return find_book(book_id)


# STEP 7: POST with a request BODY.
#   An argument whose type is a Pydantic model is read from the JSON body.
#   status_code=201 because we CREATED something.
@app.post("/api/books", response_model=Book, status_code=status.HTTP_201_CREATED)
def create_book(book_in: BookIn):
    global next_id  # we modify a module-level variable
    book = Book(id=next_id, **book_in.model_dump())  # model_dump() -> dict
    next_id += 1
    books.append(book)
    return book


# STEP 8: PUT = replace the whole book. Path param + body together.
@app.put("/api/books/{book_id}", response_model=Book)
def replace_book(book_id: int, book_in: BookIn):
    book = find_book(book_id)
    updated = Book(id=book.id, **book_in.model_dump())
    books[books.index(book)] = updated
    return updated


# STEP 9: PATCH = change only some fields.
@app.patch("/api/books/{book_id}", response_model=Book)
def update_read(book_id: int, update: ReadUpdate):
    book = find_book(book_id)
    book.read = update.read
    return book


# STEP 10: DELETE returns 204 No Content, so no body. Return None.
@app.delete("/api/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int):
    book = find_book(book_id)
    books.remove(book)
