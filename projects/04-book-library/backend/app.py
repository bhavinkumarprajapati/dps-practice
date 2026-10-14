"""
Book Library API (Flask, read-only, data from data/books.json)

Run:  flask --app app run --debug --port 8000
Try:  http://localhost:8000/api/books
"""

import json
from pathlib import Path

from flask import Flask, abort, jsonify

app = Flask(__name__)

DATA_FILE = Path(__file__).parent / "data" / "books.json"
books = json.loads(DATA_FILE.read_text(encoding="utf-8"))  # list of dicts, loaded once at startup


@app.errorhandler(400)
def bad_request(error):
    return jsonify({"detail": error.description}), 400


@app.errorhandler(404)
def not_found(error):
    return jsonify({"detail": error.description}), 404


@app.get("/api/books")
def list_books():
    return jsonify(books)


@app.get("/api/books/<int:book_id>")
def get_book(book_id):
    for book in books:
        if book["id"] == book_id:
            return book
    abort(404, description=f"Book {book_id} not found")
