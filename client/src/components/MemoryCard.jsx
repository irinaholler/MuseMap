import React, { useState } from "react";
import { useMemories } from "../store/useMemories";
import ConfirmationModal from "./ConfirmationModal";

export default function MemoryCard({ mem }) {
    const [showPopup, setShowPopup] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editForm, setEditForm] = useState({
        artist: mem.artist,
        city: mem.city,
        venue: mem.venue || "",
        date: mem.date,
        note: mem.note || ""
    });
    const { update, delete: deleteMemory } = useMemories();

    const formatDate = (dateStr) => {
        if (!dateStr) return "";

        // Handle both DD-MM-YYYY and YYYY-MM-DD formats
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            if (parts[0].length === 2) {
                // DD-MM-YYYY format, convert to DD MMM YYYY
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthIndex = parseInt(parts[1]) - 1;
                return `${parts[0]} ${months[monthIndex]} ${parts[2]}`;
            } else if (parts[0].length === 4) {
                // YYYY-MM-DD format, convert to DD MMM YYYY
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthIndex = parseInt(parts[1]) - 1;
                return `${parts[2]} ${months[monthIndex]} ${parts[0]}`;
            }
        }
        return dateStr;
    };

    const handleCardClick = () => {
        setShowPopup(true);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            await update(mem.id, editForm);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating memory:", error);
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

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteMemory(mem.id);
            setShowDeleteConfirm(false);
            setShowPopup(false);
        } catch (error) {
            console.error("Error deleting memory:", error);
            alert("Failed to delete memory. Please try again.");
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
    };

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
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <>
            {/* Custom Delete Confirmation Modal */}
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

            {/* Popup Modal */}
            {showPopup && (
                <div className="memory-popup-overlay" onClick={handleClose}>
                    <div className="memory-popup" onClick={(e) => e.stopPropagation()}>
                        {isEditing ? (
                            // Edit Form
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
                                    <button
                                        className="memory-popup-btn edit"
                                        onClick={handleSave}
                                    >
                                        💾 Save
                                    </button>
                                    <button
                                        className="memory-popup-btn close"
                                        onClick={handleCancel}
                                    >
                                        ❌ Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            // View Mode
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

                                {mem.note && (
                                    <p className="memory-popup-note">
                                        "{mem.note}"
                                    </p>
                                )}

                                <div className="memory-popup-actions">
                                    <button
                                        className="memory-popup-btn edit"
                                        onClick={handleEdit}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        className="memory-popup-btn delete"
                                        onClick={handleDeleteClick}
                                    >
                                        🗑️ Delete
                                    </button>
                                    <button
                                        className="memory-popup-btn close"
                                        onClick={handleClose}
                                    >
                                        ✕ Close
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Regular Card View */}
            <div
                className="memory-card"
                onClick={handleCardClick}
            >
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
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(e);
                        }}
                    >
                        ✏️ Edit
                    </button>
                    <button
                        className="memory-action-btn delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(e);
                        }}
                    >
                        🗑️ Delete
                    </button>
                    {mem.note && mem.note.length > 100 && (
                        <button
                            className="memory-action-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick();
                            }}
                        >
                            📄 Read More
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
