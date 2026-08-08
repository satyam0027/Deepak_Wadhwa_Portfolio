window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.Navbar = function Navbar() {
  const primary = DW.config.navPrimary
    .map(
      (item) =>
        `<li><a href="${DW.href(item.href)}" data-nav-link="${item.href}">${DW.escapeHtml(item.label)}</a></li>`
    )
    .join("");
  const secondary = DW.config.navSecondary
    .map(
      (item) =>
        `<li><a href="${DW.href(item.href)}" data-nav-link="${item.href}">${DW.escapeHtml(item.label)}</a></li>`
    )
    .join("");

  return `
    <header class="site-header" data-nav>
      <div class="site-header__inner">
        <a class="logo" href="${DW.href("/")}">${DW.escapeHtml(DW.config.brand.shortName)}<span>.</span></a>

        <div class="nav-cluster">
          <nav class="nav-primary" aria-label="Primary"><ul>${primary}</ul></nav>
          <nav class="nav-secondary" aria-label="Secondary"><ul>${secondary}</ul></nav>
        </div>

        <a class="nav-cta nav-cta--desktop" href="${DW.href(DW.config.cta.href)}">${DW.escapeHtml(DW.config.cta.label)}</a>

        <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="mobile-nav" data-nav-toggle>
          <span class="sr-only">Menu</span>
          <span class="nav-toggle__bar" data-bar="1"></span>
          <span class="nav-toggle__bar" data-bar="2"></span>
          <span class="nav-toggle__bar" data-bar="3"></span>
        </button>
      </div>

      <div id="mobile-nav" class="nav-mobile" data-nav-mobile aria-hidden="true">
        <nav aria-label="Mobile">
          <ul>
            ${primary}
            ${secondary}
          </ul>
        </nav>
        <a class="nav-cta" href="${DW.href(DW.config.cta.href)}">${DW.escapeHtml(DW.config.cta.label)}</a>
      </div>
    </header>
  `;
};

DW.components.initNavbar = function initNavbar(root = document) {
  const header = root.querySelector("[data-nav]");
  if (!header) return;

  const toggle = header.querySelector("[data-nav-toggle]");
  const mobile = header.querySelector("[data-nav-mobile]");
  const hasHero = Boolean(document.querySelector(".hero"));

  if (hasHero) header.classList.add("is-over-hero");
  else header.classList.add("is-solid");

  let scrollTick = null;
  const onScroll = () => {
    if (scrollTick) return;
    scrollTick = window.requestAnimationFrame(() => {
      header.classList.toggle("is-scrolled", window.scrollY > 60);
      scrollTick = null;
    });
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenuOpen = (open) => {
    if (!toggle || !mobile) return;
    toggle.setAttribute("aria-expanded", String(open));
    mobile.classList.toggle("is-open", open);
    mobile.setAttribute("aria-hidden", String(!open));
    header.classList.toggle("is-menu-open", open);
    document.body.classList.toggle("nav-open", open);
  };

  if (toggle && mobile) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!open);
    });

    mobile.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    });
  }

  const path = location.pathname.replace(/index\.html$/, "").replace(/\/$/, "") || "/";
  header.querySelectorAll("[data-nav-link]").forEach((link) => {
    const href = (link.getAttribute("data-nav-link") || "").replace(/\/$/, "") || "/";
    const current = path === "" || path === "/" ? "/" : path;
    if (href === "/" && current === "/") link.classList.add("is-active");
    else if (href !== "/" && current.includes(href.replace(/^\//, ""))) link.classList.add("is-active");
  });
};
