"""
Click Counter API

Run:  uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Click Counter API")


class Counter(BaseModel):
    value: int


# The counter lives in memory, so it resets to 0 when the server restarts.
counter = {"value": 0}


@app.get("/api/counter", response_model=Counter)
def get_counter():
    return counter


@app.post("/api/counter/increment", response_model=Counter)
def increment():
    counter["value"] += 1
    return counter
