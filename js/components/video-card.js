window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.VideoCard = function VideoCard(video = {}) {
  const href = video.url || "#";
  const external = href.startsWith("http");
  const thumb = video.thumbnail || "";
  const thumbSrc = thumb.startsWith("http") ? thumb : thumb ? DW.href(thumb) : "";
  return `
    <article class="video-card stagger-item" data-source="${DW.escapeHtml(video.source || "")}">
      <a class="video-card__media" href="${href}" ${external ? 'target="_blank" rel="noopener"' : ""}>
        ${thumbSrc ? `<img src="${DW.escapeHtml(thumbSrc)}" alt="" loading="lazy" decoding="async" />` : `<span class="card-media-label">${DW.escapeHtml(video.source || "Video")}</span>`}
        <span class="video-card__play" aria-hidden="true"><span class="video-card__play-icon">▶</span></span>
      </a>
      <div class="video-card__body">
        <span class="tag">${DW.escapeHtml(video.source || "Video")}</span>
        <h3><a href="${href}" ${external ? 'target="_blank" rel="noopener"' : ""}>${DW.escapeHtml(video.title || "")}</a></h3>
        <p class="video-card__meta">${DW.escapeHtml(video.duration || "")}${video.date ? " · " + DW.escapeHtml(DW.formatDate(video.date)) : ""}</p>
      </div>
    </article>
  `;
};
