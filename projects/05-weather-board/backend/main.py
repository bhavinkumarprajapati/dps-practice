"""
Weather Board API (mock data from data/weather.json, no real weather service)

Run:  uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

import json
from pathlib import Path

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

app = FastAPI(title="Weather Board API")

DATA_FILE = Path(__file__).parent / "data" / "weather.json"
# { "Munich": {"temperature_c": 12.4, "condition": "Cloudy", ...}, ... }
WEATHER = json.loads(DATA_FILE.read_text(encoding="utf-8"))


class Weather(BaseModel):
    city: str
    temperature_c: float
    condition: str
    wind_kph: int


@app.get("/api/cities", response_model=list[str])
def list_cities():
    return sorted(WEATHER.keys())


@app.get("/api/weather/{city}", response_model=Weather)
def get_weather(city: str):
    if city not in WEATHER:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"City '{city}' not found")
    # response_model=Weather only returns the fields declared in the model; extra keys in the data are dropped
    return {"city": city, **WEATHER[city]}
