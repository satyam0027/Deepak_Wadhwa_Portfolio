window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.MediaLogo = function MediaLogo(mention = {}) {
  const href = mention.url && mention.url !== "#" ? mention.url : "#";
  const content = mention.logo
    ? `<img src="${DW.href(mention.logo)}" alt="${DW.escapeHtml(mention.name || "Media")}" />`
    : `<span>${DW.escapeHtml(mention.name || "Media outlet")}</span>`;

  return `
    <a class="media-logo" href="${href}" ${href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>
      ${content}
    </a>
  `;
};

DW.components.MediaLogoStrip = function MediaLogoStrip(mentions = []) {
  const logos = mentions.map(DW.components.MediaLogo).join("");
  return `
    <div class="marquee" data-marquee>
      <div class="marquee__track media-logo-strip" data-marquee-track>
        ${logos}
      </div>
    </div>
  `;
};
