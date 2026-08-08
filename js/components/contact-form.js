window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.ContactForm = function ContactForm(props = {}) {
  const intents = props.intents || [
    "Learn",
    "Workshop",
    "Business",
    "Media",
    "Speaking",
    "Partnership",
  ];
  const selected = props.selectedIntent || intents[0];

  const pills = intents
    .map(
      (intent) => `
      <label>
        <input type="radio" name="intent" value="${DW.escapeHtml(intent)}" ${
        intent === selected ? "checked" : ""
      } />
        <span>${DW.escapeHtml(intent)}</span>
      </label>
    `
    )
    .join("");

  return `
    <form class="contact-form form" data-contact-form novalidate>
      <div class="form-row">
        <span style="font-weight:600;color:var(--color-navy)">What would you like to do?</span>
        <div class="intent-pills">${pills}</div>
      </div>
      <div class="form-row">
        <label for="contact-name">Name</label>
        <input id="contact-name" name="name" type="text" required autocomplete="name" />
      </div>
      <div class="form-row">
        <label for="contact-email">Email</label>
        <input id="contact-email" name="email" type="email" required autocomplete="email" />
      </div>
      <div class="form-row">
        <label for="contact-phone">Phone</label>
        <input id="contact-phone" name="phone" type="tel" autocomplete="tel" />
      </div>
      <div class="form-row">
        <label for="contact-message">Message</label>
        <textarea id="contact-message" name="message" required></textarea>
      </div>
      <button class="btn btn--primary" type="submit">Submit</button>
      <p class="form-status" data-form-status role="status"></p>
    </form>
  `;
};

DW.components.initContactForms = function initContactForms(root = document) {
  root.querySelectorAll("[data-contact-form]").forEach((form) => {
    if (form.dataset.bound === "true") return;
    form.dataset.bound = "true";
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = form.querySelector("[data-form-status]");
      const fd = new FormData(form);
      const payload = {
        type: "contact",
        name: String(fd.get("name") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        phone: String(fd.get("phone") || "").trim(),
        message: String(fd.get("message") || "").trim(),
        intent: String(fd.get("intent") || "").trim(),
        page: location.pathname,
      };

      if (!payload.name || !payload.email || !payload.message) {
        if (status) {
          status.textContent = "Please fill in name, email, and message.";
          status.className = "form-status is-error";
        }
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      if (status) {
        status.textContent = "Sending…";
        status.className = "form-status";
      }

      try {
        const result = await DW.forms.submitLead(payload);
        if (!result.ok) throw new Error("Submit failed");
        if (status) {
          status.textContent = "Thank you — we’ll be in touch shortly.";
          status.className = "form-status is-success";
        }
        form.reset();
        const intentInput = form.querySelector(`input[name="intent"][value="${payload.intent}"]`);
        if (intentInput) intentInput.checked = true;
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
