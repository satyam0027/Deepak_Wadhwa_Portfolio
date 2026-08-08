window.DW = window.DW || {};
DW.pages = DW.pages || {};

DW.pages["success-stories"] = async function successStoriesPage() {
  const { testimonials } = await DW.loadPageData(["testimonials"]);
  const stories = testimonials?.testimonials || [];
  const main = document.querySelector("[data-page-main]");
  if (!main) return;

  main.innerHTML = `
    ${DW.components.Hero({
      compact: true,
      eyebrow: "Success stories",
      title: "Real People. Real Learning. Real Transformation.",
      lead: "Case studies — where someone was, what they learned, and what changed.",
    })}
    <section class="section section--soft">
      <div class="container">
        ${DW.components.SectionHeader({ eyebrow: "Featured", title: "Video testimonial", subheading: "A featured learner story will appear here." })}
        <div class="hero__media" style="min-height:16rem" data-animate><span class="card-media-label">Video story</span></div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="card-grid card-grid--2" data-stories-grid>
          ${stories.map(DW.components.TestimonialCard).join("")}
        </div>
        <div style="margin-top:var(--space-6);text-align:center">
          <button type="button" class="btn btn--ghost" data-load-more>View all stories</button>
        </div>
      </div>
    </section>
    ${DW.components.CTASection({
      title: "Start your own learning path",
      cta: { label: "Explore Programs", href: "/programs/" },
    })}
  `;
};
