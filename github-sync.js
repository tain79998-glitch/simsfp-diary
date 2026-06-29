const GITHUB_TOKEN_KEY = "simsfp-diary-github-token";

const GitHubSync = {
  getConfig() {
    return typeof ADMIN_CONFIG !== "undefined" ? ADMIN_CONFIG.github : null;
  },

  isConfigured() {
    const config = this.getConfig();
    return Boolean(config?.owner && config?.repo && config?.branch);
  },

  hasToken() {
    return Boolean(localStorage.getItem(GITHUB_TOKEN_KEY));
  },

  getToken() {
    return localStorage.getItem(GITHUB_TOKEN_KEY) || "";
  },

  saveToken(token) {
    const trimmed = token.trim();
    if (!trimmed) {
      localStorage.removeItem(GITHUB_TOKEN_KEY);
      return;
    }
    localStorage.setItem(GITHUB_TOKEN_KEY, trimmed);
  },

  getUpdatesPath() {
    return this.getConfig()?.updatesPath || "updates.js";
  },

  async fetchUpdatesFile() {
    const config = this.getConfig();
    if (!config) throw new Error("GitHub 設定がありません。");

    const path = this.getUpdatesPath();
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`;
    const response = await fetch(url, {
      headers: this.buildHeaders(),
    });

    if (!response.ok) {
      throw new Error(`GitHub からの取得に失敗しました（${response.status}）`);
    }

    const payload = await response.json();
    const text = this.decodeBase64Utf8(payload.content);
    return {
      sha: payload.sha,
      parsed: UpdatesBuilder.parse(text),
    };
  },

  async publishUpdates(site, entries, message) {
    const config = this.getConfig();
    if (!config) throw new Error("GitHub 設定がありません。");
    if (!this.hasToken()) throw new Error("GitHub トークンが未設定です。");

    const path = this.getUpdatesPath();
    const content = UpdatesBuilder.serialize(site, entries);
    const encoded = btoa(unescape(encodeURIComponent(content)));

    let sha;
    try {
      const current = await this.fetchUpdatesFile();
      sha = current.sha;
    } catch {
      sha = undefined;
    }

    const body = {
      message: message || "Update articles from admin",
      content: encoded,
      branch: config.branch,
    };
    if (sha) body.sha = sha;

    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        ...this.buildHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `GitHub への公開に失敗しました（${response.status}）`);
    }

    return response.json();
  },

  buildHeaders() {
    const headers = {
      Accept: "application/vnd.github+json",
    };
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  },

  decodeBase64Utf8(base64) {
    const binary = atob(base64.replace(/\n/g, ""));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  },
};
