window.DW = window.DW || {};
DW.pages = DW.pages || {};

DW.pages.resources = async function resourcesPage() {
  const { resources } = await DW.loadPageData(["resources"]);
  const list = resources?.resources || [];
  const main = document.querySelector("[data-page-main]");
  if (!main) return;

  main.innerHTML = `
    ${DW.components.Hero({
      compact: true,
      eyebrow: "Free resources",
      title: "Learn for Free. Practical Learning.",
      lead: "Guides, checklists, and reports — unlock with email (WhatsApp optional).",
    })}
    <section class="section">
      <div class="container">
        <div class="card-grid card-grid--3" data-resources-grid>
          ${list.map(DW.components.ResourceCard).join("")}
        </div>
      </div>
    </section>
    ${DW.components.CTASection({
      title: "Want structured learning next?",
      cta: { label: "See Programs", href: "/programs/" },
    })}
  `;

  DW.components.initResourceGate(main);
};
