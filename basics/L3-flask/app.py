"""
L3: Flask basics. The SAME Books API as L2, written in Flask.

Run:   flask --app app run --debug --port 8000
Test:  http://localhost:8000/api/books     (Flask has no built-in /docs page)

Compare every STEP with the same STEP in ../L2-fastapi/main.py.
"""

from flask import Flask, abort, jsonify, request

# STEP 1: Create the app. `flask --app app` means "in app.py, find the object called app".
app = Flask(__name__)


# STEP 2: No Pydantic here. Flask gives you the raw JSON (a dict) and YOU validate it.
#   This function returns a list of error messages (an empty list means valid).
def validate_book(data):
    errors = []
    if not isinstance(data, dict):
        return ["Body must be a JSON object"]
    title = data.get("title")
    if not isinstance(title, str) or not (1 <= len(title) <= 200):
        errors.append("title must be a string with 1-200 characters")
    author = data.get("author")
    if not isinstance(author, str) or not author:
        errors.append("author must be a non-empty string")
    year = data.get("year")
    # note: in Python, bool is a subclass of int, so exclude True/False explicitly
    if not isinstance(year, int) or isinstance(year, bool) or not (0 <= year <= 2100):
        errors.append("year must be a whole number between 0 and 2100")
    if "read" in data and not isinstance(data["read"], bool):
        errors.append("read must be true or false")
    return errors


# STEP 3: Fake "database": a list of plain dicts (no model classes).
books = [
    {"id": 1, "title": "The Hobbit", "author": "J.R.R. Tolkien", "year": 1937, "read": True},
    {"id": 2, "title": "Clean Code", "author": "Robert C. Martin", "year": 2008, "read": False},
    {"id": 3, "title": "The Silmarillion", "author": "J.R.R. Tolkien", "year": 1977, "read": False},
]
next_id = 4


def find_book(book_id):
    for book in books:
        if book["id"] == book_id:
            return book
    # abort() stops the request with this status (like raise HTTPException in FastAPI)
    abort(404, description=f"Book {book_id} not found")


# Error handlers turn errors into JSON. Without them Flask returns an HTML error page,
# which the React frontend can't read. We use the key "detail", like FastAPI does.
@app.errorhandler(404)
def not_found(error):
    return jsonify({"detail": error.description}), 404


@app.errorhandler(400)
def bad_request(error):
    return jsonify({"detail": error.description}), 400


# STEP 4: Simplest route. Returning a dict makes Flask send JSON automatically.
@app.get("/api/health")
def health():
    return {"status": "ok"}


# STEP 5: List + QUERY parameter. Query params come from request.args, ALWAYS as strings!
#   Flask does NOT convert "true" -> True for you, so we do it by hand.
@app.get("/api/books")
def list_books():
    read = request.args.get("read")  # None if not given, else a string like "true"
    if read is None:
        return jsonify(books)  # jsonify is needed for lists
    wanted = read.lower() == "true"
    return jsonify([book for book in books if book["read"] == wanted])


# STEP 6: PATH parameter. <int:book_id> converts to int (and gives 404 for "abc").
@app.get("/api/books/<int:book_id>")
def get_book(book_id):
    return find_book(book_id)


# STEP 7: POST with a JSON body. request.get_json() -> dict.
#   Return a TUPLE (body, status_code) to set the status.
@app.post("/api/books")
def create_book():
    global next_id
    data = request.get_json(silent=True)  # silent=True: return None instead of crashing on bad JSON
    errors = validate_book(data)
    if errors:
        return {"detail": errors}, 422
    book = {
        "id": next_id,
        "title": data["title"],
        "author": data["author"],
        "year": data["year"],
        "read": data.get("read", False),
    }
    next_id += 1
    books.append(book)
    return book, 201


# STEP 8: PUT = replace the whole book.
@app.put("/api/books/<int:book_id>")
def replace_book(book_id):
    book = find_book(book_id)
    data = request.get_json(silent=True)
    errors = validate_book(data)
    if errors:
        return {"detail": errors}, 422
    book.update(
        title=data["title"], author=data["author"], year=data["year"], read=data.get("read", False)
    )
    return book


# STEP 9: PATCH = change only some fields.
@app.patch("/api/books/<int:book_id>")
def update_read(book_id):
    book = find_book(book_id)
    data = request.get_json(silent=True) or {}
    if not isinstance(data.get("read"), bool):
        return {"detail": ["read must be true or false"]}, 422
    book["read"] = data["read"]
    return book


# STEP 10: DELETE → 204 with an empty body.
@app.delete("/api/books/<int:book_id>")
def delete_book(book_id):
    book = find_book(book_id)
    books.remove(book)
    return "", 204
