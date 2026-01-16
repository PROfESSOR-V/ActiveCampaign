(() => {
  console.log("[AC] Extractor loaded");

  /* ---------- HELPERS ---------- */

  function wait(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  function debug(msg) {
    console.log(`[AC] ${msg}`);
  }

  /* ---------- VISUAL FEEDBACK (SHADOW DOM) ---------- */

  const VisualFeedback = {
    root: null,
    msgEl: null,
    timer: null,

    init() {
      if (this.root) return;
      const host = document.createElement("div");
      host.id = "ac-extractor-host";
      document.body.appendChild(host);

      const shadow = host.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = `
        .box {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 12px 16px;
          background: #333;
          color: #fff;
          border-radius: 8px;
          font-family: sans-serif;
          font-size: 14px;
          z-index: 999999;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.3s, transform 0.3s;
          pointer-events: none;
        }
        .box.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .box.success { border-left: 4px solid #4ade80; }
        .box.processing { border-left: 4px solid #60a5fa; }
      `;

      this.msgEl = document.createElement("div");
      this.msgEl.className = "box";

      shadow.appendChild(style);
      shadow.appendChild(this.msgEl);
      this.root = shadow;
    },

    show(text, type = "processing") {
      this.init();
      clearTimeout(this.timer);
      this.msgEl.textContent = text;
      this.msgEl.className = `box visible ${type}`;
    },

    hide(delay = 3000) {
      this.timer = setTimeout(() => {
        if (this.msgEl) this.msgEl.classList.remove("visible");
      }, delay);
    }
  };

  /* ---------- CONTACTS ---------- */

  function scrapeContacts() {
    if (!location.href.includes("/contacts")) return null;

    const rows = document.querySelectorAll('tr[data-testid="c-table__row"]');
    if (!rows.length) return null;

    const contacts = [];

    rows.forEach(row => {
      const emailEl = row.querySelector('td[data-testid="c-table__cell--email"] a');
      if (!emailEl) return;

      const email = emailEl.innerText.trim();

      contacts.push({
        id: email,
        name: row.querySelector('td[data-testid="c-table__cell--full-name"] a')?.innerText.trim() || "",
        email,
        phone: row.querySelector('td[data-testid="c-table__cell--phone"] a')?.innerText.trim() || "",
        owner: row.querySelector('td[data-testid="c-table__cell--owner"]')?.innerText.trim() || "Unassigned"
      });
    });

    return contacts.length
      ? { type: "SAVE_CONTACTS", payload: contacts }
      : null;
  }

  /* ---------- DEALS ---------- */

  function scrapeDeals() {
    if (!location.href.includes("/deals")) return null;

    const board = document.querySelector('[class*="deal-board"]');
    if (!board) return null;

    const columns = board.querySelectorAll('[class*="deal-board_column"]');
    if (!columns.length) return null;

    const deals = [];
    const seen = new Set();

    columns.forEach(column => {
      const stageEl = column.querySelector("camp-text");
      const stage = stageEl ? stageEl.innerText.trim() : "Unknown";

      const links = column.querySelectorAll('a[href*="/app/deals/"]');

      links.forEach(link => {
        const m = link.href.match(/\/deals\/(\d+)/);
        if (!m) return;

        const id = m[1];
        if (seen.has(id)) return;
        seen.add(id);

        const card = link.closest('[class*="deal-card"]');
        if (!card) return;

        const rawTitle = link.innerText || "";
        const title = rawTitle
          .split("\n")[0]
          .split("–")[0]
          .split("-")[0]
          .trim();

        const value = card.querySelector('[class*="value"]')?.innerText.trim() || "";
        const contact = card.querySelector('[class*="contact-fullname"]')?.innerText.trim() || "";

        deals.push({
          id,
          title,
          value,
          stage,
          contact
        });
      });
    });

    return deals.length
      ? { type: "SAVE_DEALS", payload: deals }
      : null;
  }

  /* ---------- TASKS ---------- */

  function scrapeTasks() {
    if (!location.href.includes("/tasks")) return null;

    const table = document.querySelector("table");
    if (!table) return null;

    const rows = table.querySelectorAll("tbody tr");
    if (!rows.length) return null;

    const tasks = [];

    rows.forEach(row => {
      // ---------- TITLE ----------
      const titleEl = row.querySelector(".task-title");
      let title = titleEl ? titleEl.innerText.trim() : "";

      if (title.includes(":")) {
        title = title.split(":").slice(1).join(":").trim();
      }

      // ---------- ROW TEXT ----------
      const textParts = row.innerText
        .split("\t")
        .map(t => t.trim())
        .filter(Boolean);

      // ---------- TASK TYPE ----------
      const taskTypeRaw = textParts[0] || "";
      const taskType = taskTypeRaw.includes(":")
        ? taskTypeRaw.split(":")[0].trim()
        : taskTypeRaw;

      // ---------- RELATED / ASSIGNEE ----------
      const relatedTo = textParts[1] || "";

      const assignee = textParts[1]
        ? textParts[1].split(/[-–]/)[1]?.trim() || ""
        : "";

      const dueDate = textParts[2] || "";
      const status = textParts[3] || "";

      tasks.push({
        id: `${title}-${dueDate}`, // stable-enough task id
        title,
        taskType,
        relatedTo,
        assignee,
        dueDate,
        status
      });
    });

    return tasks.length
      ? { type: "SAVE_TASKS", payload: tasks }
      : null;
  }

  /* ---------- SESSION-SAFE EXECUTION ---------- */

  let running = false;

  const observer = new MutationObserver(async () => {
    if (running) return;
    running = true;

    // wait for SPA + session hydration
    VisualFeedback.show("Acquiring data...", "processing");
    await wait(1500);

    let found = 0;
    const items = [];

    const contacts = scrapeContacts();
    if (contacts) {
      chrome.runtime.sendMessage(contacts);
      found += contacts.payload.length;
      items.push("Contacts");
    }

    const deals = scrapeDeals();
    if (deals) {
      chrome.runtime.sendMessage(deals);
      found += deals.payload.length;
      items.push("Deals");
    }

    const tasks = scrapeTasks();
    if (tasks) {
      chrome.runtime.sendMessage(tasks);
      found += tasks.payload.length;
      items.push("Tasks");
    }

    if (found > 0) {
      VisualFeedback.show(`Synced ${found} ${items.join(", ")}`, "success");
      VisualFeedback.hide(4000);
    } else {
      VisualFeedback.show("No relevant data found", "processing");
      VisualFeedback.hide(2000);
    }

    running = false;
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  /* ---------- LISTENER ---------- */

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "FORCE_EXTRACT") {
      location.reload();
    }
  });
})();
