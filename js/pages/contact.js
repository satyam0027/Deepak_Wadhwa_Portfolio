window.DW = window.DW || {};
DW.pages = DW.pages || {};

DW.pages.contact = async function contactPage() {
  const { site } = await DW.loadPageData(["site"]);
  const intents = site?.intents || ["Learn", "Workshop", "Business", "Media", "Speaking", "Partnership"];
  const selected = DW.getQueryParam("intent") || intents[0];
  const contact = site?.contact || {};
  const main = document.querySelector("[data-page-main]");
  if (!main) return;

  main.innerHTML = `
    ${DW.components.Hero({
      compact: true,
      eyebrow: "Contact",
      title: "Let's Connect.",
      lead: "What would you like to do? Pick an intent and send a message.",
    })}
    <section class="section">
      <div class="container" style="display:grid;gap:var(--space-7);grid-template-columns:1fr">
        <div style="max-width:40rem">
          ${DW.components.ContactForm({ intents, selectedIntent: selected })}
        </div>
        <div data-animate>
          ${DW.components.SectionHeader({ title: "Other ways to reach out" })}
          <div class="btn-group">
            <a class="btn btn--ghost" href="${DW.href("/contact/?intent=Learn")}">Book a Call</a>
            <a class="btn btn--ghost" href="${contact.whatsapp && !String(contact.whatsapp).includes("TODO") ? contact.whatsapp : "#"}">WhatsApp</a>
            <a class="btn btn--ghost" href="mailto:${(contact.email || "").replace(/<!--.*?-->/g, "").trim() || "hello@example.com"}">Email</a>
          </div>
        </div>
      </div>
    </section>
  `;

  DW.components.initContactForms(main);
};
