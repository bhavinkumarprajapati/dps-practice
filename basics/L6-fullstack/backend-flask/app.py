"""
L6: Shopping list API (Flask + sqlite3). SAME API as backend-fastapi.

Run (from the backend-flask folder):   flask --app app run --debug --port 8000
Flask finds the create_app() "application factory" below automatically.
"""

import os

from flask import Flask, abort, jsonify, request

import db


def row_to_dict(row):
    """Turn a sqlite3.Row into the JSON shape the frontend expects."""
    return {"id": row["id"], "name": row["name"], "bought": bool(row["bought"])}


def create_app(test_config=None):
    """Application factory: builds and returns a configured app.
    Tests call create_app({...}) with their own config (e.g. a temporary database)."""
    app = Flask(__name__)
    app.config["DATABASE"] = os.path.join(app.root_path, "shopping.db")
    if test_config:
        app.config.update(test_config)

    db.init_app(app)

    # ---------- error handlers: always answer with JSON {"detail": ...} ----------
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"detail": error.description}), 404

    # ---------- helpers ----------
    def get_item_or_404(item_id):
        row = db.get_db().execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        if row is None:
            abort(404, description=f"Item {item_id} not found")
        return row

    def validate_name(name):
        """Return an error message, or None if the name is valid."""
        if not isinstance(name, str) or not (1 <= len(name.strip()) <= 100):
            return "name must be a string with 1-100 characters"
        return None

    # ---------- routes ----------
    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    @app.get("/api/items")
    def list_items():
        rows = db.get_db().execute("SELECT * FROM items ORDER BY id").fetchall()
        return jsonify([row_to_dict(row) for row in rows])

    @app.post("/api/items")
    def create_item():
        data = request.get_json(silent=True) or {}
        error = validate_name(data.get("name"))
        if error:
            return {"detail": [error]}, 422

        conn = db.get_db()
        # ALWAYS use ? placeholders, never f-strings in SQL. Placeholders prevent SQL injection!
        cursor = conn.execute("INSERT INTO items (name) VALUES (?)", (data["name"].strip(),))
        conn.commit()
        return row_to_dict(get_item_or_404(cursor.lastrowid)), 201

    @app.patch("/api/items/<int:item_id>")
    def update_item(item_id):
        get_item_or_404(item_id)
        data = request.get_json(silent=True) or {}
        conn = db.get_db()

        if "name" in data:
            error = validate_name(data["name"])
            if error:
                return {"detail": [error]}, 422
            conn.execute("UPDATE items SET name = ? WHERE id = ?", (data["name"].strip(), item_id))
        if "bought" in data:
            if not isinstance(data["bought"], bool):
                return {"detail": ["bought must be true or false"]}, 422
            conn.execute("UPDATE items SET bought = ? WHERE id = ?", (int(data["bought"]), item_id))

        conn.commit()
        return row_to_dict(get_item_or_404(item_id))

    @app.delete("/api/items/<int:item_id>")
    def delete_item(item_id):
        get_item_or_404(item_id)
        conn = db.get_db()
        conn.execute("DELETE FROM items WHERE id = ?", (item_id,))
        conn.commit()
        return "", 204

    return app
