const STORAGE_KEY = "simsfp-diary-admin-data";
const SESSION_KEY = "simsfp-diary-admin-session";

const DataStore = {
  remoteEntries: null,
  remoteSite: null,
  useGitHub: false,

  async hashPassphrase(text) {
    const data = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  },

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

  getSite() {
    if (this.remoteSite) return this.remoteSite;
    return typeof SITE !== "undefined" ? SITE : { title: "", tagline: "", author: "" };
  },

  getBaseEntries() {
    if (this.useGitHub && this.remoteEntries) return this.remoteEntries;
    return typeof UPDATES !== "undefined" ? UPDATES.ENTRIES : [];
  },

  /** 管理者用: updates.js + ローカル編集をマージ */
  getAdminEntries() {
    if (this.useGitHub && this.remoteEntries) {
      return [...this.remoteEntries].sort((a, b) => b.date.localeCompare(a.date));
    }

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
    const payload = this.stripMeta(entry);

    if (this.useGitHub) {
      const map = new Map(this.getAdminEntries().map((item) => [item.id, this.stripMeta(item)]));
      map.set(payload.id, payload);
      this.remoteEntries = [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
      return;
    }

    const adminData = this.loadAdminData();
    const baseIds = new Set(
      (typeof UPDATES !== "undefined" ? UPDATES.ENTRIES : []).map((e) => e.id)
    );

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
    if (this.useGitHub) {
      this.remoteEntries = this.getAdminEntries()
        .filter((entry) => entry.id !== id)
        .map((entry) => this.stripMeta(entry));
      return;
    }

    const adminData = this.loadAdminData();
    const baseIds = new Set(
      (typeof UPDATES !== "undefined" ? UPDATES.ENTRIES : []).map((e) => e.id)
    );

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
    if (typeof ADMIN_CONFIG === "undefined") return false;
    return Boolean(ADMIN_CONFIG.passphraseHash || ADMIN_CONFIG.passphrase);
  },

  isAuthenticated() {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  },

  async login(passphrase) {
    if (!this.isAdminEnabled()) return false;

    if (ADMIN_CONFIG.passphraseHash) {
      const hash = await this.hashPassphrase(passphrase);
      if (hash !== ADMIN_CONFIG.passphraseHash) return false;
    } else if (passphrase !== ADMIN_CONFIG.passphrase) {
      return false;
    }

    sessionStorage.setItem(SESSION_KEY, "1");
    return true;
  },

  logout() {
    sessionStorage.removeItem(SESSION_KEY);
    this.remoteEntries = null;
    this.remoteSite = null;
    this.useGitHub = false;
  },

  canUseGitHub() {
    return GitHubSync.isConfigured();
  },

  isGitHubReady() {
    return this.canUseGitHub() && GitHubSync.hasToken();
  },

  async enableGitHubSync() {
    if (!this.isGitHubReady()) {
      this.useGitHub = false;
      return false;
    }

    const { parsed } = await GitHubSync.fetchUpdatesFile();
    this.remoteSite = parsed.site;
    this.remoteEntries = parsed.entries;
    this.useGitHub = true;
    return true;
  },

  async publishToGitHub(message) {
    const entries = this.exportEntries();
    const site = this.getSite();
    await GitHubSync.publishUpdates(site, entries, message);
    this.clearLocalDrafts();
    return true;
  },

  clearLocalDrafts() {
    localStorage.removeItem(STORAGE_KEY);
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
