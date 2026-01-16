export default function Header({ onExtract, onDownload, isAutoPaging, onToggleAutoPaging }) {
    return (
        <div className="header">
            <div className="brand">
                <div className="brand-icon">A</div>
                <span>ActiveCampaign</span>
            </div>

            <button className="primary-btn" onClick={onExtract}>
                Extract Page Data
            </button>
            <button
                className={`secondary-btn ${isAutoPaging ? "active" : ""}`}
                onClick={onToggleAutoPaging}
                style={{
                    backgroundColor: isAutoPaging ? "#4ade80" : "",
                    color: isAutoPaging ? "#000" : ""
                }}
            >
                {isAutoPaging ? "Stop Paging" : "Auto Paging"}
            </button>
            <button className="secondary-btn" onClick={onDownload}>
                CSV
            </button>
        </div>
    );
}
