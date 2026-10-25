"""
Recipe Box API (Flask, in-memory)

Run:  flask --app app run --debug --port 8000
Try:  http://localhost:8000/api/recipes
"""

from flask import Flask, abort, jsonify, request

app = Flask(__name__)

recipes = [
    {
        "id": 1,
        "title": "Pancakes",
        "ingredients": ["flour", "milk", "eggs", "sugar"],
        "servings": 4,
        "vegetarian": True,
    },
    {
        "id": 2,
        "title": "Chicken Curry",
        "ingredients": ["chicken", "onion", "tomato", "curry paste", "rice"],
        "servings": 3,
        "vegetarian": False,
    },
    {
        "id": 3,
        "title": "Dal Tadka",
        "ingredients": ["lentils", "onion", "garlic", "cumin", "ghee"],
        "servings": 4,
        "vegetarian": True,
    },
    {
        "id": 4,
        "title": "Obatzda",
        "ingredients": ["camembert", "butter", "onion", "paprika"],
        "servings": 2,
        "vegetarian": True,
    },
]
next_id = 5


# ---------- JSON error responses ----------
@app.errorhandler(400)
def bad_request(error):
    return jsonify({"detail": error.description}), 400


@app.errorhandler(404)
def not_found(error):
    return jsonify({"detail": error.description}), 404


def find_recipe(recipe_id):
    for recipe in recipes:
        if recipe["id"] == recipe_id:
            return recipe
    abort(404, description=f"Recipe {recipe_id} not found")


def validate_recipe(data):
    """Return an error message (str) if the data is invalid, otherwise None."""
    title = data.get("title")
    if not isinstance(title, str) or not title.strip():
        return "title is required"

    ingredients = data.get("ingredients")
    if (
        not isinstance(ingredients, list)
        or len(ingredients) == 0
        or not all(isinstance(i, str) and i.strip() for i in ingredients)
    ):
        return "ingredients must be a non-empty list of strings"

    servings = data.get("servings")
    # bool is a subclass of int in Python, so exclude it explicitly
    if not isinstance(servings, int) or isinstance(servings, bool) or not 1 <= servings <= 20:
        return "servings must be a whole number between 1 and 20"

    if not isinstance(data.get("vegetarian", False), bool):
        return "vegetarian must be true or false"

    return None


# ---------- routes ----------
@app.get("/api/recipes")
def list_recipes():
    return jsonify(recipes)


@app.get("/api/recipes/<int:recipe_id>")
def get_recipe(recipe_id):
    return find_recipe(recipe_id)


@app.post("/api/recipes")
def create_recipe():
    global next_id
    data = request.get_json(silent=True) or {}
    error = validate_recipe(data)
    if error:
        abort(400, description=error)

    recipe = {
        "id": next_id,
        "title": data["title"].strip(),
        "ingredients": [i.strip() for i in data["ingredients"]],
        "servings": data["servings"],
        "vegetarian": data.get("vegetarian", False),
    }
    next_id += 1
    recipes.append(recipe)
    return recipe, 201


@app.delete("/api/recipes/<int:recipe_id>")
def delete_recipe(recipe_id):
    recipes.remove(find_recipe(recipe_id))
    return "", 204
