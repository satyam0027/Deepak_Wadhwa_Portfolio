window.DW = window.DW || {};
DW.pages = DW.pages || {};

DW.pages.article = async function articlePage() {
  const slug = document.body.dataset.articleSlug;
  const { articles } = await DW.loadPageData(["articles"]);
  const article = (articles?.articles || []).find((a) => a.slug === slug) || (articles?.articles || [])[0];
  const related = (articles?.articles || []).filter((a) => a.slug !== (article && article.slug)).slice(0, 3);

  if (article) {
    document.title = article.metaTitle || `${article.title} | DW Insights`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && article.metaDescription) desc.setAttribute("content", article.metaDescription);

    const cat = document.querySelector("[data-field='category']");
    if (cat) cat.textContent = article.category || "Insight";

    const h1 = document.querySelector("[data-section='article-header'] h1");
    if (h1) h1.textContent = article.title || "";

    const meta = document.querySelector("[data-field='meta']");
    if (meta) {
      meta.textContent = `${article.readTime || ""} · ${DW.formatDate(article.date)} · ${article.author || "Deepak Wadhwa"}`;
    }

    const body = document.querySelector("[data-section='article-body']");
    if (body && !body.dataset.hydrated) {
      body.dataset.hydrated = "true";
      body.innerHTML = `
        <p>${DW.escapeHtml(article.excerpt || "")}</p>
        <h2>Start with process, not prediction</h2>
        <p>Most learners chase the next idea. Durable progress comes from a routine you can repeat: define risk, write the thesis, review honestly, and improve the process.</p>
        <h2>What to practise this week</h2>
        <p>Pick one framework — risk units, a simple journal, or a weekly review checklist — and run it for five sessions before adding complexity.</p>
        <h3>Remember</h3>
        <p>This is educational content. It is not a tip, signal, or promise of returns.</p>
      `;
    }

    const author = document.querySelector("[data-section='author-box']");
    if (author) {
      author.innerHTML = `
        <div class="program-card" style="margin-top:var(--space-6)">
          <h3>About the author</h3>
          <p><strong>Deepak Wadhwa</strong> — financial educator and mentor focused on process, risk awareness, and practical market learning.</p>
        </div>`;
    }
  }

  const ctaHost = document.querySelector("[data-section='cta']");
  if (ctaHost) {
    ctaHost.outerHTML = DW.components.CTASection({
      title: "Want more practical insights?",
      text: "Browse free resources or join the educational community.",
      cta: { label: "Free Resources", href: "/resources/" },
    });
  }

  const relatedHost = document.querySelector("[data-section='related']");
  if (relatedHost) {
    relatedHost.innerHTML = `
      ${DW.components.SectionHeader({ title: "Related insights" })}
      <div class="card-grid card-grid--3">${related.map(DW.components.ArticleCard).join("")}</div>
    `;
  }
};
