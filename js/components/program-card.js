window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.ProgramCard = function ProgramCard(program = {}) {
  const href = program.comingSoon ? "#" : DW.href(program.href || `/programs/${program.slug}/`);
  const cta = program.comingSoon ? "Coming Soon" : "View Program";
  const initial = (program.title || "P").charAt(0);
  const image = program.image || "";
  const imageSrc = image.startsWith("http") ? image : image ? DW.href(image) : "";

  const media = imageSrc
    ? `<div class="program-card__media"><img src="${DW.escapeHtml(imageSrc)}" alt="${DW.escapeHtml(program.title || "")}" loading="lazy" decoding="async" /></div>`
    : `<div class="program-card__icon" aria-hidden="true">${DW.escapeHtml(initial)}</div>`;

  return `
    <article class="program-card stagger-item" data-level="${DW.escapeHtml((program.levels || [program.level]).join(","))}">
      ${media}
      <div>
        <span class="tag tag--gold">${DW.escapeHtml(program.level || "All Levels")}</span>
      </div>
      <h3>${DW.escapeHtml(program.title || "")}</h3>
      <p>${DW.escapeHtml(program.tagline || program.description || "")}</p>
      <div class="program-card__meta">
        <a class="btn btn--ghost" href="${href}" ${program.comingSoon ? 'aria-disabled="true"' : ""}>${cta}</a>
      </div>
    </article>
  `;
};

DW.components.renderProgramGrid = function renderProgramGrid(programs = [], options = {}) {
  const { level = "all" } = options;
  const filtered = programs.filter((p) => {
    if (level === "all") return true;
    const levels = p.levels || [p.level];
    return levels.some((l) => String(l).toLowerCase() === level.toLowerCase());
  });
  return `<div class="card-grid card-grid--3" data-animate="stagger" data-stagger-delay="80">${filtered.map(DW.components.ProgramCard).join("")}</div>`;
};
