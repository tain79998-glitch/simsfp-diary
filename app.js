const PublicApp = {
  init() {
    this.cacheElements();
    this.initSiteMeta();
    this.initStickyBackLink();
    this.bindEvents();
    this.handleRoute();
  },

  cacheElements() {
    this.listView = document.getElementById("list-view");
    this.detailView = document.getElementById("detail-view");
    this.articleList = document.getElementById("article-list");
    this.articleDetail = document.getElementById("article-detail");
    this.emptyMessage = document.getElementById("empty-message");
    this.backLink = document.getElementById("back-link");
    this.homeLink = document.getElementById("home-link");
    this.backLinkSentinel = document.querySelector(".back-link-sentinel");
  },

  bindEvents() {
    this.homeLink.addEventListener("click", (e) => {
      e.preventDefault();
      location.hash = "";
    });

    this.backLink.addEventListener("click", (e) => {
      e.preventDefault();
      location.hash = "";
    });

    window.addEventListener("hashchange", () => this.handleRoute());
  },

  renderList() {
    const entries = PublicStore.getEntries();
    this.articleList.innerHTML = "";

    if (!entries.length) {
      this.emptyMessage.classList.remove("hidden");
      return;
    }

    this.emptyMessage.classList.add("hidden");

    entries.forEach((entry) => {
      const card = document.createElement("a");
      card.className = "article-card";
      card.href = `#/${entry.id}`;
      card.innerHTML = `
        <div class="article-card-meta">
          <time datetime="${Common.escapeAttr(entry.date)}">${Common.formatDate(entry.date)}</time>
          <span>${Common.escapeHtml(entry.version)}</span>
        </div>
        <h2 class="article-card-title">${Common.escapeHtml(entry.title)}</h2>
        <p class="article-card-summary">${Common.escapeHtml(entry.summary)}</p>
      `;
      this.articleList.appendChild(card);
    });
  },

  renderDetail(id) {
    const entry = PublicStore.getEntry(id);
    if (!entry) {
      this.showList();
      return;
    }

    this.articleDetail.innerHTML = Common.renderArticleBody(entry);
    this.listView.classList.add("hidden");
    this.detailView.classList.remove("hidden");
    document.title = `${entry.title} | ${SITE.title}`;
    window.scrollTo(0, 0);
  },

  showList() {
    this.listView.classList.remove("hidden");
    this.detailView.classList.add("hidden");
    document.title = SITE.title;
    this.renderList();
  },

  handleRoute() {
    const hash = location.hash.replace(/^#\/?/, "");
    if (hash) {
      this.renderDetail(hash);
    } else {
      this.showList();
    }
  },

  initSiteMeta() {
    document.title = SITE.title;
    this.homeLink.textContent = SITE.title;
    document.getElementById("site-tagline").textContent = SITE.tagline;
    document.getElementById("footer-name").textContent = SITE.author;
    document.getElementById("footer-year").textContent = new Date().getFullYear();
  },

  initStickyBackLink() {
    if (!this.backLinkSentinel || !window.IntersectionObserver) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        this.backLink.classList.toggle("is-stuck", !entry.isIntersecting);
      },
      { threshold: [1] }
    );
    observer.observe(this.backLinkSentinel);
  },
};

document.addEventListener("DOMContentLoaded", () => PublicApp.init());
