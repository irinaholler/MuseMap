import React from "react";

export default function ConfirmationModal({
    isOpen,
    onConfirm,
    onCancel,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    icon = "⚠️",
    type = "warning" // warning, danger, info
}) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case "danger":
                return "🗑️";
            case "warning":
                return "⚠️";
            case "info":
                return "ℹ️";
            default:
                return icon;
        }
    };

    const getTitleColor = () => {
        switch (type) {
            case "danger":
                return "#ff4757";
            case "warning":
                return "#ff6b35";
            case "info":
                return "#667eea";
            default:
                return "#1a1a2e";
        }
    };

    return (
        <div className="confirmation-modal-overlay" onClick={onCancel}>
            <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                <span className="confirmation-modal-icon">{getIcon()}</span>

                <h3
                    className="confirmation-modal-title"
                    style={{ color: getTitleColor() }}
                >
                    {title}
                </h3>

                <p className="confirmation-modal-message">
                    {message}
                </p>

                <div className="confirmation-modal-actions">
                    <button
                        className="confirmation-modal-btn cancel"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`confirmation-modal-btn confirm ${type === 'danger' ? 'danger' : ''}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
