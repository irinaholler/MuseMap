from typing import List, Optional
from pydantic import BaseModel


class MemoryCreate(BaseModel):
artist: str
venue: Optional[str] = None
date: Optional[str] = None # ISO date string
city: str
lat: float
lng: float
note: Optional[str] = ""


class MemoryRead(BaseModel):
id: int
artist: str
venue: Optional[str]
date: Optional[str]
city: str
lat: float
lng: float
note: Optional[str]
tracks: List[str]
palette: List[str]
asset_path: Optional[str]