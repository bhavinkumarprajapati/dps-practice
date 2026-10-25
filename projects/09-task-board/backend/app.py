"""
Task Board API (Flask, in-memory). A mini Kanban board.

Run:  flask --app app run --debug --port 8000
Try:  http://localhost:8000/api/tasks
"""

from flask import Flask, abort, jsonify, request

app = Flask(__name__)

STATUSES = ["todo", "doing", "done"]  # the board's columns, in order

tasks = [
    {"id": 1, "title": "Interview users", "status": "done"},
    {"id": 2, "title": "Write user stories", "status": "doing"},
    {"id": 3, "title": "Sketch the UI", "status": "todo"},
    {"id": 4, "title": "Set up CI pipeline", "status": "todo"},
    {"id": 5, "title": "Build login page", "status": "todo"},
]
next_id = 6


@app.errorhandler(400)
def bad_request(error):
    return jsonify({"detail": error.description}), 400


@app.errorhandler(404)
def not_found(error):
    return jsonify({"detail": error.description}), 404


def find_task(task_id):
    for task in tasks:
        if task["id"] == task_id:
            return task
    abort(404, description=f"Task {task_id} not found")


@app.get("/api/tasks")
def list_tasks():
    return jsonify(tasks)


@app.post("/api/tasks")
def create_task():
    global next_id
    data = request.get_json(silent=True) or {}
    title = data.get("title")
    if not isinstance(title, str) or not title.strip():
        abort(400, description="title is required")
    task = {"id": next_id, "title": title.strip(), "status": "todo"}  # new tasks always start in "todo"
    next_id += 1
    tasks.append(task)
    return task, 201
