/**
 * Gated download: click resource → modal (email/WhatsApp) → unlock fileUrl
 */
window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.ResourceCard = function ResourceCard(resource = {}) {
  return `
    <article class="resource-card stagger-item">
      <div class="resource-card__media">
        ${resource.thumbnail ? `<img src="${resource.thumbnail.startsWith("http") ? DW.escapeHtml(resource.thumbnail) : DW.href(resource.thumbnail)}" alt="${DW.escapeHtml(resource.title || "")}" loading="lazy" decoding="async" />` : `<span class="card-media-label">${DW.escapeHtml(resource.type || "Resource")}</span>`}
      </div>
      <div class="resource-card__body">
        <span class="tag">${DW.escapeHtml(resource.type || "Resource")}</span>
        <h3>${DW.escapeHtml(resource.title || "")}</h3>
        <p class="resource-card__desc">${DW.escapeHtml(resource.description || "")}</p>
        <button
          type="button"
          class="btn btn--primary"
          data-resource-download
          data-resource-id="${DW.escapeHtml(resource.id || "")}"
          data-file-url="${DW.escapeHtml(resource.fileUrl || "")}"
          data-gated="${resource.gated !== false}"
        >Download</button>
      </div>
    </article>
  `;
};

DW.components.ResourceGateModal = function ResourceGateModal() {
  return `
    <div class="modal" data-resource-modal hidden>
      <div class="modal__backdrop" data-modal-close></div>
      <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="resource-gate-title">
        <button type="button" class="modal__close" data-modal-close aria-label="Close">×</button>
        <h2 id="resource-gate-title" style="font-size:var(--fs-xl);margin-bottom:0.5rem">Unlock this resource</h2>
        <p style="color:var(--color-text-muted);margin-bottom:1.25rem">Enter your email to download. Optional WhatsApp for learning updates.</p>
        <div data-resource-form-host></div>
      </div>
    </div>
  `;
};

DW.pendingResource = null;

DW.unlockResource = function unlockResource(resourceId) {
  const pending = DW.pendingResource;
  if (!pending || (resourceId && pending.id !== resourceId)) return;
  const url = pending.fileUrl;
  DW.closeResourceModal();
  if (url) {
    const a = document.createElement("a");
    a.href = DW.href(url);
    a.download = "";
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  DW.pendingResource = null;
};

DW.openResourceModal = function openResourceModal(resource) {
  DW.pendingResource = resource;
  let modal = document.querySelector("[data-resource-modal]");
  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", DW.components.ResourceGateModal());
    modal = document.querySelector("[data-resource-modal]");
  }
  const host = modal.querySelector("[data-resource-form-host]");
  host.innerHTML = DW.components.NewsletterForm({
    id: "resource-gate-form",
    showWhatsapp: true,
    submitLabel: "Unlock download",
    resourceId: resource.id || "",
  });
  DW.components.initNewsletterForms(host);
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add("is-open"));
  document.body.style.overflow = "hidden";
};

DW.closeResourceModal = function closeResourceModal() {
  const modal = document.querySelector("[data-resource-modal]");
  if (!modal) return;
  modal.classList.remove("is-open");
  const finish = () => {
    if (!modal.classList.contains("is-open")) modal.hidden = true;
    modal.removeEventListener("transitionend", finish);
  };
  modal.addEventListener("transitionend", finish);
  setTimeout(finish, 420);
  document.body.style.overflow = "";
};

DW.components.initResourceGate = function initResourceGate(root = document) {
  if (!document.querySelector("[data-resource-modal]")) {
    document.body.insertAdjacentHTML("beforeend", DW.components.ResourceGateModal());
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-modal-close]")) {
      DW.closeResourceModal();
      return;
    }
    const btn = e.target.closest("[data-resource-download]");
    if (!btn || !root.contains(btn)) return;
    const resource = {
      id: btn.dataset.resourceId,
      fileUrl: btn.dataset.fileUrl,
      gated: btn.dataset.gated !== "false",
    };
    if (!resource.gated) {
      DW.pendingResource = resource;
      DW.unlockResource(resource.id);
      return;
    }
    DW.openResourceModal(resource);
  });
};
