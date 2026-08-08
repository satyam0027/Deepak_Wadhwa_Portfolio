/**
 * Shell mount — Navbar + Footer on every page.
 */
window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.mountShell = async function mountShell() {
  let site = null;
  try {
    site = await DW.fetchData("site");
  } catch (err) {
    console.warn("[DW] site.json unavailable", err);
  }

  const navHost = document.querySelector("[data-component='navbar']");
  const footerHost = document.querySelector("[data-component='footer']");

  if (navHost && !navHost.dataset.mounted) {
    navHost.innerHTML = DW.components.Navbar();
    navHost.dataset.mounted = "true";
    DW.components.initNavbar(navHost);
  }

  if (footerHost && !footerHost.dataset.mounted) {
    footerHost.innerHTML = DW.components.Footer(site || {});
    footerHost.dataset.mounted = "true";
    DW.components.initNewsletterForms(footerHost);
  }

  // Mount any standalone CTA placeholders that declare data-cta-props via page JS
  document.querySelectorAll("[data-component='cta-section']:empty").forEach((el) => {
    el.outerHTML = DW.components.CTASection({
      title: el.dataset.title || "Ready to start learning?",
      text: el.dataset.text || "Explore programs, free resources, or join the educational community.",
      cta: {
        label: el.dataset.ctaLabel || "Explore Programs",
        href: el.dataset.ctaHref || "/programs/",
      },
    });
  });
};
