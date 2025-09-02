import React, { useState } from "react";
import { useMemories } from "../store/useMemories";
import { api } from "../lib/api";
import ConfirmationModal from "./ConfirmationModal";

export default function MemoryCard({ mem }) {
    const [showPopup, setShowPopup] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [posterOpen, setPosterOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        artist: mem.artist,
        city: mem.city,
        venue: mem.venue || "",
        date: mem.date,
        note: mem.note || ""
    });

    const { update, delete: deleteMemory, enrich } = useMemories();
    const posterUrl = `${api.defaults.baseURL}/card/${mem.id}.png`;

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const parts = dateStr.split("-");
        if (parts.length === 3) {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            if (parts[0].length === 2) {
                const mi = parseInt(parts[1]) - 1;
                return `${parts[0]} ${months[mi]} ${parts[2]}`; // DD-MM-YYYY
            } else if (parts[0].length === 4) {
                const mi = parseInt(parts[1]) - 1;
                return `${parts[2]} ${months[mi]} ${parts[0]}`; // YYYY-MM-DD
            }
        }
        return dateStr;
    };

    const handleCardClick = () => setShowPopup(true);
    const handleEdit = (e) => { e.stopPropagation(); setIsEditing(true); };

    const handleSave = async () => {
        try {
            await update(mem.id, editForm);
            setIsEditing(false);
        } catch (err) {
            console.error("Error updating memory:", err);
            alert("Failed to update memory. Please try again.");
        }
    };

    const handleCancel = () => {
        setEditForm({
            artist: mem.artist,
            city: mem.city,
            venue: mem.venue || "",
            date: mem.date,
            note: mem.note || ""
        });
        setIsEditing(false);
    };

    const handleDeleteClick = (e) => { e.stopPropagation(); setShowDeleteConfirm(true); };
    const handleDeleteConfirm = async () => {
        try {
            await deleteMemory(mem.id);
            setShowDeleteConfirm(false);
            setShowPopup(false);
        } catch (err) {
            console.error("Error deleting memory:", err);
            alert("Failed to delete memory. Please try again.");
        }
    };
    const handleDeleteCancel = () => setShowDeleteConfirm(false);

    const handleClose = () => {
        setShowPopup(false);
        setIsEditing(false);
        setEditForm({
            artist: mem.artist,
            city: mem.city,
            venue: mem.venue || "",
            date: mem.date,
            note: mem.note || ""
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <>
            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                title="Delete Memory"
                message={`Are you sure you want to delete "${mem.artist}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />

            {showPopup && (
                <div className="memory-popup-overlay" onClick={handleClose}>
                    <div className="memory-popup" onClick={(e) => e.stopPropagation()}>
                        {isEditing ? (
                            <>
                                <div className="memory-popup-header">
                                    <div>
                                        <input
                                            type="text"
                                            name="artist"
                                            value={editForm.artist}
                                            onChange={handleInputChange}
                                            className="edit-input"
                                            placeholder="Artist name"
                                        />
                                        <input
                                            type="text"
                                            name="venue"
                                            value={editForm.venue}
                                            onChange={handleInputChange}
                                            className="edit-input"
                                            placeholder="Venue (optional)"
                                        />
                                    </div>
                                    <input
                                        type="date"
                                        name="date"
                                        value={editForm.date}
                                        onChange={handleInputChange}
                                        className="edit-date-input"
                                    />
                                </div>

                                <input
                                    type="text"
                                    name="city"
                                    value={editForm.city}
                                    onChange={handleInputChange}
                                    className="edit-input"
                                    placeholder="City"
                                />

                                <textarea
                                    name="note"
                                    value={editForm.note}
                                    onChange={handleInputChange}
                                    className="edit-textarea"
                                    placeholder="Add your memories and thoughts..."
                                    rows={4}
                                />

                                <div className="memory-popup-actions">
                                    <button className="memory-popup-btn edit" onClick={handleSave}>💾 Save</button>
                                    <button className="memory-popup-btn close" onClick={handleCancel}>❌ Cancel</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="memory-popup-header">
                                    <div>
                                        <h2 className="memory-popup-title">{mem.artist}</h2>
                                        <p className="memory-popup-location">
                                            {mem.venue && `${mem.venue} • `}{mem.city}
                                        </p>
                                    </div>
                                    <span className="memory-popup-date">{formatDate(mem.date)}</span>
                                </div>

                                {mem.note && <p className="memory-popup-note">"{mem.note}"</p>}

                                {/* Poster preview only when likely available */}
                                {mem.id && (
                                    <div className="poster-preview" style={{ marginTop: 12 }}>
                                        <img
                                            src={`${api.defaults.baseURL}/card/${mem.id}.png`}
                                            alt={`Poster for ${mem.artist}`}
                                            style={{ maxWidth: "100%", borderRadius: 8, display: "block" }}
                                            loading="lazy"
                                            onClick={(e) => { e.stopPropagation(); window.open(posterUrl, "_blank"); }}
                                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                                        />
                                    </div>
                                )}

                                <div className="memory-popup-actions">
                                    <button className="memory-popup-btn edit" onClick={handleEdit}>✏️ Edit</button>
                                    <button className="memory-popup-btn delete" onClick={handleDeleteClick}>🗑️ Delete</button>
                                    {/* removed 🎛️ Enrich from popup for now */}
                                    <a
                                        href={posterUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button className="memory-popup-btn">🎨 Poster</button>
                                    </a>
                                    <button className="memory-popup-btn close" onClick={handleClose}>✕ Close</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Regular Card View */}
            <div className="memory-card" onClick={handleCardClick}>
                <div className="memory-header">
                    <div>
                        <h3 className="memory-title">{mem.artist}</h3>
                        <p className="memory-location">
                            {mem.venue && `${mem.venue} • `}{mem.city}
                        </p>
                    </div>
                    <span className="memory-date">{formatDate(mem.date)}</span>
                </div>

                {mem.note && (
                    <p className="memory-note">
                        {mem.note.length > 100 ? `${mem.note.substring(0, 100)}...` : mem.note}
                    </p>
                )}

                <div className="memory-actions">
                    <button
                        className="memory-action-btn"
                        onClick={(e) => { e.stopPropagation(); handleEdit(e); }}
                    >
                        ✏️ Edit
                    </button>
                    <button
                        className="memory-action-btn delete"
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(e); }}
                    >
                        🗑️ Delete
                    </button>

                    {/* keep Enrich here for later use */}
                    <button
                        className="memory-action-btn"
                        onClick={(e) => { e.stopPropagation(); enrich(mem.id); }}
                        title="Add palette + tracks"
                    >
                        🎛️ Enrich
                    </button>
                    <a
                        href={posterUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="memory-action-btn"
                            onClick={(e) => { e.stopPropagation(); setPosterOpen(true); }}
                        >
                            🎨 Poster
                        </button>
                    </a>

                    {mem.note && mem.note.length > 100 && (
                        <button
                            className="memory-action-btn"
                            onClick={(e) => { e.stopPropagation(); setShowPopup(true); }}
                        >
                            📄 Read More
                        </button>
                    )}
                </div>
            </div>
            {posterOpen && (
                <div
                    className="poster-modal-overlay"
                    onClick={() => setPosterOpen(false)}
                    style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
                        display: "grid", placeItems: "center", zIndex: 2000
                    }}
                >
                    <div
                        className="poster-modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#111", padding: 12, borderRadius: 16,
                            boxShadow: "0 20px 60px rgba(0,0,0,.4)"
                        }}
                    >
                        <img
                            src={posterUrl}
                            alt={`Poster for ${mem.artist}`}
                            style={{
                                width: "min(520px, 90vw)",   // << controls visual size
                                height: "auto",
                                borderRadius: 12,
                                display: "block",
                            }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                            <a href={posterUrl} download={`poster-${mem.artist}-${mem.city}.png`}>
                                <button className="memory-action-btn">⬇️ Download</button>
                            </a>
                            <button className="memory-action-btn" onClick={() => setPosterOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
