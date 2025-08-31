import React, { useState, useEffect } from "react";
import { useMemories } from "../store/useMemories";

export default function AddMemoryModal() {
    const { modalOpen, setModal, pendingCoords, add } = useMemories();
    const [formData, setFormData] = useState({
        artist: "",
        venue: "",
        city: "",
        country: "DE", // default bias
        date: "",
        note: ""
    });

    const [isGeocoding, setIsGeocoding] = useState(false);
    const [geocodedCoords, setGeocodedCoords] = useState(null);

    // --- Helpers: date formatting (unchanged) ---
    const formatDateForDisplay = (dateStr) => {
        if (!dateStr) return "";
        if (dateStr.includes(".")) {
            const p = dateStr.split(".");
            if (p.length === 3 && p[0].length === 2) return `${p[2]}-${p[1]}-${p[0]}`;
        }
        const p = dateStr.split("-");
        if (p.length === 3 && p[0].length === 2) return `${p[2]}-${p[1]}-${p[0]}`;
        return dateStr;
    };
    const formatDateForSubmission = (dateStr) => {
        if (!dateStr) return "";
        const p = dateStr.split("-");
        if (p.length === 3 && p[0].length === 4) return `${p[2]}-${p[1]}-${p[0]}`;
        return dateStr;
    };

    // Normalize country to ISO2 lower for Nominatim countrycodes=
    const countrycodesFrom = (country) => {
        if (!country) return "";
        const iso2 = country.trim().slice(0, 2).toLowerCase(); // "DE" → "de", "Germany" → "ge" (not ideal)
        // quick map for common cases
        const map = { de: "de", at: "at", ch: "ch", fr: "fr", it: "it", nl: "nl", pl: "pl", cz: "cz" };
        return map[iso2] || ""; // if unknown, skip
    };

    // Structured geocode: city + country bias
    const geocodeCity = async (cityName, country) => {
        if (!cityName?.trim()) { setGeocodedCoords(null); return; }

        setIsGeocoding(true);
        try {
            const params = new URLSearchParams({
                format: "jsonv2",
                addressdetails: "1",
                dedupe: "1",
                limit: "5",
                featuretype: "city",
                "accept-language": "de"
            });
            params.append("city", cityName.trim());

            const cc = countrycodesFrom(country);
            if (cc) params.append("countrycodes", cc);
            // You can also add: params.append("country", country) — but countrycodes bias works well.

            const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
            const res = await fetch(url, { headers: { "User-Agent": "MuseMap (dev)" } });
            const data = await res.json();

            if (Array.isArray(data) && data.length) {
                const best = data[0];
                setGeocodedCoords({ lat: parseFloat(best.lat), lng: parseFloat(best.lon) });
            } else {
                setGeocodedCoords(null);
            }
        } catch (e) {
            console.error("Geocoding error:", e);
            setGeocodedCoords(null);
        } finally {
            setIsGeocoding(false);
        }
    };

    // Debounce structured geocode on city or country change
    useEffect(() => {
        const t = setTimeout(() => {
            if (formData.city.trim()) geocodeCity(formData.city, formData.country);
        }, 600);
        return () => clearTimeout(t);
    }, [formData.city, formData.country]);

    // Reverse-geocode after map click to prefill city/country
    useEffect(() => {
        const run = async () => {
            if (!pendingCoords) return;
            try {
                const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pendingCoords.lat}&lon=${pendingCoords.lng}&addressdetails=1&accept-language=de`;
                const res = await fetch(url, { headers: { "User-Agent": "MuseMap (dev)" } });
                const data = await res.json();
                const a = data?.address || {};
                setFormData((f) => ({
                    ...f,
                    city: a.city || a.town || a.village || f.city,
                    country: a.country_code ? a.country_code.toUpperCase() : (a.country || f.country)
                }));
            } catch (e) {
                console.warn("Reverse geocode failed:", e);
            }
        };
        run();
    }, [pendingCoords]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    if (!modalOpen) return null;

    const finalCoords = pendingCoords || geocodedCoords;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.artist.trim() || !formData.city.trim() || !formData.date.trim() || !finalCoords) {
            alert("Please fill Artist, City, Date and choose a location (click map or let the app geolocate the city).");
            return;
        }

        let formattedDate = formData.date;
        if (formattedDate.includes(".")) formattedDate = formattedDate.replace(/\./g, "-");

        const payload = {
            artist: formData.artist.trim(),
            venue: formData.venue.trim(),
            city: formData.city.trim(),
            country: formData.country.trim(),
            date: formattedDate, // DD-MM-YYYY (your formatter handles input/output)
            note: formData.note.trim(),
            lat: finalCoords.lat,
            lng: finalCoords.lng
        };

        try {
            await add(payload);
            setFormData({ artist: "", venue: "", city: "", country: "DE", date: "", note: "" });
            setGeocodedCoords(null);
            setModal(false);
        } catch (err) {
            console.error("Add failed:", err);
        }
    };

    return (
        <div className="modal-overlay" onClick={() => setModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">✨ Add New Memory</h2>
                    <button onClick={() => setModal(false)} className="modal-close-btn">×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">🎤 Artist *</label>
                        <input name="artist" className="form-input" value={formData.artist} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">🏟️ Venue</label>
                        <input name="venue" className="form-input" value={formData.venue} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">🌍 City *</label>
                        <div style={{ position: "relative" }}>
                            <input name="city" className="form-input" value={formData.city} onChange={handleChange} placeholder="e.g., Leipzig" required />
                            {isGeocoding && <div className="geocoding-indicator">🔍 Locating...</div>}
                        </div>
                        <small className="form-helper">Tip: set Country to bias the search.</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">🏳️ Country (ISO2 or name)</label>
                        <input type="text" name="country" className="form-input" value={formData.country} onChange={handleChange} placeholder='e.g., "DE" or "Germany"' />
                    </div>

                    <div className="form-group">
                        <label className="form-label">📅 Date (DD-MM-YYYY) *</label>
                        <input
                            type="date"
                            name="date"
                            className="form-input"
                            value={formatDateForDisplay(formData.date)}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, date: formatDateForSubmission(e.target.value) }))
                            }
                            required
                        />
                        <small className="form-helper">Stored as DD-MM-YYYY.</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">💭 Note</label>
                        <textarea name="note" className="form-textarea" rows="3" value={formData.note} onChange={handleChange} />
                    </div>

                    {finalCoords && (
                        <div className="location-display">
                            <div className="location-text">
                                📍 {finalCoords.lat.toFixed(4)}, {finalCoords.lng.toFixed(4)}
                                {geocodedCoords && !pendingCoords && <span className="location-auto">(auto)</span>}
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={!formData.artist || !formData.city || !formData.date || !finalCoords}>
                            ✨ Add Memory
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
