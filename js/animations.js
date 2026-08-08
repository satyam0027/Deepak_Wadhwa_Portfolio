/** @deprecated Use js/scroll-animations.js — kept as a thin alias. */
(function () {
  if (typeof DW !== "undefined" && typeof DW.initScrollAnimations === "function") return;
  // If scroll-animations failed to load, no-op safely
  window.DW = window.DW || {};
  DW.initScrollAnimations = DW.initScrollAnimations || function () {};
  DW.initMotion = DW.initMotion || function () {};
})();
