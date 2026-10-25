"""
City Library API: lend books to members.

Run (from the backend folder):  uvicorn app.main:app --reload --port 8000
Docs:                           http://localhost:8000/docs
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from .database import Base, engine
from .routers import books, loans, members
from .seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield


app = FastAPI(title="City Library API", lifespan=lifespan)

app.include_router(books.router)
app.include_router(members.router)
app.include_router(loans.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
