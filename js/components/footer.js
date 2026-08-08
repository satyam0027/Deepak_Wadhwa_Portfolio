window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.Footer = function Footer(site = {}) {
  const brand = site.brand || DW.config.brand;
  const contact = site.contact || {};
  const social = site.social || {};

  const socialLinks = [
    ["YouTube", social.youtube],
    ["Instagram", social.instagram],
    ["LinkedIn", social.linkedin],
    ["X", social.twitter],
    ["Telegram", social.telegram],
  ]
    .map(
      ([label, href]) =>
        `<a href="${href || "#"}" ${href && href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${label}</a>`
    )
    .join("");

  const newsletter = DW.components.NewsletterForm({
    id: "footer-newsletter",
    variant: "inline",
    submitLabel: "Join",
    heading: "Get practical learning updates",
  });

  return `
    <footer class="site-footer" data-footer>
      <div class="container footer__grid">
        <div class="footer-brand">
          <a class="logo" href="${DW.href("/")}">${DW.escapeHtml(brand.shortName || "DW")}<span>.</span></a>
          <p>${DW.escapeHtml(brand.description || "Financial educator and mentor — authority through education, not hype.")}</p>
        </div>
        <div class="footer-contact">
          <p style="font-weight:700;color:#fff;margin-bottom:.5rem">Contact</p>
          <p><a href="mailto:${DW.escapeHtml((contact.email || "").replace(/<!--.*?-->/g, "").trim())}">${DW.escapeHtml(contact.email || "hello@example.com")}</a></p>
          <p>${DW.escapeHtml(contact.phone || "")}</p>
          <div class="footer-social" style="margin-top:1rem" aria-label="Social links">${socialLinks}</div>
        </div>
        <nav class="footer-links" aria-label="Footer">
          <p style="font-weight:700;color:#fff;margin-bottom:.5rem">Quick links</p>
          <ul>
            <li><a href="${DW.href("/programs/")}">Programs</a></li>
            <li><a href="${DW.href("/about/")}">About</a></li>
            <li><a href="${DW.href("/insights/")}">Insights</a></li>
            <li><a href="${DW.href("/success-stories/")}">Success Stories</a></li>
            <li><a href="${DW.href("/contact/")}">Contact / Legal</a></li>
          </ul>
        </nav>
        <div class="footer-newsletter">${newsletter}</div>
      </div>
      <div class="container footer__bottom">
        <p>© ${new Date().getFullYear()} ${DW.escapeHtml(brand.name || "Deepak Wadhwa")}. Educational content only — not financial advice or performance guarantees.</p>
      </div>
    </footer>
  `;
};
