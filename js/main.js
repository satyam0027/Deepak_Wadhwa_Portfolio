window.DW = window.DW || {};
DW.pages = DW.pages || {};

document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page || "home";

  if (typeof DW.components?.mountShell === "function") {
    await DW.components.mountShell();
  }

  if (DW.pages && typeof DW.pages[page] === "function") {
    await DW.pages[page]();
  }

  if (typeof DW.components?.initNewsletterForms === "function") {
    DW.components.initNewsletterForms();
  }
  if (typeof DW.components?.initContactForms === "function") {
    DW.components.initContactForms();
  }

  // Shared motion layer (hero load, scroll reveal, count-up, carousel, marquee, FAQ)
  if (typeof DW.initMotion === "function") {
    DW.initMotion(document);
  } else if (typeof DW.initScrollAnimations === "function") {
    DW.initScrollAnimations();
    if (typeof DW.initCountUp === "function") DW.initCountUp();
  }

  // Heavy media after first paint
  if (typeof DW.initDeferredVideos === "function") {
    DW.initDeferredVideos(document);
  }
});
