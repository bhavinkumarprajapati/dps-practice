"""
Todo List API (Flask, in-memory)

Run:  flask --app app run --debug --port 8000
"""

from flask import Flask, abort, jsonify, request

app = Flask(__name__)

todos = [
    {"id": 1, "title": "Set up Python and Node", "done": True},
    {"id": 2, "title": "Finish the basics course", "done": False},
    {"id": 3, "title": "Practise project 02", "done": False},
]
next_id = 4


# ---------- JSON error responses (instead of Flask's default HTML pages) ----------
@app.errorhandler(400)
def bad_request(error):
    return jsonify({"detail": error.description}), 400


@app.errorhandler(404)
def not_found(error):
    return jsonify({"detail": error.description}), 404


def find_todo(todo_id):
    for todo in todos:
        if todo["id"] == todo_id:
            return todo
    abort(404, description=f"Todo {todo_id} not found")


# ---------- routes ----------
@app.get("/api/todos")
def list_todos():
    return jsonify(todos)


@app.post("/api/todos")
def create_todo():
    global next_id
    data = request.get_json(silent=True) or {}
    title = data.get("title")
    if not isinstance(title, str) or not title.strip():
        abort(400, description="title is required")
    if len(title.strip()) > 100:
        abort(400, description="title must be at most 100 characters")

    todo = {"id": next_id, "title": title.strip(), "done": False}
    next_id += 1
    todos.append(todo)
    return todo, 201
