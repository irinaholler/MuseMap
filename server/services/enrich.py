import os, random
import requests


LASTFM_API_KEY = os.getenv("LASTFM_API_KEY")
MB_APP_ID = os.getenv("MUSICBRAINZ_APP_ID", "musemap")
MB_APP_VERSION = os.getenv("MUSICBRAINZ_APP_VERSION", "0.1")
MB_CONTACT = os.getenv("MUSICBRAINZ_CONTACT", "contact@example.com")

HEADERS_MB = {
"User-Agent": f"{MB_APP_ID}/{MB_APP_VERSION} ({MB_CONTACT})"
}

def infer_palette(text: str):
    """Return a simple hardcoded color palette (placeholder)."""
    return ["#2b2d42", "#8d99ae", "#edf2f4", "#ef233c", "#d90429"]

def fake_setlist(artist: str):
    """Return a fake setlist (placeholder)."""
    return [
        "Opening Song",
        "Middle Hit",
        "Acoustic Ballad",
        "Finale",
    ]

def mood_palette_from_text(text: str):
    """Return a random palette influenced by text length (demo)."""
    random.seed(len(text))
    return [f"#{random.randint(0, 0xFFFFFF):06x}" for _ in range(5)]

# --- Setlist/track enrichment (stubbed with lightweight calls or fallbacks) ---

def fetch_tracks_for_artist(artist: str):
    if LASTFM_API_KEY:
        # TODO: implement real API call here
        return [f"{artist} Track A", f"{artist} Track B", f"{artist} Track C"]
    else:
        return [f"{artist} Song 1", f"{artist} Song 2", f"{artist} Song 3"]

# date_str: str | None = None) -> list[str]:
# Try Last.fm top tracks as a friendly fallback when no setlist API is used
""" if LASTFM_API_KEY:
try:
r = requests.get(
"https://ws.audioscrobbler.com/2.0/",
params={
"method": "artist.gettoptracks",
"artist": artist,
"api_key": LASTFM_API_KEY,
"format": "json",
"limit": 8,
},
timeout=8,
)
data = r.json()
tracks = [t["name"] for t in data.get("toptracks", {}).get("track", [])]
return tracks[:8] or []
except Exception:
pass
# Fallback: pretend set of likely tracks
samples = ["Intro", "Opening Track", "Fan Favorite", "Acoustic Moment", "Encore"]
return random.sample(samples, k=min(5, len(samples)))
""" 

# --- Mood palette (very simple first pass) ---

"""
def mood_palette_from_text(text: str) -> list[str]:
text_l = text.lower()
moods = [
("euphoric", ["#ff6b6b", "#ffd166", "#06d6a0", "#118ab2", "#ef476f"]),
("nostalgic", ["#6b705c", "#a5a58d", "#b7b7a4", "#ffe8d6", "#cb997e"]),
("melancholy", ["#14213d", "#1b263b", "#415a77", "#778da9", "#e0e1dd"]),
("energetic", ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"]),
]
if any(k in text_l for k in ["cry", "sad", "melancholy", "blue"]):
return moods[2][1]
if any(k in text_l for k in ["retro", "memory", "old", "nostalg"]):
return moods[1][1]
if any(k in text_l for k in ["hype", "jump", "mosh", "energy", "wow"]):
return moods[3][1]
return moods[0][1]

"""