import React from "react";

export default function DataList({ data, activeTab, onDelete }) {
    if (!data.length) {
        return (
            <div className="empty">
                <div style={{ fontSize: 40, marginBottom: 10 }}>✨</div>
                <h3>You're ready to go</h3>
                <p>Navigate to ActiveCampaign to extract data.</p>
            </div>
        );
    }

    const getAvatar = (name) => {
        return name ? name.charAt(0).toUpperCase() : "?";
    };

    return (
        <div className="data-list">
            {data.map(item => (
                <div key={item.id} className="contact-card">
                    <div className="card-left">
                        {/* Avatar */}
                        <div className="avatar">
                            {activeTab === "contacts" ? getAvatar(item.name || item.email) :
                                activeTab === "deals" ? "$" :
                                    "T"}
                        </div>

                        {/* Info */}
                        <div className="info">
                            {activeTab === "contacts" && (
                                <>
                                    <div className="name">{item.name || "Unknown Name"}</div>
                                    <div className="sub-text">{item.email}</div>
                                    <div className="sub-text">{item.phone}</div>
                                </>
                            )}

                            {activeTab === "deals" && (
                                <>
                                    <div className="name">{item.title}</div>
                                    <div className="sub-text" style={{ color: "#22c55e", fontWeight: 500 }}>{item.value}</div>
                                    <div className="sub-text">{item.stage}</div>
                                </>
                            )}

                            {activeTab === "tasks" && (
                                <>
                                    <div className="name">{item.title}</div>
                                    <div className="sub-text">Due: {item.dueDate}</div>
                                    <div className="sub-text">{item.status}</div>
                                </>
                            )}
                        </div>
                    </div>

                    <button className="delete-btn" onClick={() => onDelete(item.id)}>
                        🗑️
                    </button>
                </div>
            ))}
        </div>
    );
}
