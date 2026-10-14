"""Database helpers using Python's built-in sqlite3 module (plain SQL, no ORM).

This is the pattern from the official Flask tutorial:
  - get_db()  opens ONE connection per request and stores it in `g` (per-request storage)
  - close_db() closes it automatically when the request ends
"""

import sqlite3

from flask import current_app, g


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(current_app.config["DATABASE"])
        g.db.row_factory = sqlite3.Row  # rows behave like dicts: row["name"]
    return g.db


def close_db(error=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db(seed=True):
    """Create the table, and add example rows if it's empty."""
    db = get_db()
    with current_app.open_resource("schema.sql") as f:
        db.executescript(f.read().decode("utf8"))
    count = db.execute("SELECT COUNT(*) FROM items").fetchone()[0]
    if seed and count == 0:
        db.executemany(
            "INSERT INTO items (name, bought) VALUES (?, ?)",
            [("Milk", 0), ("Brezeln", 0), ("Apples", 1)],
        )
    db.commit()


def init_app(app):
    app.teardown_appcontext(close_db)  # call close_db after every request
    with app.app_context():
        init_db(seed=not app.config.get("TESTING", False))
