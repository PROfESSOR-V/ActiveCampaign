const STORAGE_KEYS = {
  contacts: "ac_contacts",
  deals: "ac_deals",
  tasks: "ac_tasks"
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message?.type || !message?.payload) return;

  if (message.type === "SAVE_CONTACTS") {
    syncEntity("contacts", message.payload);
  }

  if (message.type === "SAVE_DEALS") {
    syncEntity("deals", message.payload);
  }

  if (message.type === "SAVE_TASKS") {
    syncEntity("tasks", message.payload);
  }
});

/* ---------- GENERIC SYNC ---------- */

function syncEntity(entityType, newItems) {
  const storageKey = STORAGE_KEYS[entityType];
  if (!storageKey) return;

  chrome.storage.local.get([storageKey], (res) => {
    const currentItems = res[storageKey] || [];

    const map = new Map(
      currentItems.map(item => [item.id, item])
    );

    newItems.forEach(item => {
      map.set(item.id, {
        ...(map.get(item.id) || {}),
        ...item
      });
    });

    const updatedItems = Array.from(map.values());

    chrome.storage.local.set(
      { [storageKey]: updatedItems },
      () => {
        console.log(`[AC] ${entityType} synced. Total: ${updatedItems.length}`);
      }
    );
  });
}
