window.DW = window.DW || {};
DW.pages = DW.pages || {};

DW.pages.community = async function communityPage() {
  const main = document.querySelector("[data-page-main]");
  if (!main) return;

  const channels = [
    { title: "WhatsApp", text: "Educational updates and community access." },
    { title: "Telegram", text: "Market learning discussions and session notes." },
    { title: "Newsletter", text: "Practical frameworks in your inbox." },
    { title: "Live Sessions", text: "Scheduled learning conversations — education first." },
  ];

  const why = [
    "Market Learning",
    "Educational Content",
    "Live Discussions",
    "Updates",
    "Community Access",
  ];

  main.innerHTML = `
    ${DW.components.Hero({
      compact: true,
      eyebrow: "Community",
      title: "Learn Together. Grow Together.",
      lead: "An educational community for market learning — not tips, not signals, not guarantees.",
      primaryCta: { label: "Join now", href: "/contact/?intent=Learn" },
    })}
    <section class="section">
      <div class="container">
        ${DW.components.SectionHeader({ title: "Channels", center: true })}
        <div class="card-grid card-grid--4">
          ${channels
            .map(
              (c) => `
            <article class="program-card" data-animate>
              <h3>${c.title}</h3>
              <p>${c.text}</p>
            </article>`
            )
            .join("")}
        </div>
      </div>
    </section>
    <section class="section section--soft">
      <div class="container">
        ${DW.components.SectionHeader({ title: "Why join?", center: true })}
        <ul style="max-width:32rem;margin:0 auto">
          ${why.map((w) => `<li data-animate style="padding:.65rem 0;border-bottom:1px solid var(--color-border)">✓ ${w}</li>`).join("")}
        </ul>
      </div>
    </section>
    ${DW.components.CTASection({
      title: "Ready to learn with the community?",
      text: "Educational access only. No trading tips. No signal services. No guaranteed returns.",
      cta: { label: "JOIN NOW", href: "/contact/?intent=Learn" },
    })}
  `;
};
