const STORAGE_KEY = "simsfp-diary-admin-data";
const SESSION_KEY = "simsfp-diary-admin-session";

const DataStore = {
  loadAdminData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { overrides: {}, removedIds: [], created: [] };
      const data = JSON.parse(raw);
      return {
        overrides: data.overrides || {},
        removedIds: data.removedIds || [],
        created: data.created || [],
      };
    } catch {
      return { overrides: {}, removedIds: [], created: [] };
    }
  },

  saveAdminData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  getBaseEntries() {
    return typeof UPDATES !== "undefined" ? UPDATES.ENTRIES : [];
  },

  /** 管理者用: updates.js + ローカル編集をマージ */
  getAdminEntries() {
    const adminData = this.loadAdminData();
    const removed = new Set(adminData.removedIds);
    const map = new Map();

    this.getBaseEntries()
      .filter((entry) => !removed.has(entry.id))
      .forEach((entry) => map.set(entry.id, { ...entry, _source: "base" }));

    adminData.created.forEach((entry) => {
      map.set(entry.id, { ...entry, _source: "local" });
    });

    Object.values(adminData.overrides).forEach((entry) => {
      map.set(entry.id, { ...entry, _source: "local" });
    });

    return [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
  },

  getEntry(id) {
    return this.getAdminEntries().find((entry) => entry.id === id) || null;
  },

  saveEntry(entry) {
    const adminData = this.loadAdminData();
    const baseIds = new Set(this.getBaseEntries().map((e) => e.id));
    const payload = this.stripMeta(entry);

    adminData.removedIds = adminData.removedIds.filter((id) => id !== payload.id);

    if (baseIds.has(payload.id)) {
      adminData.overrides[payload.id] = payload;
    } else {
      adminData.created = adminData.created.filter((e) => e.id !== payload.id);
      adminData.created.push(payload);
    }

    this.saveAdminData(adminData);
  },

  deleteEntry(id) {
    const adminData = this.loadAdminData();
    const baseIds = new Set(this.getBaseEntries().map((e) => e.id));

    delete adminData.overrides[id];
    adminData.created = adminData.created.filter((e) => e.id !== id);

    if (baseIds.has(id) && !adminData.removedIds.includes(id)) {
      adminData.removedIds.push(id);
    }

    this.saveAdminData(adminData);
  },

  stripMeta(entry) {
    const { _source, ...rest } = entry;
    return JSON.parse(JSON.stringify(rest));
  },

  exportEntries() {
    return this.getAdminEntries().map((entry) => this.stripMeta(entry));
  },

  isAdminEnabled() {
    return typeof ADMIN_CONFIG !== "undefined" && Boolean(ADMIN_CONFIG.passphrase);
  },

  isAuthenticated() {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  },

  login(passphrase) {
    if (!this.isAdminEnabled()) return false;
    if (passphrase !== ADMIN_CONFIG.passphrase) return false;
    sessionStorage.setItem(SESSION_KEY, "1");
    return true;
  },

  logout() {
    sessionStorage.removeItem(SESSION_KEY);
  },

  createEmptyEntry() {
    const today = new Date().toISOString().slice(0, 10);
    return {
      id: `entry-${Date.now()}`,
      draft: true,
      date: today,
      version: "v5.xx.x",
      title: "",
      summary: "",
      official: { text: "", url: "", label: "公式告知を見る" },
      verified: {
        intro: "",
        sections: [{ heading: "追加・変更された要素", items: [""] }],
      },
      screenshots: [{ src: "images/placeholder.svg", alt: "", caption: "" }],
      conclusion: "",
    };
  },
};
