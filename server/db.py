import os
from contextlib import contextmanager
from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///musemap.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

def init_db() -> None:
    """Create database tables (call once at startup)."""
    SQLModel.metadata.create_all(engine)

@contextmanager
def get_session():
    """Provide a transactional scope around a series of operations."""
    with Session(engine) as session:
        yield session