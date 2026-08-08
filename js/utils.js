window.DW = window.DW || {};

DW.escapeHtml = function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

DW.formatDate = function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
};

DW.getQueryParam = function getQueryParam(key) {
  return new URLSearchParams(location.search).get(key);
};

DW.mount = function mount(selector, html) {
  const el = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!el) return null;
  el.innerHTML = html;
  return el;
};
