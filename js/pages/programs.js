window.DW = window.DW || {};
DW.pages = DW.pages || {};

DW.pages.programs = async function programsPage() {
  const { programs } = await DW.loadPageData(["programs"]);
  const list = programs?.programs || [];
  const main = document.querySelector("[data-page-main]");
  if (!main) return;

  main.innerHTML = `
    ${DW.components.Hero({
      compact: true,
      eyebrow: "Learning",
      title: "Learn. Practice. Improve.",
      lead: "Structured learning programs — modest in scope, serious in craft. Academy framing comes later.",
      primaryCta: { label: "Talk to us", href: "/contact/?intent=Learn" },
    })}
    <section class="section">
      <div class="container">
        <div class="filter-tabs" data-program-filters>
          <button type="button" class="is-active" data-level="all">All</button>
          <button type="button" data-level="Beginner">For Beginners</button>
          <button type="button" data-level="Intermediate">For Intermediate</button>
          <button type="button" data-level="Advanced">For Advanced</button>
        </div>
        <div data-program-grid>${DW.components.renderProgramGrid(list)}</div>
      </div>
    </section>
    ${DW.components.CTASection({
      title: "Not sure where to start?",
      text: "Tell us your learning goal — we’ll point you to the right path.",
      cta: { label: "Get guidance", href: "/contact/?intent=Learn" },
    })}
  `;

  const grid = main.querySelector("[data-program-grid]");
  main.querySelectorAll("[data-program-filters] button").forEach((btn) => {
    btn.addEventListener("click", () => {
      main.querySelectorAll("[data-program-filters] button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      grid.innerHTML = DW.components.renderProgramGrid(list, { level: btn.dataset.level });
      if (typeof DW.refreshAnimations === "function") DW.refreshAnimations(grid);
      else if (typeof DW.initScrollAnimations === "function") DW.initScrollAnimations(grid);
    });
  });
};
