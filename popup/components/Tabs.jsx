export default function Tabs({ active, setActive }) {
    return (
        <div className="tabs">
            {["contacts", "deals", "tasks"].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActive(tab)}
                    className={`tab ${active === tab ? 'active' : ''}`}
                >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
            ))}
        </div>
    );
}
