/**
 * Lead capture — EmailJS and/or Google Apps Script webhook.
 * Configure keys in data/site.json → forms.
 */
window.DW = window.DW || {};

DW.forms = {
  siteConfig: null,

  async loadConfig() {
    if (this.siteConfig) return this.siteConfig;
    try {
      this.siteConfig = await DW.fetchData("site");
    } catch {
      this.siteConfig = { forms: {} };
    }
    return this.siteConfig;
  },

  isConfigured(forms = {}) {
    const ej = forms.emailjs || {};
    const hasEmailJs =
      ej.publicKey &&
      !String(ej.publicKey).includes("TODO") &&
      ej.publicKey !== "";
    const hasGas =
      forms.googleAppsScriptWebhook &&
      !String(forms.googleAppsScriptWebhook).includes("TODO");
    return { hasEmailJs, hasGas };
  },

  async ensureEmailJs(publicKey) {
    if (window.emailjs) {
      emailjs.init({ publicKey });
      return true;
    }
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
    emailjs.init({ publicKey });
    return true;
  },

  async submitLead(payload) {
    const site = await this.loadConfig();
    const forms = site.forms || {};
    const { hasEmailJs, hasGas } = this.isConfigured(forms);
    const results = [];

    if (hasGas) {
      const res = await fetch(forms.googleAppsScriptWebhook, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, submittedAt: new Date().toISOString() }),
      });
      results.push({ channel: "gas", ok: res.ok });
    }

    if (hasEmailJs) {
      const ej = forms.emailjs;
      await this.ensureEmailJs(ej.publicKey);
      const serviceId =
        payload.type === "contact" ? ej.contactServiceId : ej.newsletterServiceId;
      const templateId =
        payload.type === "contact" ? ej.contactTemplateId : ej.newsletterTemplateId;
      if (serviceId && templateId && !String(serviceId).includes("TODO")) {
        await emailjs.send(serviceId, templateId, payload);
        results.push({ channel: "emailjs", ok: true });
      }
    }

    if (!results.length) {
      // Dev fallback so UX works before credentials are wired
      console.info("[DW forms] Lead captured (dev mode — no backend configured)", payload);
      const key = "dw_leads";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push({ ...payload, submittedAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(existing));
      return { ok: true, mode: "local" };
    }

    const ok = results.some((r) => r.ok);
    return { ok, mode: "remote", results };
  },
};
