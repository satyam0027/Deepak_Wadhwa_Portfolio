window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.EventCard = function EventCard(event = {}) {
  const d = event.date ? new Date(event.date) : null;
  const day = d && !Number.isNaN(d.getTime()) ? String(d.getDate()).padStart(2, "0") : "--";
  const month =
    d && !Number.isNaN(d.getTime())
      ? d.toLocaleDateString("en-IN", { month: "short" })
      : "";
  const upcoming = String(event.status).toLowerCase() === "upcoming";
  const ctaHref = upcoming
    ? DW.href(event.registerUrl || "/contact/?intent=Workshop")
    : event.recapUrl
      ? DW.href(event.recapUrl)
      : "";
  const ctaLabel = upcoming ? "Register" : "View Recap";

  return `
    <article class="event-card stagger-item" data-status="${DW.escapeHtml(event.status || "")}">
      <div class="event-card__date">
        <span class="day">${day}</span>
        <span class="month">${DW.escapeHtml(month)}</span>
      </div>
      <div>
        <span class="tag tag--gold">${DW.escapeHtml(event.type || "Event")}</span>
        <span class="tag" style="margin-left:0.35rem">${DW.escapeHtml(event.status || "")}</span>
        <h3 style="margin-top:0.75rem">${DW.escapeHtml(event.title || "")}</h3>
        <p style="color:var(--color-text-muted);font-size:var(--fs-sm);margin:0">
          ${DW.escapeHtml(event.time || "")}${event.location ? " · " + DW.escapeHtml(event.location) : ""}
        </p>
        ${
          ctaHref
            ? `<div class="event-card__actions"><a class="btn btn--ghost" href="${ctaHref}">${ctaLabel}</a></div>`
            : ""
        }
      </div>
    </article>
  `;
};
