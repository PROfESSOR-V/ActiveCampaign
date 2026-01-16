export default function Header({ onExtract, onDownload }) {
    return (
        <div className="header">
            <div className="brand">
                <div className="brand-icon">A</div>
                <span>ActiveCampaign</span>
            </div>

            <button className="primary-btn" onClick={onExtract}>
                Extract Page Data
            </button>
            <button className="secondary-btn" onClick={onDownload}>
                Download CSV
            </button>
        </div>
    );
}
