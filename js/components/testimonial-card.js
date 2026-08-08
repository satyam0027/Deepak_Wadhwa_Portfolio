window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.TestimonialCard = function TestimonialCard(item = {}) {
  const isCase = item.type === "case-study";
  const initial = (item.name || "DW").trim().charAt(0).toUpperCase();
  const photo = item.photo
    ? `<img class="testimonial-card__photo" src="${DW.href(item.photo)}" alt="" />`
    : `<div class="testimonial-card__photo testimonial-card__photo--initial" aria-hidden="true">${DW.escapeHtml(initial)}</div>`;

  const body = isCase
    ? `
      <div class="testimonial-card__journey">
        <div class="journey-step"><strong>Before</strong><p>${DW.escapeHtml(item.before || "")}</p></div>
        <div class="journey-step"><strong>Learning</strong><p>${DW.escapeHtml(item.learning || "")}</p></div>
        <div class="journey-step"><strong>After</strong><p>${DW.escapeHtml(item.after || "")}</p></div>
      </div>
    `
    : `<blockquote class="testimonial-card__quote">“${DW.escapeHtml(item.quote || "")}”</blockquote>`;

  return `
    <article class="testimonial-card stagger-item">
      ${body}
      <div class="testimonial-card__person">
        ${photo}
        <div>
          <p class="testimonial-card__name">${DW.escapeHtml(item.name || "")}</p>
          <p class="testimonial-card__role">${DW.escapeHtml(item.role || "")}</p>
          ${item.resultSummary ? `<p class="testimonial-card__result">${DW.escapeHtml(item.resultSummary)}</p>` : ""}
        </div>
      </div>
    </article>
  `;
};
