window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.CTASection = function CTASection(props = {}) {
  const {
    title = "Take the next step",
    text = "",
    cta = { label: "Get in touch", href: "/contact/" },
  } = props;

  return `
    <section class="cta-section" data-component="cta-section" data-animate="fade-up">
      <div class="container">
        <h2>${DW.escapeHtml(title)}</h2>
        ${text ? `<p>${DW.escapeHtml(text)}</p>` : ""}
        <a class="btn btn--gold" href="${DW.href(cta.href)}">${DW.escapeHtml(cta.label)}</a>
      </div>
    </section>
  `;
};
