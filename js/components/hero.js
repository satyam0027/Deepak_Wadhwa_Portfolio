window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.Hero = function Hero(props = {}) {
  const {
    eyebrow = "",
    title = "",
    tagline = "",
    lead = "",
    primaryCta,
    secondaryCta,
    mediaHtml = "",
    statsHtml = "",
    compact = false,
    backgroundVideo = "",
    portrait = "",
    portraitAlt = "",
  } = props;

  const resolveCtaHref = (href = "") => {
    if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return href;
    }
    return DW.href(href);
  };

  const ctas = [
    primaryCta
      ? `<a class="btn btn--gold" href="${resolveCtaHref(primaryCta.href)}" ${primaryCta.href?.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${DW.escapeHtml(primaryCta.label)}</a>`
      : "",
    secondaryCta
      ? `<a class="btn btn--ghost" href="${resolveCtaHref(secondaryCta.href)}" ${secondaryCta.href?.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${DW.escapeHtml(secondaryCta.label)}</a>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  const videoBg = backgroundVideo
    ? `
      <div class="hero__video" aria-hidden="true">
        <video
          class="hero__video-el"
          data-lazy
          muted
          loop
          playsinline
          preload="none"
          disablePictureInPicture
        >
          <source data-src="${DW.href(backgroundVideo)}" type="video/mp4" />
        </video>
      </div>
    `
    : "";

  const portraitSrc = portrait
    ? portrait.startsWith("http")
      ? portrait
      : DW.href(portrait)
    : "";

  const portraitHtml = portraitSrc
    ? `
      <div class="hero__portrait" data-hero-step="3" aria-hidden="false">
        <div class="hero__portrait-glow" aria-hidden="true"></div>
        <div class="hero__portrait-ring">
          <img
            class="hero__portrait-img"
            src="${DW.escapeHtml(portraitSrc)}"
            alt="${DW.escapeHtml(portraitAlt || title || "")}"
            width="480"
            height="480"
            decoding="async"
            fetchpriority="high"
          />
        </div>
      </div>
    `
    : mediaHtml
      ? `<div class="hero__media" data-hero-step="4">${mediaHtml}</div>`
      : "";

  return `
    <section class="hero ${compact ? "hero--compact" : ""} ${backgroundVideo ? "hero--video" : ""} ${portraitSrc ? "hero--portrait" : ""}" data-section="hero" data-hero-entrance>
      ${videoBg}
      <div class="container hero__inner">
        <div class="hero__copy">
          ${eyebrow ? `<p class="hero__eyebrow" data-hero-step="0">${DW.escapeHtml(eyebrow)}</p>` : ""}
          <h1 data-hero-step="1">${DW.escapeHtml(title)}</h1>
          ${tagline ? `<p class="hero__tagline" data-hero-step="2">${DW.escapeHtml(tagline)}</p>` : ""}
          ${lead ? `<p class="hero__lead" data-hero-step="3">${DW.escapeHtml(lead)}</p>` : ""}
          ${ctas ? `<div class="btn-group" data-hero-step="4">${ctas}</div>` : ""}
          ${statsHtml ? `<div class="hero__stats" data-hero-step="5">${statsHtml}</div>` : ""}
        </div>
        ${portraitHtml}
      </div>
    </section>
  `;
};
