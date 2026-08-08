window.DW = window.DW || {};
DW.pages = DW.pages || {};

DW.pages.events = async function eventsPage() {
  const { events } = await DW.loadPageData(["events"]);
  const list = events?.events || [];
  const upcoming = list.filter((e) => String(e.status).toLowerCase() === "upcoming");
  const past = list.filter((e) => String(e.status).toLowerCase() === "past");
  const main = document.querySelector("[data-page-main]");
  if (!main) return;

  main.innerHTML = `
    ${DW.components.Hero({
      compact: true,
      eyebrow: "Events",
      title: "Learn in session",
      lead: "A light events hub now — ready to grow into workshops, conferences, and a future summit.",
    })}
    <section class="section">
      <div class="container">
        ${DW.components.SectionHeader({ title: "Upcoming", subheading: "Masterclass · Workshop · Webinar" })}
        <div class="card-grid card-grid--2">${upcoming.map(DW.components.EventCard).join("") || "<p>No upcoming events yet.</p>"}</div>
      </div>
    </section>
    <section class="section section--soft">
      <div class="container">
        ${DW.components.SectionHeader({ title: "Past events" })}
        <div class="card-grid card-grid--2">${past.map(DW.components.EventCard).join("") || "<p>Past events will appear here.</p>"}</div>
      </div>
    </section>
    ${DW.components.CTASection({
      title: "Want invitations to the next session?",
      cta: { label: "Join the community", href: "/community/" },
    })}
  `;
};
