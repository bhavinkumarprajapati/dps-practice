"""Database setup: one engine, a session factory, and a Base class for models.

You will see almost exactly this file in many FastAPI projects.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# SQLite stores the whole database in ONE file, created next to where you start uvicorn.
DATABASE_URL = "sqlite:///./shopping.db"

# check_same_thread=False is needed for SQLite because FastAPI may use different threads per request.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# SessionLocal() gives you a "session": your conversation with the DB for one request.
SessionLocal = sessionmaker(bind=engine, autoflush=False)


class Base(DeclarativeBase):
    """All ORM models inherit from this. Base.metadata knows every table."""


def get_db():
    """FastAPI DEPENDENCY: opens a session for a request and always closes it afterwards.

    Used in routes as:  db: Session = Depends(get_db)
    `yield` hands the session to the route; the code after yield runs when the request is done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
