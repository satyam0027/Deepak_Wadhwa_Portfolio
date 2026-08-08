window.DW = window.DW || {};
DW.pages = DW.pages || {};

DW.pages.media = async function mediaPage() {
  const data = await DW.loadPageData(["videos", "media-mentions"]);
  const videos = data.videos?.videos || [];
  const sources = data.videos?.sources || [];
  const featured = videos.find((v) => v.featured) || videos[0];
  const main = document.querySelector("[data-page-main]");
  if (!main) return;

  main.innerHTML = `
    ${DW.components.Hero({
      compact: true,
      eyebrow: "Videos & Media",
      title: featured ? featured.title : "Videos & Media",
      lead: "YouTube, podcasts, interviews, TV, and webinars — educational appearances.",
      primaryCta: featured?.url
        ? { label: "Watch featured", href: featured.url }
        : { label: "Contact for media", href: "/contact/?intent=Media" },
      mediaHtml: '<span class="card-media-label">Featured video</span>',
    })}
    <section class="section">
      <div class="container">
        <div class="filter-tabs" data-video-filters>
          <button type="button" class="is-active" data-source="all">All</button>
          ${sources.map((s) => `<button type="button" data-source="${DW.escapeHtml(s)}">${DW.escapeHtml(s)}</button>`).join("")}
        </div>
        <div class="card-grid card-grid--3" data-video-grid>
          ${videos.map(DW.components.VideoCard).join("")}
        </div>
        <div style="margin-top:var(--space-6);text-align:center">
          <button type="button" class="btn btn--ghost" data-watch-more>Watch more</button>
        </div>
      </div>
    </section>
    <section class="section section--soft">
      <div class="container">
        ${DW.components.SectionHeader({ title: "Featured in", center: true })}
        ${DW.components.MediaLogoStrip((data["media-mentions"] && data["media-mentions"].mentions) || [])}
      </div>
    </section>
    ${DW.components.CTASection({
      title: "Media or speaking enquiry?",
      cta: { label: "Contact", href: "/contact/?intent=Media" },
    })}
  `;

  const grid = main.querySelector("[data-video-grid]");
  main.querySelectorAll("[data-video-filters] button").forEach((btn) => {
    btn.addEventListener("click", () => {
      main.querySelectorAll("[data-video-filters] button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const source = btn.dataset.source;
      const filtered = source === "all" ? videos : videos.filter((v) => v.source === source);
      grid.innerHTML = filtered.map(DW.components.VideoCard).join("");
      if (typeof DW.refreshAnimations === "function") DW.refreshAnimations(grid);
      else if (typeof DW.initScrollAnimations === "function") DW.initScrollAnimations(grid);
    });
  });
};
