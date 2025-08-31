# MuseMap — Live‑Music Memory Atlas

Turn concert memories into beautiful, shareable “memory cards” on a world map.

---

## ✨ Why MuseMap?

MuseMap fuses geolocation, music metadata, mood analysis, and lightweight generative design. It’s a creative diary for music lovers: pin your shows, enrich them with setlists, and export poster‑style cards you can share anywhere.

---

## 🧱 Tech Stack

**Frontend (client)**

- React (Vite)
- react‑leaflet + Leaflet (OpenStreetMap tiles)
- Zustand (state), Framer Motion (animations)
- Axios, date‑fns, qrcode.react

**Backend (server)**

- Flask + Flask‑CORS
- SQLModel (SQLite) for data
- Requests (MusicBrainz/Last.fm enrich), Pillow (poster PNG)
- python‑dotenv

**Optional**

- Last.fm API key (for track info)
- MusicBrainz (no key, but requires respectful User‑Agent)

---

## 🗂 Monorepo Structure

```
musemap/
├─ client/                      # React app (Vite)
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ MapView.jsx
│  │  │  ├─ MemoryCard.jsx
│  │  │  ├─ AddMemoryModal.jsx
│  │  │  └─ Timeline.jsx
│  │  ├─ store/useMemories.js
│  │  ├─ lib/api.js
│  │  ├─ App.jsx
│  │  └─ main.jsx
│  └─ index.html
├─ server/                      # Flask API
│  ├─ app.py
│  ├─ models.py
│  ├─ db.py
│  ├─ services/
│  │  ├─ enrich.py              # setlist lookup + palette
│  │  └─ poster.py              # Pillow poster generator
│  ├─ static/cards/             # exported share cards (PNG)
│  ├─ uploads/                  # ticket/photos (user uploads)
│  └─ .env.example
├─ README.md
└─ LICENSE
```

---

## 🚀 Quickstart

### 1) Prereqs

- Node.js ≥ 18
- Python ≥ 3.10 (3.11 recommended)

### 2) Clone

```bash
git clone <your-repo-url> musemap
cd musemap
```

### 3) Backend setup (server)

```bash
cd server
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env         # then fill values
python app.py                # runs on http://localhost:5001
```

### 4) Frontend setup (client)

```bash
cd client

# install deps
npm install react react-dom

# leaflet for map
npm install react-leaflet leaflet

# state management
npm install zustand

# animations
npm install framer-motion

# http requests
npm install axios

# date utils
npm install date-fns

# QR code rendering
npm install qrcode.react

npm run dev                  # runs on http://localhost:5173
```

---

## 🔐 Environment Variables

Create `server/.env` based on `.env.example`:

```
# Required
FLASK_ENV=development
DATABASE_URL=sqlite:///musemap.db
CORS_ORIGINS=http://localhost:5173

# Optional (enrichment)
LASTFM_API_KEY=
MUSICBRAINZ_APP_NAME=MuseMap
MUSICBRAINZ_CONTACT=youremail@example.com
POSTER_BRAND_TEXT=MuseMap
```

> **Note:** MusicBrainz does not require an API key but asks for a proper `User-Agent` (use `MUSICBRAINZ_APP_NAME` + contact email). Use Last.fm for top tracks by artist/date if desired.

---

## 🧭 API Overview

Base URL: `http://localhost:5001`

### Memories

- `GET /memories` → list all (light payload for map)
- `GET /memories/<id>` → single memory detail
- `POST /memories` → create `{ artist, venue, date, city, lat, lng, note? }`
- `PUT /memories/<id>` → update
- `DELETE /memories/<id>` → delete

### Enrichment & Assets

- `POST /memories/<id>/enrich` → adds `{ tracks[], palette[] }`
- `POST /memories/<id>/upload` → upload ticket/photo (multipart)
- `GET /card/<id>.png` → poster PNG render (server generates on demand)

HTTP examples:

```bash
curl -X POST http://localhost:5001/memories \
  -H 'Content-Type: application/json' \
  -d '{
    "artist":"Linkin Park",
    "venue":"Waldbühne",
    "date":"2024-08-12",
    "city":"Berlin",
    "lat":52.510,
    "lng":13.241,
    "note":"Blue hour, goosebumps at Numb"
  }'
```

---

## 🗄 Data Model (SQLModel)

```python
class Memory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    artist: str
    venue: str
    date: date
    city: str
    lat: float
    lng: float
    note: str = ""
    tracks: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    palette: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    image_path: str | None = None
```

---

## 🗺 Frontend Pages

- **Map** `/` – pins with hover mini‑cards; click → detail
- **Detail** `/m/:id` – timeline, setlist chips, palette strip, export card
- **Add Memory Modal** – artist/venue/date/city + geocode picker (map click)

---

## 🧪 Development Notes

- **Tiles:** Uses OpenStreetMap via Leaflet. Be mindful of usage limits; for production, consider MapTiler/Mapbox.
- **Geocoding:** Start with a simple lat/lng map click; optional Nominatim lookup.
- **Enriching:** Begin rule‑based palettes (keywords → HSL). Add Last.fm/MusicBrainz later.
- **Posters:** Use Pillow; deterministic layout with palette stripes + artist/venue/date.

---

## 🧰 Scripts

**client**

- `dev` – Vite dev server
- `build` – production build
- `preview` – preview build

**server**

- `app.py` – dev server (Flask built‑in)

---

## 🗺️ Roadmap (MVP → Extras)

- [x] CRUD memories
- [x] Map + pins + details
- [x] Poster generator PNG
- [ ] Enrichment: setlists (MusicBrainz/Last.fm)
- [ ] QR on poster linking to detail page
- [ ] Hype Card (upcoming shows)
- [ ] Dark/Light poster styles
- [ ] Import from CSV

---

## 🧪 Test Data

Use `server/seed.py` (optional) to insert a few memories. Example row:

```
artist,venue,date,city,lat,lng,note
Linkin Park,Waldbühne,2024-08-12,Berlin,52.510,13.241,Blue hour, goosebumps at Numb
```

---

## 📦 Deployment

- **Frontend:** Vercel/Netlify (static)
- **Backend:** Azure App Service (you’ve done this with Flask)
- **DB:** SQLite persisted to disk; for multi‑user, move to Postgres

---

## 📜 License

MIT — do what you love, credit is appreciated.
