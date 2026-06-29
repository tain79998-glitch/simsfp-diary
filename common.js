const Common = {
  formatDate(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return `${y}年${m}月${d}日`;
  },

  escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  },

  escapeAttr(text) {
    return this.escapeHtml(text).replace(/'/g, "&#39;");
  },

  renderSection(section) {
    const heading = `<h2>${this.escapeHtml(section.heading)}</h2>`;

    if (section.items?.length) {
      const items = section.items.map((item) => `<li>${this.escapeHtml(item)}</li>`).join("");
      return `<section class="article-section">${heading}<ul>${items}</ul></section>`;
    }

    if (section.steps?.length) {
      const steps = section.steps.map((step) => `<li>${this.escapeHtml(step)}</li>`).join("");
      return `<section class="article-section">${heading}<ol>${steps}</ol></section>`;
    }

    if (section.body) {
      return `<section class="article-section">${heading}<p>${this.escapeHtml(section.body)}</p></section>`;
    }

    return `<section class="article-section">${heading}</section>`;
  },

  renderScreenshots(screenshots) {
    if (!screenshots?.length) return "";

    const items = screenshots
      .map(
        (shot) => `
        <figure class="screenshot-item">
          <img src="${this.escapeAttr(shot.src)}" alt="${this.escapeAttr(shot.alt || "")}" loading="lazy">
          ${shot.caption ? `<figcaption class="screenshot-caption">${this.escapeHtml(shot.caption)}</figcaption>` : ""}
        </figure>
      `
      )
      .join("");

    return `
      <section class="article-section">
        <h2>スクショ</h2>
        <div class="screenshot-grid">${items}</div>
      </section>
    `;
  },

  renderArticleBody(entry) {
    const verifiedSections = (entry.verified?.sections || [])
      .map((section) => this.renderSection(section))
      .join("");
    const intro = entry.verified?.intro ? `<p>${this.escapeHtml(entry.verified.intro)}</p>` : "";

    return `
      <header class="article-header">
        <div class="article-meta">
          <time datetime="${this.escapeAttr(entry.date)}">${this.formatDate(entry.date)}</time>
          <span>${this.escapeHtml(entry.version)}</span>
        </div>
        <h1 class="article-title">${this.escapeHtml(entry.title)}</h1>
      </header>

      <section class="article-section">
        <h2>公式サマリ</h2>
        <div class="official-box">
          <p>${this.escapeHtml(entry.official?.text || "")}</p>
          ${
            entry.official?.url
              ? `<a class="official-link" href="${this.escapeAttr(entry.official.url)}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(entry.official.label || "公式告知を見る")}</a>`
              : ""
          }
        </div>
      </section>

      <section class="article-section">
        <h2>実際に確認したこと</h2>
        ${intro}
        ${verifiedSections}
      </section>

      ${this.renderScreenshots(entry.screenshots)}

      ${
        entry.conclusion
          ? `<section class="article-section"><h2>まとめ</h2><div class="conclusion-box"><p>${this.escapeHtml(entry.conclusion)}</p></div></section>`
          : ""
      }
    `;
  },
};
