import React from "react";

export default function Table({ data, onDelete }) {
    if (!data.length) return <div style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>No data found</div>;

    const keys = Object.keys(data[0]).filter(k => k !== "id");

    return (
        <table className="data-table">
            <thead>
                <tr>
                    {keys.map(k => <th key={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</th>)}
                    <th style={{ width: 40 }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {data.map(row => (
                    <tr key={row.id}>
                        {keys.map(k => <td key={k}>{row[k]}</td>)}
                        <td>
                            <button className="btn-icon" onClick={() => onDelete(row.id)} title="Delete">🗑️</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
