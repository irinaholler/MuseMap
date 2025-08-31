import React, { useMemo } from "react";

export default function Timeline({ items }) {
    const byYear = useMemo(() => {
        const groups = {};
        items.forEach(m => {
            // Extract year from date string (handle both DD-MM-YYYY and YYYY-MM-DD)
            let year = "Unknown";
            if (m.date) {
                const parts = m.date.split('-');
                if (parts.length === 3) {
                    if (parts[0].length === 2) {
                        // DD-MM-YYYY format
                        year = parts[2];
                    } else if (parts[0].length === 4) {
                        // YYYY-MM-DD format
                        year = parts[0];
                    }
                }
            }
            groups[year] = groups[year] || [];
            groups[year].push(m);
        });
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    }, [items]);

    const formatDate = (dateString) => {
        if (!dateString) return "Unknown Date";
        
        // Check if it's already in European format (DD-MM-YYYY)
        if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
            // Already in DD-MM-YYYY format, extract day and month
            const parts = dateString.split('-');
            const day = parts[0];
            const month = parts[1];
            
            // Convert month number to short name
            const monthNames = [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ];
            const monthName = monthNames[parseInt(month) - 1] || month;
            
            return `${day} ${monthName}`;
        }
        
        // Convert from YYYY-MM-DD to DD-MM-YYYY format for display
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        const monthName = monthNames[date.getMonth()];
        
        return `${day} ${monthName}`;
    };

    return (
        <div style={{
            display: "grid",
            gap: "24px",
            padding: "20px"
        }}>
            {byYear.map(([year, arr]) => (
                <section key={year} className="slide-in">
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "16px",
                        gap: "12px"
                    }}>
                        <div style={{
                            width: "4px",
                            height: "24px",
                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                            borderRadius: "2px"
                        }} />
                        <h3 style={{
                            margin: 0,
                            fontSize: "24px",
                            fontWeight: "700",
                            color: "white",
                            fontFamily: "'Playfair Display', serif"
                        }}>
                            {year}
                        </h3>
                        <span style={{
                            background: "rgba(255, 255, 255, 0.2)",
                            color: "white",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backdropFilter: "blur(10px)"
                        }}>
                            {arr.length} {arr.length === 1 ? 'memory' : 'memories'}
                        </span>
                    </div>

                    <div style={{
                        display: "grid",
                        gap: "12px",
                        paddingLeft: "16px",
                        borderLeft: "2px solid rgba(255, 255, 255, 0.1)"
                    }}>
                        {arr.map((m, index) => (
                            <div
                                key={m.id}
                                style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    backdropFilter: "blur(10px)",
                                    borderRadius: "12px",
                                    padding: "16px",
                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                    transition: "all 0.3s ease",
                                    cursor: "pointer",
                                    position: "relative"
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = "translateX(8px)";
                                    e.target.style.background = "rgba(255, 255, 255, 0.15)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = "translateX(0)";
                                    e.target.style.background = "rgba(255, 255, 255, 0.1)";
                                }}
                            >
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: "8px"
                                }}>
                                    <div>
                                        <h4 style={{
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            color: "white",
                                            margin: "0 0 4px 0",
                                            fontFamily: "'Playfair Display', serif"
                                        }}>
                                            {m.artist}
                                        </h4>
                                        <p style={{
                                            fontSize: "14px",
                                            color: "rgba(255, 255, 255, 0.8)",
                                            margin: 0,
                                            fontWeight: "500"
                                        }}>
                                            {m.venue ? `${m.venue} • ` : ""}{m.city}{m.country ? `, ${m.country}` : ""}
                                        </p>
                                    </div>
                                    <span style={{
                                        fontSize: "12px",
                                        color: "#667eea",
                                        fontWeight: "600",
                                        background: "rgba(102, 126, 234, 0.2)",
                                        padding: "4px 8px",
                                        borderRadius: "8px",
                                        whiteSpace: "nowrap",
                                        backdropFilter: "blur(10px)"
                                    }}>
                                        {formatDate(m.date)}
                                    </span>
                                </div>

                                {m.note && (
                                    <p style={{
                                        margin: "8px 0 0 0",
                                        fontSize: "13px",
                                        color: "rgba(255, 255, 255, 0.7)",
                                        lineHeight: "1.4",
                                        fontStyle: "italic"
                                    }}>
                                        "{m.note}"
                                    </p>
                                )}

                                {m.palette?.length ? (
                                    <div style={{
                                        display: "flex",
                                        gap: "4px",
                                        marginTop: "12px",
                                        padding: "8px",
                                        background: "rgba(255, 255, 255, 0.05)",
                                        borderRadius: "8px"
                                    }}>
                                        {m.palette.map((c, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    width: "20px",
                                                    height: "12px",
                                                    background: c,
                                                    borderRadius: "6px",
                                                    border: "1px solid rgba(255, 255, 255, 0.3)"
                                                }}
                                            />
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            {byYear.length === 0 && (
                <div style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "rgba(255, 255, 255, 0.7)"
                }}>
                    <div style={{ fontSize: "64px", marginBottom: "20px" }}>📅</div>
                    <h3 style={{
                        fontSize: "20px",
                        fontWeight: "600",
                        marginBottom: "12px",
                        color: "white"
                    }}>
                        No timeline yet
                    </h3>
                    <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
                        Add some memories to see your musical journey through time
                    </p>
                </div>
            )}
        </div>
    );
}
