window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.SectionHeader = function SectionHeader(props = {}) {
  const { eyebrow = "", title = "", subheading = "", center = false } = props;
  return `
    <header class="section-header ${center ? "section-header--center" : ""}" data-animate="fade-up">
      ${eyebrow ? `<p class="section-header__eyebrow">${DW.escapeHtml(eyebrow)}</p>` : ""}
      <h2>${DW.escapeHtml(title)}</h2>
      ${subheading ? `<p class="section-header__sub">${DW.escapeHtml(subheading)}</p>` : ""}
    </header>
  `;
};
