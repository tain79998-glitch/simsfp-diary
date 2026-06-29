const AdminApp = {
  els: {},

  async init() {
    if (!DataStore.isAdminEnabled()) {
      document.getElementById("login-screen").innerHTML =
        '<div class="login-card"><p class="admin-login-error">admin-config.js が未設定です。<br>README を参照してセットアップしてください。</p><a href="index.html" class="login-back-link">← 公開サイトへ</a></div>';
      return;
    }

    this.cacheElements();
    this.bindEvents();
    this.updateAuthUI();

    if (DataStore.isAuthenticated()) {
      await this.bootstrapAfterLogin();
      this.handleRoute();
    }
  },

  cacheElements() {
    this.els = {
      loginScreen: document.getElementById("login-screen"),
      adminApp: document.getElementById("admin-app"),
      loginForm: document.getElementById("admin-login-form"),
      loginError: document.getElementById("admin-login-error"),
      adminListView: document.getElementById("admin-list-view"),
      adminArticleList: document.getElementById("admin-article-list"),
      adminEmptyMessage: document.getElementById("admin-empty-message"),
      editorView: document.getElementById("editor-view"),
      editorForm: document.getElementById("editor-form"),
      editorHeading: document.getElementById("editor-heading"),
      editorCancel: document.getElementById("editor-cancel-btn"),
      editorDelete: document.getElementById("editor-delete-btn"),
      sectionsRoot: document.getElementById("editor-sections"),
      screenshotsRoot: document.getElementById("editor-screenshots"),
      addSection: document.getElementById("add-section-btn"),
      addScreenshot: document.getElementById("add-screenshot-btn"),
      adminNew: document.getElementById("admin-new-btn"),
      adminPublish: document.getElementById("admin-publish-btn"),
      adminGithub: document.getElementById("admin-github-btn"),
      adminLogout: document.getElementById("admin-logout-btn"),
      exportBtn: document.getElementById("admin-export-btn"),
      githubSetupPanel: document.getElementById("github-setup-panel"),
      githubTokenInput: document.getElementById("github-token-input"),
      githubTokenSave: document.getElementById("github-token-save-btn"),
      githubTokenClear: document.getElementById("github-token-clear-btn"),
      githubSetupError: document.getElementById("github-setup-error"),
      syncStatus: document.getElementById("admin-sync-status"),
    };
  },

  bindEvents() {
    const { els } = this;

    els.loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = els.loginForm.querySelector('input[name="passphrase"]');
      if (await DataStore.login(input.value)) {
        input.value = "";
        els.loginError.classList.add("hidden");
        this.updateAuthUI();
        await this.bootstrapAfterLogin();
        this.showList();
      } else {
        els.loginError.classList.remove("hidden");
      }
    });

    els.adminLogout.addEventListener("click", () => {
      DataStore.logout();
      this.updateAuthUI();
      this.updateSyncUI();
      location.hash = "";
    });

    els.adminGithub.addEventListener("click", () => this.toggleGitHubSetup());
    els.githubTokenSave.addEventListener("click", () => this.saveGitHubToken());
    els.githubTokenClear.addEventListener("click", () => this.clearGitHubToken());
    els.adminPublish.addEventListener("click", () => this.publishToGitHub());

    els.adminNew.addEventListener("click", () => this.showEditor("new"));
    els.editorCancel.addEventListener("click", () => {
      location.hash = "";
    });
    els.editorDelete.addEventListener("click", () => this.confirmDelete());
    els.addSection.addEventListener("click", () => this.addSectionBlock());
    els.addScreenshot.addEventListener("click", () => this.addScreenshotBlock());
    els.exportBtn.addEventListener("click", () => this.exportData());

    els.editorForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveForm();
    });

    els.sectionsRoot.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove-section]");
      if (btn) btn.closest(".editor-block").remove();
    });

    els.screenshotsRoot.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove-screenshot]");
      if (btn) btn.closest(".editor-block").remove();
    });

    window.addEventListener("hashchange", () => this.handleRoute());
  },

  updateAuthUI() {
    const authed = DataStore.isAuthenticated();
    this.els.loginScreen.classList.toggle("hidden", authed);
    this.els.adminApp.classList.toggle("hidden", !authed);
    if (authed) {
      document.getElementById("admin-site-title").textContent = DataStore.getSite().title;
    }
  },

  async bootstrapAfterLogin() {
    this.updateSyncUI();

    if (!DataStore.canUseGitHub()) return;

    if (!DataStore.isGitHubReady()) {
      this.showGitHubSetup(true);
      return;
    }

    try {
      await DataStore.enableGitHubSync();
      this.showGitHubSetup(false);
      this.updateSyncUI();
    } catch (error) {
      this.showGitHubSetup(true);
      this.setGitHubError(error.message);
    }
  },

  updateSyncUI() {
    const { els } = this;
    const canUseGitHub = DataStore.canUseGitHub();
    const ready = DataStore.useGitHub;

    els.adminPublish.classList.toggle("hidden", ready || !canUseGitHub);
    els.syncStatus.classList.toggle("hidden", !canUseGitHub);

    if (!canUseGitHub) return;

    if (ready) {
      els.syncStatus.textContent = "GitHub 連携中 — 保存すると公開サイトに自動反映されます。";
      els.syncStatus.className = "admin-sync-status is-online";
      return;
    }

    if (DataStore.isGitHubReady()) {
      els.syncStatus.textContent = "GitHub トークンは保存済みです。連携を完了してください。";
    } else {
      els.syncStatus.textContent = "GitHub 未連携 — 別端末から編集するにはトークン設定が必要です。";
    }
    els.syncStatus.className = "admin-sync-status";
  },

  showGitHubSetup(show) {
    this.els.githubSetupPanel.classList.toggle("hidden", !show);
    if (show && GitHubSync.hasToken()) {
      this.els.githubTokenInput.value = GitHubSync.getToken();
    }
  },

  toggleGitHubSetup() {
    this.els.githubSetupPanel.classList.toggle("hidden");
    if (!this.els.githubSetupPanel.classList.contains("hidden") && GitHubSync.hasToken()) {
      this.els.githubTokenInput.value = GitHubSync.getToken();
    }
  },

  setGitHubError(message) {
    if (!message) {
      this.els.githubSetupError.classList.add("hidden");
      this.els.githubSetupError.textContent = "";
      return;
    }
    this.els.githubSetupError.textContent = message;
    this.els.githubSetupError.classList.remove("hidden");
  },

  async saveGitHubToken() {
    const token = this.els.githubTokenInput.value.trim();
    if (!token) {
      this.setGitHubError("トークンを入力してください。");
      return;
    }

    GitHubSync.saveToken(token);
    this.setGitHubError("");

    try {
      await DataStore.enableGitHubSync();
      this.showGitHubSetup(false);
      this.updateSyncUI();
      this.renderAdminList();
      alert("GitHub 連携が完了しました。");
    } catch (error) {
      GitHubSync.saveToken("");
      this.setGitHubError(error.message);
    }
  },

  clearGitHubToken() {
    GitHubSync.saveToken("");
    DataStore.useGitHub = false;
    DataStore.remoteEntries = null;
    DataStore.remoteSite = null;
    this.els.githubTokenInput.value = "";
    this.setGitHubError("");
    this.updateSyncUI();
    this.showGitHubSetup(true);
  },

  async publishToGitHub(message) {
    if (!DataStore.isGitHubReady()) {
      alert("先に GitHub 連携を設定してください。");
      this.showGitHubSetup(true);
      return;
    }

    if (!DataStore.useGitHub) {
      try {
        await DataStore.enableGitHubSync();
      } catch (error) {
        alert(error.message);
        return;
      }
    }

    try {
      await DataStore.publishToGitHub(message || "Update articles from admin");
      await DataStore.enableGitHubSync();
      this.updateSyncUI();
      this.renderAdminList();
      alert("GitHub に公開しました。数分後に公開サイトへ反映されます。");
    } catch (error) {
      alert(error.message);
    }
  },

  handleRoute() {
    if (!DataStore.isAuthenticated()) return;

    const hash = location.hash.replace(/^#\/?/, "");
    if (hash.startsWith("edit/")) {
      const id = hash.slice(5);
      this.showEditor(id === "new" ? "new" : id);
      return;
    }

    this.showList();
  },

  showList() {
    this.els.editorView.classList.add("hidden");
    this.els.adminListView.classList.remove("hidden");
    document.title = `管理画面 | ${DataStore.getSite().title}`;
    this.renderAdminList();
  },

  renderAdminList() {
    const entries = DataStore.getAdminEntries();
    this.els.adminArticleList.innerHTML = "";

    if (!entries.length) {
      this.els.adminEmptyMessage.classList.remove("hidden");
      return;
    }

    this.els.adminEmptyMessage.classList.add("hidden");

    entries.forEach((entry) => {
      const card = document.createElement("article");
      card.className = "admin-article-card" + (entry.draft ? " is-draft" : "");

      const sourceBadge =
        entry._source === "local"
          ? '<span class="draft-badge">未公開</span>'
          : "";

      card.innerHTML = `
        <div class="admin-article-card-main">
          <div class="article-card-meta">
            <time datetime="${Common.escapeAttr(entry.date)}">${Common.formatDate(entry.date)}</time>
            <span>${Common.escapeHtml(entry.version)}</span>
            ${entry.draft ? '<span class="draft-badge">下書き</span>' : ""}
            ${sourceBadge}
          </div>
          <h3 class="article-card-title">${Common.escapeHtml(entry.title)}</h3>
          <p class="article-card-summary">${Common.escapeHtml(entry.summary)}</p>
        </div>
        <div class="admin-article-card-actions">
          <button type="button" class="admin-bar-btn" data-edit="${Common.escapeAttr(entry.id)}">編集</button>
          <button type="button" class="admin-bar-btn admin-bar-btn-danger" data-delete="${Common.escapeAttr(entry.id)}">削除</button>
        </div>
      `;

      card.querySelector("[data-edit]").addEventListener("click", () => {
        location.hash = `#/edit/${entry.id}`;
      });

      card.querySelector("[data-delete]").addEventListener("click", async () => {
        if (confirm(`「${entry.title}」を削除しますか？`)) {
          DataStore.deleteEntry(entry.id);
          if (DataStore.useGitHub) {
            await this.publishToGitHub(`Delete: ${entry.title}`);
            return;
          }
        }
      });

      this.els.adminArticleList.appendChild(card);
    });
  },

  showEditor(idOrNew) {
    const entry =
      idOrNew === "new"
        ? DataStore.createEmptyEntry()
        : DataStore.getEntry(idOrNew) || DataStore.createEmptyEntry();

    this.els.editorHeading.textContent =
      idOrNew === "new" && !entry.title ? "新規投稿" : "記事を編集";

    const form = this.els.editorForm;
    form.elements.id.value = entry.id;
    form.elements.date.value = entry.date;
    form.elements.version.value = entry.version;
    form.elements.title.value = entry.title;
    form.elements.summary.value = entry.summary;
    form.elements.draft.checked = Boolean(entry.draft);
    form.elements.officialText.value = entry.official?.text || "";
    form.elements.officialUrl.value = entry.official?.url || "";
    form.elements.officialLabel.value = entry.official?.label || "公式告知を見る";
    form.elements.verifiedIntro.value = entry.verified?.intro || "";
    form.elements.conclusion.value = entry.conclusion || "";

    this.renderSectionBlocks(entry.verified?.sections || []);
    this.renderScreenshotBlocks(entry.screenshots || []);

    const isNew = entry.id.startsWith("entry-") && !entry.title;
    this.els.editorDelete.classList.toggle("hidden", isNew);

    this.els.adminListView.classList.add("hidden");
    this.els.editorView.classList.remove("hidden");
    document.title = `${this.els.editorHeading.textContent} | 管理画面`;
    window.scrollTo(0, 0);
  },

  renderSectionBlocks(sections) {
    this.els.sectionsRoot.innerHTML = "";
    if (!sections.length) {
      this.addSectionBlock();
      return;
    }
    sections.forEach((section) => this.addSectionBlock(section));
  },

  addSectionBlock(section = { heading: "", items: [""] }) {
    const block = document.createElement("div");
    block.className = "editor-block";

    let type = "items";
    let content = (section.items || []).join("\n");
    if (section.steps?.length) {
      type = "steps";
      content = section.steps.join("\n");
    } else if (section.body) {
      type = "body";
      content = section.body;
    }

    block.innerHTML = `
      <div class="editor-row">
        <label class="editor-label">見出し</label>
        <input class="editor-input" type="text" data-field="heading" value="${Common.escapeAttr(section.heading || "")}">
      </div>
      <div class="editor-row">
        <label class="editor-label">形式</label>
        <select class="editor-input" data-field="type">
          <option value="items" ${type === "items" ? "selected" : ""}>箇条書き</option>
          <option value="steps" ${type === "steps" ? "selected" : ""}>手順</option>
          <option value="body" ${type === "body" ? "selected" : ""}>段落</option>
        </select>
      </div>
      <div class="editor-row">
        <label class="editor-label">内容（1行1項目）</label>
        <textarea class="editor-textarea" rows="4" data-field="content">${Common.escapeHtml(content)}</textarea>
      </div>
      <button type="button" class="editor-remove-btn" data-remove-section>このセクションを削除</button>
    `;
    this.els.sectionsRoot.appendChild(block);
  },

  renderScreenshotBlocks(screenshots) {
    this.els.screenshotsRoot.innerHTML = "";
    if (!screenshots.length) {
      this.addScreenshotBlock();
      return;
    }
    screenshots.forEach((shot) => this.addScreenshotBlock(shot));
  },

  addScreenshotBlock(shot = { src: "", alt: "", caption: "" }) {
    const block = document.createElement("div");
    block.className = "editor-block";
    block.innerHTML = `
      <div class="editor-row">
        <label class="editor-label">画像パス</label>
        <input class="editor-input" type="text" data-field="src" placeholder="images/example.png" value="${Common.escapeAttr(shot.src || "")}">
      </div>
      <div class="editor-row">
        <label class="editor-label">代替テキスト</label>
        <input class="editor-input" type="text" data-field="alt" value="${Common.escapeAttr(shot.alt || "")}">
      </div>
      <div class="editor-row">
        <label class="editor-label">キャプション</label>
        <input class="editor-input" type="text" data-field="caption" value="${Common.escapeAttr(shot.caption || "")}">
      </div>
      <button type="button" class="editor-remove-btn" data-remove-screenshot>このスクショを削除</button>
    `;
    this.els.screenshotsRoot.appendChild(block);
  },

  collectSections() {
    return [...this.els.sectionsRoot.querySelectorAll(".editor-block")]
      .map((block) => {
        const heading = block.querySelector('[data-field="heading"]').value.trim();
        const type = block.querySelector('[data-field="type"]').value;
        const content = block.querySelector('[data-field="content"]').value.trim();
        const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);

        if (type === "steps") return { heading, steps: lines };
        if (type === "body") return { heading, body: content };
        return { heading, items: lines };
      })
      .filter(
        (section) =>
          section.heading || section.items?.length || section.steps?.length || section.body
      );
  },

  collectScreenshots() {
    return [...this.els.screenshotsRoot.querySelectorAll(".editor-block")]
      .map((block) => ({
        src: block.querySelector('[data-field="src"]').value.trim(),
        alt: block.querySelector('[data-field="alt"]').value.trim(),
        caption: block.querySelector('[data-field="caption"]').value.trim(),
      }))
      .filter((shot) => shot.src);
  },

  async saveForm() {
    const form = this.els.editorForm;
    const entry = {
      id: form.elements.id.value.trim(),
      draft: form.elements.draft.checked,
      date: form.elements.date.value,
      version: form.elements.version.value.trim(),
      title: form.elements.title.value.trim(),
      summary: form.elements.summary.value.trim(),
      official: {
        text: form.elements.officialText.value.trim(),
        url: form.elements.officialUrl.value.trim(),
        label: form.elements.officialLabel.value.trim() || "公式告知を見る",
      },
      verified: {
        intro: form.elements.verifiedIntro.value.trim(),
        sections: this.collectSections(),
      },
      screenshots: this.collectScreenshots(),
      conclusion: form.elements.conclusion.value.trim(),
    };

    if (!entry.title || !entry.date) {
      alert("タイトルと更新日は必須です。");
      return;
    }

    DataStore.saveEntry(entry);

    if (DataStore.useGitHub) {
      try {
        await this.publishToGitHub(`Update: ${entry.title}`);
      } catch (error) {
        alert(`保存しましたが公開に失敗しました: ${error.message}`);
      }
    }

    location.hash = "";
  },

  async confirmDelete() {
    const id = this.els.editorForm.elements.id.value;
    if (!confirm("この記事を削除しますか？")) return;
    const entry = DataStore.getEntry(id);
    DataStore.deleteEntry(id);
    if (DataStore.useGitHub) {
      await this.publishToGitHub(`Delete: ${entry?.title || id}`);
      location.hash = "";
      return;
    }
    location.hash = "";
  },

  exportData() {
    const entries = DataStore.exportEntries();
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "simsfp-diary-export.json";
    a.click();
    URL.revokeObjectURL(url);
  },
};

document.addEventListener("DOMContentLoaded", () => AdminApp.init());
