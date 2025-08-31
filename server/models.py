from typing import Optional, List
from datetime import date
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON


class Memory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    artist: str
    venue: str = ""
    city: str
    country: str = ""
    date: date
    lat: float
    lng: float
    note: str = ""
    # enrichment & assets
    tracks: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    palette: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    assets: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    # optional stored image
    image_path: Optional[str] = None

class MemoryCreate(SQLModel):
    artist: str
    venue: str
    city: str
    country: str
    date: date
    lat: float
    lng: float
    note: str = ""


class MemoryRead(SQLModel):
    id: int
    artist: str
    venue: str
    city: str
    country: str
    date: date
    lat: float
    lng: float
    note: str
    tracks: List[str]
    palette: List[str]
    assets: List[str]