window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.ArticleCard = function ArticleCard(article = {}) {
  const href = DW.href(article.href || `/insights/${article.slug}/`);
  return `
    <article class="article-card stagger-item" data-category="${DW.escapeHtml(article.category || "")}">
      <a href="${href}" class="article-card__media" tabindex="-1" aria-hidden="true">
        ${article.thumbnail ? `<img src="${article.thumbnail.startsWith("http") ? DW.escapeHtml(article.thumbnail) : DW.href(article.thumbnail)}" alt="${DW.escapeHtml(article.title || "")}" loading="lazy" decoding="async" />` : `<span class="card-media-label">${DW.escapeHtml(article.category || "Insight")}</span>`}
      </a>
      <div class="article-card__body">
        <span class="tag">${DW.escapeHtml(article.category || "Insight")}</span>
        <h3><a href="${href}">${DW.escapeHtml(article.title || "")}</a></h3>
        <p class="article-card__excerpt">${DW.escapeHtml(article.excerpt || "")}</p>
        <p class="article-card__meta">${DW.escapeHtml(article.readTime || "")} · ${DW.escapeHtml(DW.formatDate(article.date))}</p>
      </div>
    </article>
  `;
};
