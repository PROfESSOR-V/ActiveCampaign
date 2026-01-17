import React, { useEffect, useState } from "react";
import Tabs from "./components/Tabs";
import DataList from "./components/DataList";
import Header from "./components/Header";

const TABS = ["contacts", "deals", "tasks"];

export default function App() {
    const [activeTab, setActiveTab] = useState("contacts");
    const [data, setData] = useState({ contacts: [], deals: [], tasks: [] });
    const [isAutoPaging, setIsAutoPaging] = useState(false);

    useEffect(() => {
        const keys = ["ac_contacts", "ac_deals", "ac_tasks", "ac_auto_paging"];

        chrome.storage.local.get(keys, res => {
            setData({
                contacts: res.ac_contacts || [],
                deals: res.ac_deals || [],
                tasks: res.ac_tasks || []
            });
            setIsAutoPaging(res.ac_auto_paging || false);
        });

        const listener = (changes, area) => {
            if (area === "local") {
                if (changes.ac_contacts || changes.ac_deals || changes.ac_tasks) {
                    setData(prev => ({
                        contacts: changes.ac_contacts ? changes.ac_contacts.newValue : prev.contacts,
                        deals: changes.ac_deals ? changes.ac_deals.newValue : prev.deals,
                        tasks: changes.ac_tasks ? changes.ac_tasks.newValue : prev.tasks
                    }));
                }
                if (changes.ac_auto_paging) {
                    setIsAutoPaging(changes.ac_auto_paging.newValue);
                }
            }
        };

        chrome.storage.onChanged.addListener(listener);
        return () => chrome.storage.onChanged.removeListener(listener);
    }, []);

    const deleteItem = (id) => {
        const updated = data[activeTab].filter(i => i.id !== id);
        const newData = { ...data, [activeTab]: updated };

        const keyMap = {
            contacts: "ac_contacts",
            deals: "ac_deals",
            tasks: "ac_tasks"
        };

        chrome.storage.local.set({ [keyMap[activeTab]]: updated }, () => {
            setData(newData);
        });
    };

    const extractNow = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            chrome.tabs.sendMessage(tab.id, { type: "FORCE_EXTRACT" });
        });
    };

    const toggleAutoPaging = () => {
        const newState = !isAutoPaging;
        setIsAutoPaging(newState);
        chrome.storage.local.set({ ac_auto_paging: newState });
    };

    const downloadCSV = () => {
        const rows = [];
        const headers = new Set(["Record Type"]);

        const process = (type, items) => {
            if (!items) return;
            items.forEach(item => {
                const row = { "Record Type": type, ...item };
                Object.keys(row).forEach(k => headers.add(k));
                rows.push(row);
            });
        };

        process("Contact", data.contacts);
        process("Deal", data.deals);
        process("Task", data.tasks);

        const headerArr = Array.from(headers);
        const csvContent = [
            headerArr.join(","),
            ...rows.map(row => headerArr.map(h => {
                const val = row[h] ? String(row[h]).replace(/"/g, '""') : "";
                return `"${val}"`;
            }).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `activecampaign_export_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    return (
        <div className="app-container">
            <Header
                onExtract={extractNow}
                onDownload={downloadCSV}
                isAutoPaging={isAutoPaging}
                onToggleAutoPaging={toggleAutoPaging}
            />

            <div style={{ marginTop: 12 }}>
                <Tabs active={activeTab} setActive={setActiveTab} />
            </div>

            <DataList
                data={data[activeTab] || []}
                activeTab={activeTab}
                onDelete={deleteItem}
            />
        </div>
    );
}
