window.DW = window.DW || {};
DW.pages = DW.pages || {};

DW.pages.insights = async function insightsPage() {
  const { articles } = await DW.loadPageData(["articles"]);
  const cats = articles?.categories || [];
  const list = articles?.articles || [];
  const main = document.querySelector("[data-page-main]");
  if (!main) return;

  main.innerHTML = `
    ${DW.components.Hero({
      compact: true,
      eyebrow: "DW Insights",
      title: "DW Insights",
      lead: "Educational articles on markets, risk, psychology, and wealth creation — built for trust and search.",
    })}
    <section class="section">
      <div class="container">
        <div style="display:flex;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;align-items:center">
          <div class="filter-tabs" data-insight-filters>
            <button type="button" class="is-active" data-cat="all">All</button>
            ${cats.map((c) => `<button type="button" data-cat="${DW.escapeHtml(c)}">${DW.escapeHtml(c)}</button>`).join("")}
          </div>
          <input type="search" data-insight-search placeholder="Search insights…" style="margin-left:auto;padding:.7rem .9rem;border:1px solid var(--color-border);border-radius:var(--radius);min-width:12rem" />
        </div>
        <div class="card-grid card-grid--3" data-insight-grid>
          ${list.map(DW.components.ArticleCard).join("")}
        </div>
      </div>
    </section>
    ${DW.components.CTASection({
      title: "Get insights in your inbox",
      cta: { label: "Join newsletter", href: "/resources/" },
    })}
  `;

  const grid = main.querySelector("[data-insight-grid]");
  const search = main.querySelector("[data-insight-search]");
  let activeCat = "all";

  const render = () => {
    const q = (search.value || "").toLowerCase();
    const filtered = list.filter((a) => {
      const catOk = activeCat === "all" || a.category === activeCat;
      const text = `${a.title} ${a.excerpt}`.toLowerCase();
      return catOk && (!q || text.includes(q));
    });
    grid.innerHTML = filtered.map(DW.components.ArticleCard).join("") || "<p>No articles match.</p>";
    if (typeof DW.refreshAnimations === "function") DW.refreshAnimations(grid);
    else if (typeof DW.initScrollAnimations === "function") DW.initScrollAnimations(grid);
  };

  main.querySelectorAll("[data-insight-filters] button").forEach((btn) => {
    btn.addEventListener("click", () => {
      main.querySelectorAll("[data-insight-filters] button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeCat = btn.dataset.cat;
      render();
    });
  });
  search.addEventListener("input", render);
};
