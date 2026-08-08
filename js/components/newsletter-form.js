window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.NewsletterForm = function NewsletterForm(props = {}) {
  const {
    id = "newsletter-form",
    variant = "stack",
    showWhatsapp = false,
    submitLabel = "Subscribe",
    heading = "",
    resourceId = "",
  } = props;

  const waField = showWhatsapp
    ? `
      <div class="form-row">
        <label for="${id}-wa">WhatsApp (optional)</label>
        <input id="${id}-wa" name="whatsapp" type="tel" autocomplete="tel" placeholder="+91…" />
      </div>
    `
    : "";

  if (variant === "inline") {
    return `
      <form class="newsletter-form newsletter-form--inline form" data-newsletter-form data-resource-id="${DW.escapeHtml(resourceId)}" id="${id}" novalidate>
        ${heading ? `<p style="grid-column:1/-1;margin:0 0 .5rem;font-weight:600">${DW.escapeHtml(heading)}</p>` : ""}
        <div class="form-row">
          <label class="sr-only" for="${id}-email">Email</label>
          <input id="${id}-email" name="email" type="email" required placeholder="Email address" autocomplete="email" />
        </div>
        <button class="btn btn--gold" type="submit">${DW.escapeHtml(submitLabel)}</button>
        <p class="form-status" data-form-status style="grid-column:1/-1" role="status"></p>
      </form>
    `;
  }

  return `
    <form class="newsletter-form form" data-newsletter-form data-resource-id="${DW.escapeHtml(resourceId)}" id="${id}" novalidate>
      ${heading ? `<h3 style="margin:0 0 var(--space-3);font-size:var(--fs-lg)">${DW.escapeHtml(heading)}</h3>` : ""}
      <div class="form-row">
        <label for="${id}-email">Email</label>
        <input id="${id}-email" name="email" type="email" required placeholder="you@email.com" autocomplete="email" />
      </div>
      ${waField}
      <button class="btn btn--gold" type="submit">${DW.escapeHtml(submitLabel)}</button>
      <p class="form-status" data-form-status role="status"></p>
    </form>
  `;
};

DW.components.initNewsletterForms = function initNewsletterForms(root = document) {
  root.querySelectorAll("[data-newsletter-form]").forEach((form) => {
    if (form.dataset.bound === "true") return;
    form.dataset.bound = "true";
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = form.querySelector("[data-form-status]");
      const fd = new FormData(form);
      const email = String(fd.get("email") || "").trim();
      if (!email) {
        if (status) {
          status.textContent = "Please enter a valid email.";
          status.className = "form-status is-error";
        }
        return;
      }

      const resourceId = form.dataset.resourceId || "";
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      if (status) {
        status.textContent = "Saving…";
        status.className = "form-status";
      }

      try {
        const result = await DW.forms.submitLead({
          type: "newsletter",
          email,
          whatsapp: String(fd.get("whatsapp") || "").trim(),
          resourceId,
          page: location.pathname,
          source: resourceId ? "resource-gate" : "newsletter",
        });

        if (!result.ok) throw new Error("Submit failed");

        if (status) {
          status.textContent = resourceId
            ? "You're in — your download will start shortly."
            : "Thank you — you're subscribed.";
          status.className = "form-status is-success";
        }
        form.reset();

        if (resourceId && typeof DW.unlockResource === "function") {
          DW.unlockResource(resourceId);
        }

        form.dispatchEvent(
          new CustomEvent("dw:newsletter-success", {
            bubbles: true,
            detail: { email, resourceId },
          })
        );
      } catch (err) {
        console.error(err);
        if (status) {
          status.textContent = "Something went wrong. Please try again.";
          status.className = "form-status is-error";
        }
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  });
};
