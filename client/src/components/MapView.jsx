import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useMemories } from "../store/useMemories";
import "leaflet/dist/leaflet.css";
import MemoryCard from "./MemoryCard";

function ClickToAddHook() {
    const setPendingCoords = useMemories((s) => s.setPendingCoords);
    useMapEvents({
        click(e) {
            setPendingCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
    });
    return null;
}

export default function MapView() {
    const { items, fetch, setModal } = useMemories();
    const [activeFilter, setActiveFilter] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetch();
    }, [fetch]);

    const stats = useMemo(() => {
        const totalMemories = items.length;
        const uniqueArtists = new Set(items.map(m => m.artist)).size;
        const uniqueCities = new Set(items.map(m => m.city)).size;
        const thisYear = new Date().getFullYear();

        // Fix year filtering for European date format (DD-MM-YYYY)
        const thisYearMemories = items.filter(m => {
            if (!m.date) return false;

            // Handle both DD-MM-YYYY and YYYY-MM-DD formats
            const parts = m.date.split('-');
            if (parts.length === 3) {
                if (parts[0].length === 2) {
                    // DD-MM-YYYY format, year is at the end
                    return parts[2] === thisYear.toString();
                } else if (parts[0].length === 4) {
                    // YYYY-MM-DD format, year is at the beginning
                    return parts[0] === thisYear.toString();
                }
            }
            return false;
        }).length;

        return { totalMemories, uniqueArtists, uniqueCities, thisYearMemories };
    }, [items]);

    // Filter and search logic
    const filteredItems = useMemo(() => {
        let filtered = items;

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(m =>
                m.artist.toLowerCase().includes(searchLower) ||
                m.city.toLowerCase().includes(searchLower) ||
                m.venue?.toLowerCase().includes(searchLower) ||
                m.note?.toLowerCase().includes(searchLower)
            );
        }

        // Apply active filter
        if (activeFilter) {
            switch (activeFilter) {
                case 'thisYear':
                    const thisYear = new Date().getFullYear();
                    filtered = filtered.filter(m => {
                        if (!m.date) return false;
                        const parts = m.date.split('-');
                        if (parts.length === 3) {
                            if (parts[0].length === 2) {
                                return parts[2] === thisYear.toString();
                            } else if (parts[0].length === 4) {
                                return parts[0] === thisYear.toString();
                            }
                        }
                        return false;
                    });
                    break;
                case 'total':
                    // Show all items
                    break;
                case 'artists':
                    // Show unique artists (first occurrence of each)
                    const seenArtists = new Set();
                    filtered = filtered.filter(m => {
                        if (seenArtists.has(m.artist)) return false;
                        seenArtists.add(m.artist);
                        return true;
                    });
                    break;
                case 'cities':
                    // Show unique cities (first occurrence of each)
                    const seenCities = new Set();
                    filtered = filtered.filter(m => {
                        if (seenCities.has(m.city)) return false;
                        seenCities.add(m.city);
                        return true;
                    });
                    break;
                default:
                    break;
            }
        }

        return filtered;
    }, [items, searchTerm, activeFilter]);

    // Pagination logic
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredItems, currentPage, itemsPerPage]);

    const handleStatClick = (filterType) => {
        if (activeFilter === filterType) {
            setActiveFilter(null);
        } else {
            setActiveFilter(filterType);
        }
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when search changes
    };

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <header className="app-header">
                <div>
                    <h1 className="app-title">
                        MuseMap
                    </h1>
                    <p style={{
                        color: "rgba(255, 255, 255, 0.8)",
                        fontSize: "14px",
                        margin: "4px 0 0 0",
                        fontWeight: "400",
                        fontFamily: "'Rajdhani', sans-serif",
                        letterSpacing: "0.5px"
                    }}>
                        Your musical journey across the world
                    </p>
                </div>
                <button
                    onClick={() => setModal(true)}
                    className="btn-primary"
                    style={{
                        fontSize: "16px",
                        padding: "14px 28px",
                        borderRadius: "12px"
                    }}
                >
                    ✨ Add Memory
                </button>
            </header>

            {/* Main Content */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 400px",
                flex: 1,
                overflow: "hidden"
            }}>
                {/* Map Section */}
                <div style={{ position: "relative" }}>
                    <div className="map-container">
                        <MapContainer
                            center={[52.52, 13.405]}
                            zoom={6}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <ClickToAddHook />
                            {items.map(m => (
                                <Marker key={m.id} position={[m.lat, m.lng]}>
                                    <Popup>
                                        <div style={{ minWidth: 280, maxWidth: 320 }}>
                                            <MemoryCard mem={m} />
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>

                        {/* Map Controls */}
                        <div className="map-controls">
                            <button
                                className="map-control-btn"
                                onClick={() => setModal(true)}
                                title="Add New Memory"
                            >
                                ➕
                            </button>
                        </div>
                    </div>

                    {/* Floating Stats */}
                    <div style={{
                        position: "absolute",
                        top: "20px",
                        left: "20px",
                        zIndex: 1000
                    }}>
                        <div className="glass-dark" style={{
                            padding: "16px",
                            borderRadius: "16px",
                            backdropFilter: "blur(20px)"
                        }}>
                            <div style={{
                                color: "white",
                                fontSize: "24px",
                                fontWeight: "700",
                                marginBottom: "4px",
                                fontFamily: "'Orbitron', monospace"
                            }}>
                                {stats.totalMemories}
                            </div>
                            <div style={{
                                color: "rgba(255, 255, 255, 0.8)",
                                fontSize: "12px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                fontFamily: "'Rajdhani', sans-serif",
                                fontWeight: "600"
                            }}>
                                Memories
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="sidebar">
                    {/* Stats Section */}
                    <div className="stats-container">
                        <div
                            className={`stat-card ${activeFilter === 'total' ? 'active' : ''}`}
                            onClick={() => handleStatClick('total')}
                        >
                            <div className="stat-number">{stats.totalMemories}</div>
                            <div className="stat-label">Total</div>
                        </div>
                        <div
                            className={`stat-card ${activeFilter === 'artists' ? 'active' : ''}`}
                            onClick={() => handleStatClick('artists')}
                        >
                            <div className="stat-number">{stats.uniqueArtists}</div>
                            <div className="stat-label">Artists</div>
                        </div>
                        <div
                            className={`stat-card ${activeFilter === 'cities' ? 'active' : ''}`}
                            onClick={() => handleStatClick('cities')}
                        >
                            <div className="stat-number">{stats.uniqueCities}</div>
                            <div className="stat-label">Cities</div>
                        </div>
                        <div
                            className={`stat-card ${activeFilter === 'thisYear' ? 'active' : ''}`}
                            onClick={() => handleStatClick('thisYear')}
                        >
                            <div className="stat-number">{stats.thisYearMemories}</div>
                            <div className="stat-label">This Year</div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="search-container">
                        <div className="search-icon">🔍</div>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search memories..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    {/* Filter Controls */}
                    {activeFilter && (
                        <div className="filter-controls">
                            <div className="filter-chip active">
                                {activeFilter === 'total' && 'All Memories'}
                                {activeFilter === 'artists' && 'Unique Artists'}
                                {activeFilter === 'cities' && 'Unique Cities'}
                                {activeFilter === 'thisYear' && 'This Year'}
                            </div>
                            <div
                                className="filter-chip"
                                onClick={() => setActiveFilter(null)}
                            >
                                Clear Filter
                            </div>
                        </div>
                    )}

                    {/* Results Info */}
                    <div style={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: "12px",
                        marginBottom: "16px",
                        fontFamily: "'Rajdhani', sans-serif"
                    }}>
                        Showing {paginatedItems.length} of {filteredItems.length} memories
                        {searchTerm && ` for "${searchTerm}"`}
                    </div>

                    {/* Memories List */}
                    <div className="memories-list">
                        {paginatedItems.length === 0 ? (
                            <div style={{
                                textAlign: "center",
                                padding: "40px 20px",
                                color: "rgba(255, 255, 255, 0.7)"
                            }}>
                                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎵</div>
                                <h3 style={{
                                    fontSize: "18px",
                                    fontWeight: "600",
                                    marginBottom: "8px",
                                    color: "white",
                                    fontFamily: "'Orbitron', monospace"
                                }}>
                                    {searchTerm ? 'No memories found' : 'No memories yet'}
                                </h3>
                                <p style={{
                                    fontSize: "14px",
                                    lineHeight: "1.5",
                                    fontFamily: "'Rajdhani', sans-serif"
                                }}>
                                    {searchTerm
                                        ? 'Try adjusting your search terms'
                                        : 'Click on the map to add your first musical memory'
                                    }
                                </p>
                            </div>
                        ) : (
                            paginatedItems.map(m => <MemoryCard key={m.id} mem={m} />)
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                            >
                                ← Previous
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            {totalPages > 5 && (
                                <span style={{ color: "rgba(255, 255, 255, 0.7)", padding: "0 8px" }}>
                                    ...
                                </span>
                            )}

                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}