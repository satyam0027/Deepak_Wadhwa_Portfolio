window.DW = window.DW || {};
DW.pages = DW.pages || {};

DW.pages["program-detail"] = async function programDetailPage() {
  const slug = document.body.dataset.programSlug;
  const { programs } = await DW.loadPageData(["programs"]);
  const program = (programs?.programs || []).find((p) => p.slug === slug);
  const main = document.querySelector("[data-page-main]");
  if (!main) return;

  if (!program) {
    main.innerHTML = `<section class="section"><div class="container"><h1>Program not found</h1></div></section>`;
    return;
  }

  const faq = (program.faq || [])
    .map(
      (item) => `
      <details>
        <summary>${DW.escapeHtml(item.question || "")}</summary>
        <p>${DW.escapeHtml(item.answer || "")}</p>
      </details>`
    )
    .join("");

  const curriculum = (program.curriculum || [])
    .map(
      (mod) => `
      <article class="program-card" data-animate>
        <span class="tag">Module ${DW.escapeHtml(String(mod.module || ""))}</span>
        <h3>${DW.escapeHtml(mod.title || "")}</h3>
        <p>${DW.escapeHtml((mod.topics || []).join(" · "))}</p>
      </article>`
    )
    .join("");

  const listOrFallback = (items, fallback) =>
    (items && items.length ? items : [fallback])
      .map((x) => `<li data-animate style="margin-bottom:.5rem">• ${DW.escapeHtml(x)}</li>`)
      .join("");

  main.innerHTML = `
    ${DW.components.Hero({
      compact: true,
      eyebrow: "Program",
      title: program.title,
      tagline: program.tagline || "",
      lead: program.description || "",
      primaryCta: { label: "Enquire", href: "/contact/?intent=Learn" },
      secondaryCta: { label: "All programs", href: "/programs/" },
    })}
    <section class="section"><div class="container">
      ${DW.components.SectionHeader({ title: "Who it's for" })}
      <ul>${listOrFallback(program.whoItsFor, "Learners seeking structured education in this area.")}</ul>
    </div></section>
    <section class="section section--soft"><div class="container">
      ${DW.components.SectionHeader({ title: "What you'll learn" })}
      <ul>${listOrFallback(program.whatYoullLearn, "Core frameworks and practical application.")}</ul>
    </div></section>
    <section class="section"><div class="container">
      ${DW.components.SectionHeader({ title: "Duration" })}
      <p data-animate>${DW.escapeHtml(program.duration || "Flexible pacing — details shared on enquiry.")}</p>
    </div></section>
    <section class="section section--soft"><div class="container">
      ${DW.components.SectionHeader({ title: "Curriculum" })}
      <div class="card-grid card-grid--2">${curriculum || "<p>Curriculum modules will be listed here.</p>"}</div>
    </div></section>
    <section class="section"><div class="container">
      ${DW.components.SectionHeader({ title: "Learning format" })}
      <p data-animate>${DW.escapeHtml((program.learningFormat || []).join(" · ") || "Live sessions, recordings, and practice.")}</p>
    </div></section>
    <section class="section section--soft"><div class="container">
      ${DW.components.SectionHeader({ title: "Outcome" })}
      <ul>${listOrFallback(program.outcomes, "Clearer process and stronger educational foundations.")}</ul>
    </div></section>
    <section class="section"><div class="container">
      ${DW.components.SectionHeader({ title: "FAQ" })}
      <div class="faq">${faq || "<p>More questions? Reach out via the contact page.</p>"}</div>
    </div></section>
    ${DW.components.CTASection({
      title: `Interested in ${program.title}?`,
      text: "Educational enquiry only — no promises of returns.",
      cta: { label: "Enquire now", href: "/contact/?intent=Learn" },
    })}
  `;
};
