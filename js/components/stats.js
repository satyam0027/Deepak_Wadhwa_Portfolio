window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.Stats = function Stats(items = [], options = {}) {
  const reveal = options.reveal !== false;
  const cells = items
    .map((item) => {
      const value = Number(item.value) || 0;
      const suffix = item.suffix || "";
      const label = item.label || "";
      return `
        <div class="stat">
          <div class="stat__value" data-count-up data-target="${value}" data-suffix="${DW.escapeHtml(suffix)}">0${DW.escapeHtml(suffix)}</div>
          <div class="stat__label">${DW.escapeHtml(label)}</div>
        </div>
      `;
    })
    .join("");

  const attr = reveal ? ' data-animate="fade-up"' : "";
  return `<div class="stats" data-component="stats"${attr}>${cells}</div>`;
};

DW.components.initStats = function initStats(root = document) {
  if (typeof DW.initCountUp === "function") DW.initCountUp(root);
};
