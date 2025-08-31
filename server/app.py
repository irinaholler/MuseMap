import os
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from contextlib import contextmanager
from sqlmodel import select, SQLModel, create_engine, Session
from dotenv import load_dotenv

from db import init_db, get_session
from models import Memory
from services.enrich import (
    infer_palette,            # simple palette from text
    fake_setlist,            # placeholder setlist
    fetch_tracks_for_artist, # optional real lookup (if you wire it)
    mood_palette_from_text   # alt palette function
)
from services.poster import draw_poster  # generates PNG poster

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"*": {"origins": os.getenv("CLIENT_ORIGIN", "*")}})
init_db()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///musemap.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# --- filesystem setup ---
BASE_DIR = os.path.dirname(__file__)
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "tickets")
CARD_DIR = os.path.join(BASE_DIR, "static", "cards")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CARD_DIR, exist_ok=True)

def parse_european_date(date_str):
    """Parse European date format (DD-MM-YYYY) to datetime.date object."""
    try:
        # Try European format first (DD-MM-YYYY)
        return datetime.strptime(date_str, "%d-%m-%Y").date()
    except ValueError:
        try:
            # Fallback to ISO format (YYYY-MM-DD) for backward compatibility
            return datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError(f"Invalid date format. Expected DD-MM-YYYY or YYYY-MM-DD, got: {date_str}")

def format_european_date(date_obj):
    """Format datetime.date object to European format (DD-MM-YYYY)."""
    return date_obj.strftime("%d-%m-%Y")

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/memories")
def list_memories():
    with get_session() as s:
        memories = s.exec(select(Memory)).all()
        # Convert dates to European format for frontend
        memories_data = []
        for m in memories:
            memory_dict = m.model_dump()
            memory_dict['date'] = format_european_date(m.date)
            memories_data.append(memory_dict)
        return jsonify(memories_data)

@app.post("/memories")
def create_memory():
    """
    Accepts JSON OR multipart/form-data.
    If multipart, you can include a file under 'file'.
    """
    data = request.form if request.form else request.get_json(force=True, silent=True) or {}

    # optional file upload
    assets = []
    if "file" in request.files:
        f = request.files["file"]
        safe_name = datetime.now().strftime("%Y%m%d-%H%M%S_") + f.filename
        out_path = os.path.join(UPLOAD_DIR, safe_name)
        f.save(out_path)
        assets.append(f"uploads/tickets/{safe_name}")

    try:
        m = Memory(
            artist=data["artist"],
            venue=data.get("venue", ""),
            city=data["city"],
            country=data.get("country", ""),
            lat=float(data["lat"]),
            lng=float(data["lng"]),
            date=parse_european_date(data["date"]),
            note=data.get("note", ""),
            assets=assets,            # ensure your models.Memory has this field
        )
    except KeyError as e:
        return {"error": f"missing field: {e.args[0]}"}, 400
    except ValueError as e:
        return {"error": f"invalid value: {str(e)}"}, 400

    with get_session() as s:
        s.add(m)
        s.commit()
        s.refresh(m)
        
        # Return with European date format
        memory_dict = m.model_dump()
        memory_dict['date'] = format_european_date(m.date)
        return jsonify(memory_dict), 201

@app.put("/memories/<int:mid>")
def update_memory(mid: int):
    """Update an existing memory."""
    data = request.get_json(force=True, silent=True) or {}
    
    with get_session() as s:
        m = s.get(Memory, mid)
        if not m:
            return {"error": "not found"}, 404

        try:
            # Update fields if provided
            if "artist" in data:
                m.artist = data["artist"]
            if "venue" in data:
                m.venue = data["venue"]
            if "city" in data:
                m.city = data["city"]
            if "country" in data:
                m.country = data["country"]
            if "lat" in data:
                m.lat = float(data["lat"])
            if "lng" in data:
                m.lng = float(data["lng"])
            if "date" in data:
                m.date = parse_european_date(data["date"])
            if "note" in data:
                m.note = data["note"]
        except ValueError as e:
            return {"error": f"invalid value: {str(e)}"}, 400

        s.add(m)
        s.commit()
        s.refresh(m)
        
        # Return with European date format
        memory_dict = m.model_dump()
        memory_dict['date'] = format_european_date(m.date)
        return jsonify(memory_dict)

@app.delete("/memories/<int:mid>")
def delete_memory(mid: int):
    """Delete a memory."""
    with get_session() as s:
        m = s.get(Memory, mid)
        if not m:
            return {"error": "not found"}, 404

        s.delete(m)
        s.commit()
        return {"message": "Memory deleted successfully"}

# RESTful enrich route
@app.post("/memories/<int:mid>/enrich")
def enrich_memory(mid: int):
    with get_session() as s:
        m = s.get(Memory, mid)
        if not m:
            return {"error": "not found"}, 404

        # Use your preferred palette function
        m.palette = infer_palette(m.note or m.artist)
        # Swap fake_setlist with fetch_tracks_for_artist when you hook an API key
        m.tracks = fake_setlist(m.artist)

        s.add(m)
        s.commit()
        s.refresh(m)
        
        # Return with European date format
        memory_dict = m.model_dump()
        memory_dict['date'] = format_european_date(m.date)
        return jsonify(memory_dict)


# Backward-compat alias if you already called /enrich/<id> somewhere
@app.post("/enrich/<int:mid>")
def enrich_compat(mid: int):
    return enrich_memory(mid)


@app.get("/card/<int:mid>.png")
def card_png(mid: int):
    with get_session() as s:
        m = s.get(Memory, mid)
        if not m:
            return {"error": "not found"}, 404

        date_str = m.date.strftime("%d %b %Y")
        # if frontend is separate, you can replace with its public URL
        qr_target = request.host_url.rstrip("/") + f"/memories/{mid}"

        out_name = f"card_{mid}.png"
        out_path = os.path.join(CARD_DIR, out_name)

        # choose a palette fallback if not enriched yet
        palette = m.palette or ["#222", "#333", "#444", "#ddd", "#fff"]
        tracks = m.tracks or []

        draw_poster(
            artist=m.artist,
            city=f"{m.city}, {m.country}".strip(", "),
            date_str=date_str,
            palette=palette,
            tracks=tracks,
            qr_url=qr_target,
            out_path=out_path,
        )
        return send_from_directory(CARD_DIR, out_name)


@app.get("/memories/<int:mid>")
def memory_detail(mid: int):
    with get_session() as s:
        m = s.get(Memory, mid)
        if not m:
            return {"error": "not found"}, 404
        
        # Return with European date format
        memory_dict = m.model_dump()
        memory_dict['date'] = format_european_date(m.date)
        return jsonify(memory_dict)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)
