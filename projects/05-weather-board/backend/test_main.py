from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_list_cities():
    cities = client.get("/api/cities").json()
    assert "Munich" in cities
    assert cities == sorted(cities)


def test_get_weather():
    response = client.get("/api/weather/Munich")
    assert response.status_code == 200
    body = response.json()
    assert body["city"] == "Munich"
    assert set(body) == {"city", "temperature_c", "condition", "wind_kph"}


def test_unknown_city_returns_404():
    response = client.get("/api/weather/Atlantis")
    assert response.status_code == 404
    assert response.json()["detail"] == "City 'Atlantis' not found"
