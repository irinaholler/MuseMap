import React, { useState, useEffect } from "react";
import { useMemories } from "../store/useMemories";

export default function AddMemoryModal() {
    const { modalOpen, setModal, pendingCoords, add } = useMemories();
    const [formData, setFormData] = useState({
        artist: "",
        venue: "",
        city: "",
        date: "",
        note: ""
    });
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [geocodedCoords, setGeocodedCoords] = useState(null);

    console.log("AddMemoryModal render - modalOpen:", modalOpen, "pendingCoords:", pendingCoords);

    // Function to geocode city name to coordinates
    const geocodeCity = async (cityName) => {
        if (!cityName || cityName.trim() === "") {
            setGeocodedCoords(null);
            return;
        }

        setIsGeocoding(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const location = data[0];
                const coords = {
                    lat: parseFloat(location.lat),
                    lng: parseFloat(location.lon)
                };
                console.log("Geocoded coordinates for", cityName, ":", coords);
                setGeocodedCoords(coords);
            } else {
                console.log("No coordinates found for", cityName);
                setGeocodedCoords(null);
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            setGeocodedCoords(null);
        } finally {
            setIsGeocoding(false);
        }
    };

    // Geocode city when it changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formData.city && formData.city.trim() !== "") {
                geocodeCity(formData.city);
            }
        }, 1000); // Wait 1 second after user stops typing

        return () => clearTimeout(timeoutId);
    }, [formData.city]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted with data:", formData);
        console.log("Pending coords:", pendingCoords);
        console.log("Geocoded coords:", geocodedCoords);

        // Use either manually clicked coordinates or geocoded coordinates
        const finalCoords = pendingCoords || geocodedCoords;

        // Check each required field
        const validation = {
            artist: !!formData.artist && formData.artist.trim() !== "",
            city: !!formData.city && formData.city.trim() !== "",
            date: !!formData.date && formData.date.trim() !== "",
            coords: !!finalCoords
        };

        console.log("Validation results:", validation);

        if (!validation.artist || !validation.city || !validation.date || !validation.coords) {
            console.log("Validation failed:", validation);
            if (!finalCoords) {
                alert("Please fill in all required fields (Artist, City, Date). The city will be automatically located on the map.");
            } else {
                alert("Please fill in all required fields (Artist, City, Date).");
            }
            return;
        }

        // Ensure date is in correct format (DD-MM-YYYY)
        let formattedDate = formData.date;
        if (formData.date.includes('.')) {
            // Convert from DD.MM.YYYY to DD-MM-YYYY
            formattedDate = formData.date.replace(/\./g, '-');
        }

        const memoryData = {
            artist: formData.artist.trim(),
            venue: formData.venue.trim(),
            city: formData.city.trim(),
            date: formattedDate,
            note: formData.note.trim(),
            lat: finalCoords.lat,
            lng: finalCoords.lng
        };

        console.log("Calling add with:", memoryData);

        // Call the add function
        add(memoryData).then(() => {
            console.log("Add completed successfully");
            setFormData({ artist: "", venue: "", city: "", date: "", note: "" });
            setGeocodedCoords(null);
            setModal(false);
        }).catch((error) => {
            console.error("Add failed:", error);
            // Don't close modal on error, let user see the error
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`Field ${name} changed to:`, value);
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Helper function to format date for display
    const formatDateForDisplay = (dateStr) => {
        if (!dateStr) return "";

        // Handle various date formats
        if (dateStr.includes('.')) {
            // DD.MM.YYYY format, convert to YYYY-MM-DD for HTML input
            const parts = dateStr.split('.');
            if (parts.length === 3 && parts[0].length === 2) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }

        // Convert from DD-MM-YYYY to YYYY-MM-DD for HTML date input
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0].length === 2) {
            // Already in DD-MM-YYYY format, convert to YYYY-MM-DD
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateStr;
    };

    // Helper function to format date for submission
    const formatDateForSubmission = (dateStr) => {
        if (!dateStr) return "";

        // Convert from YYYY-MM-DD (HTML date input) to DD-MM-YYYY
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
            // In YYYY-MM-DD format, convert to DD-MM-YYYY
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateStr;
    };

    if (!modalOpen) {
        console.log("Modal not open, returning null");
        return null;
    }

    // Use either manually clicked coordinates or geocoded coordinates
    const finalCoords = pendingCoords || geocodedCoords;

    return (
        <div className="modal-overlay" onClick={() => setModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        ✨ Add New Memory
                    </h2>
                    <button
                        onClick={() => setModal(false)}
                        className="modal-close-btn"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            🎤 Artist *
                        </label>
                        <input
                            type="text"
                            name="artist"
                            value={formData.artist}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="e.g., The Beatles"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            🏟️ Venue
                        </label>
                        <input
                            type="text"
                            name="venue"
                            value={formData.venue}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="e.g., Lanxess Arena"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            🌍 City *
                        </label>
                        <div style={{ position: "relative" }}>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., Berlin"
                                required
                            />
                            {isGeocoding && (
                                <div className="geocoding-indicator">
                                    🔍 Locating...
                                </div>
                            )}
                        </div>
                        <small className="form-helper">
                            City will be automatically located on the map
                        </small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            📅 Date (DD-MM-YYYY) *
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formatDateForDisplay(formData.date)}
                            onChange={(e) => {
                                const formattedDate = formatDateForSubmission(e.target.value);
                                console.log("Date changed:", e.target.value, "->", formattedDate);
                                setFormData(prev => ({
                                    ...prev,
                                    date: formattedDate
                                }));
                            }}
                            className="form-input"
                            required
                        />
                        <small className="form-helper">
                            Date will be stored in European format (DD-MM-YYYY)
                        </small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            💭 Note
                        </label>
                        <textarea
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            className="form-textarea"
                            placeholder="Share your memories from this concert..."
                            rows="3"
                        />
                    </div>

                    {finalCoords && (
                        <div className="location-display">
                            <div className="location-text">
                                📍 Location: {finalCoords.lat.toFixed(4)}, {finalCoords.lng.toFixed(4)}
                                {geocodedCoords && !pendingCoords && (
                                    <span className="location-auto">
                                        (auto-detected)
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => setModal(false)}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={!formData.artist || !formData.city || !formData.date || !finalCoords}
                            style={{
                                opacity: (!formData.artist || !formData.city || !formData.date || !finalCoords) ? 0.5 : 1
                            }}
                        >
                            ✨ Add Memory
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}