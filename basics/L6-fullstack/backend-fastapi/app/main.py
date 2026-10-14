"""
L6: Shopping list API (FastAPI + SQLAlchemy + SQLite)

Run (from the backend-fastapi folder):   uvicorn app.main:app --reload --port 8000
Docs:                                     http://localhost:8000/docs
"""

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine, get_db
from .models import Item
from .schemas import ItemCreate, ItemOut, ItemUpdate


def seed_database():
    """Create the tables (if missing) and add some example rows when the table is empty."""
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if db.scalar(select(Item).limit(1)) is None:
            db.add_all([Item(name="Milk"), Item(name="Brezeln"), Item(name="Apples", bought=True)])
            db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_database()  # runs once when the server starts
    yield  # the server runs while we're "inside" the yield


app = FastAPI(title="Shopping list API", lifespan=lifespan)


def get_item_or_404(db: Session, item_id: int) -> Item:
    item = db.get(Item, item_id)  # look up by primary key, returns None if missing
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item {item_id} not found")
    return item


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/items", response_model=list[ItemOut])
def list_items(db: Session = Depends(get_db)):
    # Depends(get_db): FastAPI calls get_db() for us and passes the session in. That's dependency injection.
    return db.scalars(select(Item).order_by(Item.id)).all()


@app.post("/api/items", response_model=ItemOut, status_code=status.HTTP_201_CREATED)
def create_item(item_in: ItemCreate, db: Session = Depends(get_db)):
    item = Item(name=item_in.name.strip())
    db.add(item)  # 1. stage the new row
    db.commit()  # 2. write it to the database
    db.refresh(item)  # 3. reload it so item.id (created by the DB) is filled in
    return item


@app.patch("/api/items/{item_id}", response_model=ItemOut)
def update_item(item_id: int, update: ItemUpdate, db: Session = Depends(get_db)):
    item = get_item_or_404(db, item_id)
    # exclude_unset=True → only the fields the client actually sent
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/api/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = get_item_or_404(db, item_id)
    db.delete(item)
    db.commit()
