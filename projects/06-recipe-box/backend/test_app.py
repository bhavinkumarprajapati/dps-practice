import copy

import pytest

import app as recipe_app

client = recipe_app.app.test_client()

VALID = {"title": "Toast", "ingredients": ["bread", "butter"], "servings": 1, "vegetarian": True}


@pytest.fixture(autouse=True)
def reset_data():
    saved, saved_next_id = copy.deepcopy(recipe_app.recipes), recipe_app.next_id
    yield
    recipe_app.recipes[:] = saved
    recipe_app.next_id = saved_next_id


def test_list_recipes():
    response = client.get("/api/recipes")
    assert response.status_code == 200
    assert len(response.get_json()) == 4


def test_create_recipe():
    response = client.post("/api/recipes", json=VALID)
    assert response.status_code == 201
    assert response.get_json()["id"] == 5


def test_create_recipe_without_ingredients_returns_400():
    response = client.post("/api/recipes", json={**VALID, "ingredients": []})
    assert response.status_code == 400
    assert response.get_json()["detail"] == "ingredients must be a non-empty list of strings"


def test_delete_recipe():
    assert client.delete("/api/recipes/1").status_code == 204
    assert client.get("/api/recipes/1").status_code == 404
