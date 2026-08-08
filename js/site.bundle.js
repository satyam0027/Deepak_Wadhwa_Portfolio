/* DW site.bundle.js — generated */
/* js/config.js */
/**
 * Site-wide config & path helpers.
 * Prefer http://localhost:5500 (or any static server) — root paths and fetch() need a server.
 * DW.root is computed so nested pages resolve assets correctly.
 */
window.DW = window.DW || {};

(function initRoot() {
  const path = (location.pathname || "/").replace(/\\/g, "/");
  const normalized = path.endsWith(".html")
    ? path.replace(/\/[^/]+\.html$/, "/")
    : path.endsWith("/")
      ? path
      : path + "/";
  const parts = normalized.split("/").filter(Boolean);
  DW.root = parts.length ? parts.map(() => "..").join("/") : "";
  DW.url = function url(pathname) {
    const clean = String(pathname || "").replace(/^\//, "");
    if (!DW.root) return "/" + clean;
    return DW.root + "/" + clean;
  };
  DW.asset = DW.url;
})();

DW.config = {
  get dataPath() {
    return DW.url("data");
  },
  brand: {
    name: "Deepak Wadhwa",
    shortName: "DW",
  },
  navPrimary: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about/" },
    { label: "Programs", href: "/programs/" },
    { label: "Success Stories", href: "/success-stories/" },
  ],
  navSecondary: [
    { label: "Resources", href: "/resources/" },
    { label: "Insights", href: "/insights/" },
    { label: "Media", href: "/media/" },
    { label: "Contact", href: "/contact/" },
  ],
  cta: { label: "JOIN / CONNECT", href: "/community/" },
};

/** Resolve site hrefs for nested pages (keeps pretty URLs on a server). */
DW.href = function href(path) {
  if (!path || path.startsWith("http") || path.startsWith("#") || path.startsWith("mailto") || path.startsWith("tel")) {
    return path;
  }
  return DW.url(path.replace(/^\//, ""));
};

;
/* js/utils.js */
window.DW = window.DW || {};

DW.escapeHtml = function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

DW.formatDate = function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
};

DW.getQueryParam = function getQueryParam(key) {
  return new URLSearchParams(location.search).get(key);
};

DW.mount = function mount(selector, html) {
  const el = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!el) return null;
  el.innerHTML = html;
  return el;
};

;
/* js/data-loader.js */
/**
 * Data loader — pages call DW.loadPageData(keys) to hydrate from JSON.
 * Uses a small in-memory cache so Home's multiple keys don't re-fetch on revisit.
 */
window.DW = window.DW || {};

DW._dataCache = DW._dataCache || Object.create(null);

DW.fetchData = async function fetchData(name) {
  if (DW._dataCache[name]) return DW._dataCache[name];
  const res = await fetch(`${DW.config.dataPath}/${name}.json`, { credentials: "same-origin" });
  if (!res.ok) throw new Error(`Failed to load data/${name}.json`);
  const data = await res.json();
  DW._dataCache[name] = data;
  return data;
};

DW.loadPageData = async function loadPageData(keys) {
  const entries = await Promise.all(
    keys.map(async (key) => {
      try {
        const data = await DW.fetchData(key);
        return [key, data];
      } catch (err) {
        console.warn(`[DW] ${err.message}`);
        return [key, null];
      }
    })
  );
  return Object.fromEntries(entries);
};

;
/* js/forms.js */
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

;
/* js/perf.js */
/**
 * Runtime performance helpers — deferred hero video, connection-aware media.
 */
window.DW = window.DW || {};

DW.shouldLoadHeavyMedia = function shouldLoadHeavyMedia() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn) {
    if (conn.saveData) return false;
    const type = String(conn.effectiveType || "");
    if (type === "slow-2g" || type === "2g") return false;
  }
  return true;
};

/** Load hero background videos after first paint (idle), not during HTML parse. */
DW.initDeferredVideos = function initDeferredVideos(root = document) {
  const videos = root.querySelectorAll("video[data-src], video source[data-src]");
  if (!videos.length && !root.querySelectorAll("video[data-lazy]").length) {
    // also support video[data-lazy] with source children
  }

  const lazyVideos = root.querySelectorAll("video[data-lazy]");
  if (!lazyVideos.length) return;

  const loadOne = (video) => {
    if (video.dataset.loaded === "true") return;
    if (!DW.shouldLoadHeavyMedia()) {
      video.closest(".hero__video")?.classList.add("is-disabled");
      return;
    }
    const src = video.dataset.src;
    if (src) {
      video.src = src;
    }
    video.querySelectorAll("source[data-src]").forEach((source) => {
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
    });
    video.load();
    const play = () => {
      video.classList.add("is-ready");
      video.dataset.loaded = "true";
      video.play().catch(() => {});
    };
    if (video.readyState >= 2) play();
    else video.addEventListener("loadeddata", play, { once: true });
  };

  const schedule = (fn) => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(fn, { timeout: 1800 });
    } else {
      setTimeout(fn, 400);
    }
  };

  lazyVideos.forEach((video) => {
    // Home hero: load after idle. Below-fold compact heroes: IntersectionObserver.
    const hero = video.closest(".hero");
    const isCompact = hero && hero.classList.contains("hero--compact");

    if (!isCompact) {
      schedule(() => loadOne(video));
      return;
    }

    if (!("IntersectionObserver" in window)) {
      schedule(() => loadOne(video));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          schedule(() => loadOne(video));
        });
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(video);
  });
};

;
/* js/components/navbar.js */
window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.Navbar = function Navbar() {
  const primary = DW.config.navPrimary
    .map(
      (item) =>
        `<li><a href="${DW.href(item.href)}" data-nav-link="${item.href}">${DW.escapeHtml(item.label)}</a></li>`
    )
    .join("");
  const secondary = DW.config.navSecondary
    .map(
      (item) =>
        `<li><a href="${DW.href(item.href)}" data-nav-link="${item.href}">${DW.escapeHtml(item.label)}</a></li>`
    )
    .join("");

  return `
    <header class="site-header" data-nav>
      <div class="site-header__inner">
        <a class="logo" href="${DW.href("/")}">${DW.escapeHtml(DW.config.brand.shortName)}<span>.</span></a>

        <div class="nav-cluster">
          <nav class="nav-primary" aria-label="Primary"><ul>${primary}</ul></nav>
          <nav class="nav-secondary" aria-label="Secondary"><ul>${secondary}</ul></nav>
        </div>

        <a class="nav-cta nav-cta--desktop" href="${DW.href(DW.config.cta.href)}">${DW.escapeHtml(DW.config.cta.label)}</a>

        <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="mobile-nav" data-nav-toggle>
          <span class="sr-only">Menu</span>
          <span class="nav-toggle__bar" data-bar="1"></span>
          <span class="nav-toggle__bar" data-bar="2"></span>
          <span class="nav-toggle__bar" data-bar="3"></span>
        </button>
      </div>

      <div id="mobile-nav" class="nav-mobile" data-nav-mobile aria-hidden="true">
        <nav aria-label="Mobile">
          <ul>
            ${primary}
            ${secondary}
          </ul>
        </nav>
        <a class="nav-cta" href="${DW.href(DW.config.cta.href)}">${DW.escapeHtml(DW.config.cta.label)}</a>
      </div>
    </header>
  `;
};

DW.components.initNavbar = function initNavbar(root = document) {
  const header = root.querySelector("[data-nav]");
  if (!header) return;

  const toggle = header.querySelector("[data-nav-toggle]");
  const mobile = header.querySelector("[data-nav-mobile]");
  const hasHero = Boolean(document.querySelector(".hero"));

  if (hasHero) header.classList.add("is-over-hero");
  else header.classList.add("is-solid");

  let scrollTick = null;
  const onScroll = () => {
    if (scrollTick) return;
    scrollTick = window.requestAnimationFrame(() => {
      header.classList.toggle("is-scrolled", window.scrollY > 60);
      scrollTick = null;
    });
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenuOpen = (open) => {
    if (!toggle || !mobile) return;
    toggle.setAttribute("aria-expanded", String(open));
    mobile.classList.toggle("is-open", open);
    mobile.setAttribute("aria-hidden", String(!open));
    header.classList.toggle("is-menu-open", open);
    document.body.classList.toggle("nav-open", open);
  };

  if (toggle && mobile) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!open);
    });

    mobile.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    });
  }

  const path = location.pathname.replace(/index\.html$/, "").replace(/\/$/, "") || "/";
  header.querySelectorAll("[data-nav-link]").forEach((link) => {
    const href = (link.getAttribute("data-nav-link") || "").replace(/\/$/, "") || "/";
    const current = path === "" || path === "/" ? "/" : path;
    if (href === "/" && current === "/") link.classList.add("is-active");
    else if (href !== "/" && current.includes(href.replace(/^\//, ""))) link.classList.add("is-active");
  });
};

;
/* js/components/hero.js */
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

  // data-src only — actual file loads after first paint via DW.initDeferredVideos
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

  return `
    <section class="hero ${compact ? "hero--compact" : ""} ${backgroundVideo ? "hero--video" : ""}" data-section="hero" data-hero-entrance>
      ${videoBg}
      <div class="container hero__inner">
        <div>
          ${eyebrow ? `<p class="hero__eyebrow" data-hero-step="0">${DW.escapeHtml(eyebrow)}</p>` : ""}
          <h1 data-hero-step="1">${DW.escapeHtml(title)}</h1>
          ${tagline ? `<p class="hero__tagline" data-hero-step="2">${DW.escapeHtml(tagline)}</p>` : ""}
          ${lead ? `<p class="hero__lead" data-hero-step="3">${DW.escapeHtml(lead)}</p>` : ""}
          ${ctas ? `<div class="btn-group" data-hero-step="4">${ctas}</div>` : ""}
          ${statsHtml ? `<div class="hero__stats" data-hero-step="5">${statsHtml}</div>` : ""}
        </div>
        ${
          mediaHtml
            ? `<div class="hero__media" data-hero-step="4">${mediaHtml}</div>`
            : ""
        }
      </div>
    </section>
  `;
};

;
/* js/components/section-header.js */
window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.SectionHeader = function SectionHeader(props = {}) {
  const { eyebrow = "", title = "", subheading = "", center = false } = props;
  return `
    <header class="section-header ${center ? "section-header--center" : ""}" data-animate="fade-up">
      ${eyebrow ? `<p class="section-header__eyebrow">${DW.escapeHtml(eyebrow)}</p>` : ""}
      <h2>${DW.escapeHtml(title)}</h2>
      ${subheading ? `<p class="section-header__sub">${DW.escapeHtml(subheading)}</p>` : ""}
    </header>
  `;
};

;
/* js/components/stats.js */
window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.Stats = function Stats(items = [], options = {}) {
  const reveal = options.reveal !== false;
  const cells = items
    .map((item) => {
      const value = Number(item.value) || 0;
      const suffix = item.suffix || "";
      const label = item.label || "";
      return `
        <div class="stat">
          <div class="stat__value" data-count-up data-target="${value}" data-suffix="${DW.escapeHtml(suffix)}">0${DW.escapeHtml(suffix)}</div>
          <div class="stat__label">${DW.escapeHtml(label)}</div>
        </div>
      `;
    })
    .join("");

  const attr = reveal ? ' data-animate="fade-up"' : "";
  return `<div class="stats" data-component="stats"${attr}>${cells}</div>`;
};

DW.components.initStats = function initStats(root = document) {
  if (typeof DW.initCountUp === "function") DW.initCountUp(root);
};

;
/* js/components/program-card.js */
window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.ProgramCard = function ProgramCard(program = {}) {
  const href = program.comingSoon ? "#" : DW.href(program.href || `/programs/${program.slug}/`);
  const cta = program.comingSoon ? "Coming Soon" : "View Program";
  const initial = (program.title || "P").charAt(0);

  return `
    <article class="program-card stagger-item" data-level="${DW.escapeHtml((program.levels || [program.level]).join(","))}">
      <div class="program-card__icon" aria-hidden="true">${DW.escapeHtml(initial)}</div>
      <div>
        <span class="tag tag--gold">${DW.escapeHtml(program.level || "All Levels")}</span>
      </div>
      <h3>${DW.escapeHtml(program.title || "")}</h3>
      <p>${DW.escapeHtml(program.tagline || program.description || "")}</p>
      <div class="program-card__meta">
        <a class="btn btn--ghost" href="${href}" ${program.comingSoon ? 'aria-disabled="true"' : ""}>${cta}</a>
      </div>
    </article>
  `;
};

DW.components.renderProgramGrid = function renderProgramGrid(programs = [], options = {}) {
  const { level = "all" } = options;
  const filtered = programs.filter((p) => {
    if (level === "all") return true;
    const levels = p.levels || [p.level];
    return levels.some((l) => String(l).toLowerCase() === level.toLowerCase());
  });
  return `<div class="card-grid card-grid--3" data-animate="stagger" data-stagger-delay="80">${filtered.map(DW.components.ProgramCard).join("")}</div>`;
};

;
/* js/components/testimonial-card.js */
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

;
/* js/components/article-card.js */
window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.ArticleCard = function ArticleCard(article = {}) {
  const href = DW.href(article.href || `/insights/${article.slug}/`);
  return `
    <article class="article-card stagger-item" data-category="${DW.escapeHtml(article.category || "")}">
      <a href="${href}" class="article-card__media" tabindex="-1" aria-hidden="true">
        ${article.thumbnail ? `<img src="${DW.href(article.thumbnail)}" alt="" />` : `<span class="card-media-label">${DW.escapeHtml(article.category || "Insight")}</span>`}
      </a>
      <div class="article-card__body">
        <span class="tag">${DW.escapeHtml(article.category || "Insight")}</span>
        <h3><a href="${href}">${DW.escapeHtml(article.title || "")}</a></h3>
        <p class="article-card__excerpt">${DW.escapeHtml(article.excerpt || "")}</p>
        <p class="article-card__meta">${DW.escapeHtml(article.readTime || "")} · ${DW.escapeHtml(DW.formatDate(article.date))}</p>
      </div>
    </article>
  `;
};

;
/* js/components/video-card.js */
window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.VideoCard = function VideoCard(video = {}) {
  const href = video.url || "#";
  const external = href.startsWith("http");
  return `
    <article class="video-card stagger-item" data-source="${DW.escapeHtml(video.source || "")}">
      <a class="video-card__media" href="${href}" ${external ? 'target="_blank" rel="noopener"' : ""}>
        ${video.thumbnail ? `<img src="${DW.href(video.thumbnail)}" alt="" />` : `<span class="card-media-label">${DW.escapeHtml(video.source || "Video")}</span>`}
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

;
/* js/components/event-card.js */
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

;
/* js/components/media-logo.js */
window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.MediaLogo = function MediaLogo(mention = {}) {
  const href = mention.url && mention.url !== "#" ? mention.url : "#";
  const content = mention.logo
    ? `<img src="${DW.href(mention.logo)}" alt="${DW.escapeHtml(mention.name || "Media")}" />`
    : `<span>${DW.escapeHtml(mention.name || "Media outlet")}</span>`;

  return `
    <a class="media-logo" href="${href}" ${href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>
      ${content}
    </a>
  `;
};

DW.components.MediaLogoStrip = function MediaLogoStrip(mentions = []) {
  const logos = mentions.map(DW.components.MediaLogo).join("");
  return `
    <div class="marquee" data-marquee>
      <div class="marquee__track media-logo-strip" data-marquee-track>
        ${logos}
      </div>
    </div>
  `;
};

;
/* js/components/cta-section.js */
window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.CTASection = function CTASection(props = {}) {
  const {
    title = "Take the next step",
    text = "",
    cta = { label: "Get in touch", href: "/contact/" },
  } = props;

  return `
    <section class="cta-section" data-component="cta-section" data-animate="fade-up">
      <div class="container">
        <h2>${DW.escapeHtml(title)}</h2>
        ${text ? `<p>${DW.escapeHtml(text)}</p>` : ""}
        <a class="btn btn--gold" href="${DW.href(cta.href)}">${DW.escapeHtml(cta.label)}</a>
      </div>
    </section>
  `;
};

;
/* js/components/newsletter-form.js */
window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.NewsletterForm = function NewsletterForm(props = {}) {
  const {
    id = "newsletter-form",
    variant = "stack",
    showWhatsapp = false,
    submitLabel = "Subscribe",
    heading = "",
    resourceId = "",
  } = props;

  const waField = showWhatsapp
    ? `
      <div class="form-row">
        <label for="${id}-wa">WhatsApp (optional)</label>
        <input id="${id}-wa" name="whatsapp" type="tel" autocomplete="tel" placeholder="+91…" />
      </div>
    `
    : "";

  if (variant === "inline") {
    return `
      <form class="newsletter-form newsletter-form--inline form" data-newsletter-form data-resource-id="${DW.escapeHtml(resourceId)}" id="${id}" novalidate>
        ${heading ? `<p style="grid-column:1/-1;margin:0 0 .5rem;font-weight:600">${DW.escapeHtml(heading)}</p>` : ""}
        <div class="form-row">
          <label class="sr-only" for="${id}-email">Email</label>
          <input id="${id}-email" name="email" type="email" required placeholder="Email address" autocomplete="email" />
        </div>
        <button class="btn btn--gold" type="submit">${DW.escapeHtml(submitLabel)}</button>
        <p class="form-status" data-form-status style="grid-column:1/-1" role="status"></p>
      </form>
    `;
  }

  return `
    <form class="newsletter-form form" data-newsletter-form data-resource-id="${DW.escapeHtml(resourceId)}" id="${id}" novalidate>
      ${heading ? `<h3 style="margin:0 0 var(--space-3);font-size:var(--fs-lg)">${DW.escapeHtml(heading)}</h3>` : ""}
      <div class="form-row">
        <label for="${id}-email">Email</label>
        <input id="${id}-email" name="email" type="email" required placeholder="you@email.com" autocomplete="email" />
      </div>
      ${waField}
      <button class="btn btn--gold" type="submit">${DW.escapeHtml(submitLabel)}</button>
      <p class="form-status" data-form-status role="status"></p>
    </form>
  `;
};

DW.components.initNewsletterForms = function initNewsletterForms(root = document) {
  root.querySelectorAll("[data-newsletter-form]").forEach((form) => {
    if (form.dataset.bound === "true") return;
    form.dataset.bound = "true";
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = form.querySelector("[data-form-status]");
      const fd = new FormData(form);
      const email = String(fd.get("email") || "").trim();
      if (!email) {
        if (status) {
          status.textContent = "Please enter a valid email.";
          status.className = "form-status is-error";
        }
        return;
      }

      const resourceId = form.dataset.resourceId || "";
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      if (status) {
        status.textContent = "Saving…";
        status.className = "form-status";
      }

      try {
        const result = await DW.forms.submitLead({
          type: "newsletter",
          email,
          whatsapp: String(fd.get("whatsapp") || "").trim(),
          resourceId,
          page: location.pathname,
          source: resourceId ? "resource-gate" : "newsletter",
        });

        if (!result.ok) throw new Error("Submit failed");

        if (status) {
          status.textContent = resourceId
            ? "You're in — your download will start shortly."
            : "Thank you — you're subscribed.";
          status.className = "form-status is-success";
        }
        form.reset();

        if (resourceId && typeof DW.unlockResource === "function") {
          DW.unlockResource(resourceId);
        }

        form.dispatchEvent(
          new CustomEvent("dw:newsletter-success", {
            bubbles: true,
            detail: { email, resourceId },
          })
        );
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

;
/* js/components/contact-form.js */
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

;
/* js/components/footer.js */
window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.Footer = function Footer(site = {}) {
  const brand = site.brand || DW.config.brand;
  const contact = site.contact || {};
  const social = site.social || {};

  const socialLinks = [
    ["YouTube", social.youtube],
    ["Instagram", social.instagram],
    ["LinkedIn", social.linkedin],
    ["X", social.twitter],
    ["Telegram", social.telegram],
  ]
    .map(
      ([label, href]) =>
        `<a href="${href || "#"}" ${href && href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${label}</a>`
    )
    .join("");

  const newsletter = DW.components.NewsletterForm({
    id: "footer-newsletter",
    variant: "inline",
    submitLabel: "Join",
    heading: "Get practical learning updates",
  });

  return `
    <footer class="site-footer" data-footer>
      <div class="container footer__grid">
        <div class="footer-brand">
          <a class="logo" href="${DW.href("/")}">${DW.escapeHtml(brand.shortName || "DW")}<span>.</span></a>
          <p>${DW.escapeHtml(brand.description || "Financial educator and mentor — authority through education, not hype.")}</p>
        </div>
        <div class="footer-contact">
          <p style="font-weight:700;color:#fff;margin-bottom:.5rem">Contact</p>
          <p><a href="mailto:${DW.escapeHtml((contact.email || "").replace(/<!--.*?-->/g, "").trim())}">${DW.escapeHtml(contact.email || "hello@example.com")}</a></p>
          <p>${DW.escapeHtml(contact.phone || "")}</p>
          <div class="footer-social" style="margin-top:1rem" aria-label="Social links">${socialLinks}</div>
        </div>
        <nav class="footer-links" aria-label="Footer">
          <p style="font-weight:700;color:#fff;margin-bottom:.5rem">Quick links</p>
          <ul>
            <li><a href="${DW.href("/programs/")}">Programs</a></li>
            <li><a href="${DW.href("/about/")}">About</a></li>
            <li><a href="${DW.href("/insights/")}">Insights</a></li>
            <li><a href="${DW.href("/success-stories/")}">Success Stories</a></li>
            <li><a href="${DW.href("/contact/")}">Contact / Legal</a></li>
          </ul>
        </nav>
        <div class="footer-newsletter">${newsletter}</div>
      </div>
      <div class="container footer__bottom">
        <p>© ${new Date().getFullYear()} ${DW.escapeHtml(brand.name || "Deepak Wadhwa")}. Educational content only — not financial advice or performance guarantees.</p>
      </div>
    </footer>
  `;
};

;
/* js/components/resource-gate.js */
/**
 * Gated download: click resource → modal (email/WhatsApp) → unlock fileUrl
 */
window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.ResourceCard = function ResourceCard(resource = {}) {
  return `
    <article class="resource-card stagger-item">
      <div class="resource-card__media">
        ${resource.thumbnail ? `<img src="${DW.href(resource.thumbnail)}" alt="" />` : `<span class="card-media-label">${DW.escapeHtml(resource.type || "Resource")}</span>`}
      </div>
      <div class="resource-card__body">
        <span class="tag">${DW.escapeHtml(resource.type || "Resource")}</span>
        <h3>${DW.escapeHtml(resource.title || "")}</h3>
        <p class="resource-card__desc">${DW.escapeHtml(resource.description || "")}</p>
        <button
          type="button"
          class="btn btn--primary"
          data-resource-download
          data-resource-id="${DW.escapeHtml(resource.id || "")}"
          data-file-url="${DW.escapeHtml(resource.fileUrl || "")}"
          data-gated="${resource.gated !== false}"
        >Download</button>
      </div>
    </article>
  `;
};

DW.components.ResourceGateModal = function ResourceGateModal() {
  return `
    <div class="modal" data-resource-modal hidden>
      <div class="modal__backdrop" data-modal-close></div>
      <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="resource-gate-title">
        <button type="button" class="modal__close" data-modal-close aria-label="Close">×</button>
        <h2 id="resource-gate-title" style="font-size:var(--fs-xl);margin-bottom:0.5rem">Unlock this resource</h2>
        <p style="color:var(--color-text-muted);margin-bottom:1.25rem">Enter your email to download. Optional WhatsApp for learning updates.</p>
        <div data-resource-form-host></div>
      </div>
    </div>
  `;
};

DW.pendingResource = null;

DW.unlockResource = function unlockResource(resourceId) {
  const pending = DW.pendingResource;
  if (!pending || (resourceId && pending.id !== resourceId)) return;
  const url = pending.fileUrl;
  DW.closeResourceModal();
  if (url) {
    const a = document.createElement("a");
    a.href = DW.href(url);
    a.download = "";
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  DW.pendingResource = null;
};

DW.openResourceModal = function openResourceModal(resource) {
  DW.pendingResource = resource;
  let modal = document.querySelector("[data-resource-modal]");
  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", DW.components.ResourceGateModal());
    modal = document.querySelector("[data-resource-modal]");
  }
  const host = modal.querySelector("[data-resource-form-host]");
  host.innerHTML = DW.components.NewsletterForm({
    id: "resource-gate-form",
    showWhatsapp: true,
    submitLabel: "Unlock download",
    resourceId: resource.id || "",
  });
  DW.components.initNewsletterForms(host);
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add("is-open"));
  document.body.style.overflow = "hidden";
};

DW.closeResourceModal = function closeResourceModal() {
  const modal = document.querySelector("[data-resource-modal]");
  if (!modal) return;
  modal.classList.remove("is-open");
  const finish = () => {
    if (!modal.classList.contains("is-open")) modal.hidden = true;
    modal.removeEventListener("transitionend", finish);
  };
  modal.addEventListener("transitionend", finish);
  setTimeout(finish, 420);
  document.body.style.overflow = "";
};

DW.components.initResourceGate = function initResourceGate(root = document) {
  if (!document.querySelector("[data-resource-modal]")) {
    document.body.insertAdjacentHTML("beforeend", DW.components.ResourceGateModal());
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-modal-close]")) {
      DW.closeResourceModal();
      return;
    }
    const btn = e.target.closest("[data-resource-download]");
    if (!btn || !root.contains(btn)) return;
    const resource = {
      id: btn.dataset.resourceId,
      fileUrl: btn.dataset.fileUrl,
      gated: btn.dataset.gated !== "false",
    };
    if (!resource.gated) {
      DW.pendingResource = resource;
      DW.unlockResource(resource.id);
      return;
    }
    DW.openResourceModal(resource);
  });
};

;
/* js/components/registry.js */
/**
 * Shell mount — Navbar + Footer on every page.
 */
window.DW = window.DW || {};
DW.components = DW.components || {};

DW.components.mountShell = async function mountShell() {
  let site = null;
  try {
    site = await DW.fetchData("site");
  } catch (err) {
    console.warn("[DW] site.json unavailable", err);
  }

  const navHost = document.querySelector("[data-component='navbar']");
  const footerHost = document.querySelector("[data-component='footer']");

  if (navHost && !navHost.dataset.mounted) {
    navHost.innerHTML = DW.components.Navbar();
    navHost.dataset.mounted = "true";
    DW.components.initNavbar(navHost);
  }

  if (footerHost && !footerHost.dataset.mounted) {
    footerHost.innerHTML = DW.components.Footer(site || {});
    footerHost.dataset.mounted = "true";
    DW.components.initNewsletterForms(footerHost);
  }

  // Mount any standalone CTA placeholders that declare data-cta-props via page JS
  document.querySelectorAll("[data-component='cta-section']:empty").forEach((el) => {
    el.outerHTML = DW.components.CTASection({
      title: el.dataset.title || "Ready to start learning?",
      text: el.dataset.text || "Explore programs, free resources, or join the educational community.",
      cta: {
        label: el.dataset.ctaLabel || "Explore Programs",
        href: el.dataset.ctaHref || "/programs/",
      },
    });
  });
};

;
/* js/scroll-animations.js */
/**
 * Shared animation system — IntersectionObserver + CSS transitions only.
 * One observer reused for scroll reveals; count-up has its own observer.
 */
window.DW = window.DW || {};

(function () {
  const MAX_STAGGER_SPREAD = 480;
  const HERO_STEP_MS = 120;
  const COUNT_DURATION = 1200;

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let revealObserver = null;
  let countObserver = null;

  function getRevealObserver() {
    if (revealObserver) return revealObserver;
    if (!("IntersectionObserver" in window)) return null;

    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          revealObserver.unobserve(el);
          revealElement(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    return revealObserver;
  }

  function revealElement(el) {
    const type = el.getAttribute("data-animate") || "fade-up";

    if (type === "stagger") {
      const delay = Number(el.dataset.staggerDelay) || 80;
      const items = el.querySelectorAll(":scope > *, :scope .stagger-item");
      const count = items.length || 1;
      const step = Math.min(delay, MAX_STAGGER_SPREAD / Math.max(count - 1, 1));

      items.forEach((child, i) => {
        child.style.transitionDelay = `${Math.min(i * step, MAX_STAGGER_SPREAD)}ms`;
      });
      el.classList.add("is-visible");
      return;
    }

    el.classList.add("is-visible");
  }

  /** Watch [data-animate] in root — unobserves after first play. */
  DW.initScrollAnimations = function initScrollAnimations(root = document) {
    const scope = root.querySelectorAll ? root : document;
    const nodes = scope.querySelectorAll
      ? scope.querySelectorAll("[data-animate]")
      : [];

    if (prefersReducedMotion()) {
      nodes.forEach((el) => {
        el.classList.add("is-visible");
        if ((el.getAttribute("data-animate") || "") === "stagger") {
          el.querySelectorAll(":scope > *, :scope .stagger-item").forEach((child) => {
            child.style.transitionDelay = "0ms";
          });
        }
      });
      return;
    }

    const io = getRevealObserver();
    if (!io) {
      nodes.forEach(revealElement);
      return;
    }

    nodes.forEach((el) => {
      if (el.classList.contains("is-visible")) return;
      // Hero load sequence uses data-hero-step — skip if nested under hero entrance
      if (el.closest("[data-hero-entrance]") && el.hasAttribute("data-hero-step")) return;
      io.observe(el);
    });
  };

  /** Alias used by page scripts after dynamic renders */
  DW.refreshAnimations = function refreshAnimations(root = document) {
    DW.initScrollAnimations(root);
    DW.initCountUp(root);
  };

  /** Hero fade-in on load — heading → sub → CTAs → stats (~120ms steps) */
  DW.initHeroEntrance = function initHeroEntrance(root = document) {
    const heroes = root.querySelectorAll("[data-hero-entrance], .hero[data-section='hero']");
    heroes.forEach((hero) => {
      if (hero.dataset.heroAnimated === "true") return;
      hero.dataset.heroAnimated = "true";
      const steps = hero.querySelectorAll("[data-hero-step]");
      if (!steps.length) return;

      if (prefersReducedMotion()) {
        steps.forEach((s) => s.classList.add("is-visible"));
        return;
      }

      steps.forEach((step) => {
        const order = Number(step.dataset.heroStep) || 0;
        window.setTimeout(() => step.classList.add("is-visible"), 80 + order * HERO_STEP_MS);
      });
    });
  };

  /** Count-up — separate observer; 1.2s ease-out once in view */
  DW.initCountUp = function initCountUp(root = document) {
    const nodes = root.querySelectorAll("[data-count-up]");
    if (!nodes.length) return;

    const animate = (el) => {
      if (el.dataset.counted === "true") return;
      el.dataset.counted = "true";
      const target = Number(el.dataset.target) || 0;
      const suffix = el.dataset.suffix || "";

      if (prefersReducedMotion()) {
        el.textContent = `${target}${suffix}`;
        return;
      }

      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / COUNT_DURATION);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      nodes.forEach(animate);
      return;
    }

    if (!countObserver) {
      countObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            countObserver.unobserve(entry.target);
            animate(entry.target);
          });
        },
        { threshold: 0.35, rootMargin: "0px 0px -10% 0px" }
      );
    }

    nodes.forEach((n) => {
      if (n.dataset.counted === "true") return;
      countObserver.observe(n);
    });
  };

  /** Horizontal drag + scroll-snap carousel */
  DW.initCarousels = function initCarousels(root = document) {
    root.querySelectorAll("[data-carousel]").forEach((track) => {
      if (track.dataset.carouselBound === "true") return;
      track.dataset.carouselBound = "true";

      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;

      track.addEventListener("pointerdown", (e) => {
        isDown = true;
        track.classList.add("is-dragging");
        startX = e.clientX;
        scrollLeft = track.scrollLeft;
        track.setPointerCapture(e.pointerId);
      });

      track.addEventListener("pointermove", (e) => {
        if (!isDown) return;
        const walk = e.clientX - startX;
        track.scrollLeft = scrollLeft - walk;
      });

      const end = (e) => {
        if (!isDown) return;
        isDown = false;
        track.classList.remove("is-dragging");
        try {
          track.releasePointerCapture(e.pointerId);
        } catch (_) {
          /* ignore */
        }
      };

      track.addEventListener("pointerup", end);
      track.addEventListener("pointercancel", end);
      track.addEventListener("pointerleave", end);
    });
  };

  /** Duplicate children for seamless CSS marquee */
  DW.initMarquees = function initMarquees(root = document) {
    root.querySelectorAll("[data-marquee]").forEach((el) => {
      if (el.dataset.marqueeReady === "true") return;
      const track = el.querySelector("[data-marquee-track]");
      if (!track) return;
      track.innerHTML += track.innerHTML;
      el.dataset.marqueeReady = "true";
      el.classList.add("marquee");
      track.classList.add("marquee__track");
    });
  };

  /** FAQ: ensure grid-rows structure on details */
  DW.initFaqAccordions = function initFaqAccordions(root = document) {
    root.querySelectorAll(".faq details").forEach((details) => {
      if (details.dataset.faqBound === "true") return;
      const summary = details.querySelector("summary");
      if (!summary) return;

      let content = details.querySelector(".faq__content");
      if (!content) {
        const nodes = [...details.childNodes].filter((n) => n !== summary);
        content = document.createElement("div");
        content.className = "faq__content";
        const inner = document.createElement("div");
        inner.className = "faq__content-inner";
        nodes.forEach((n) => inner.appendChild(n));
        content.appendChild(inner);
        details.appendChild(content);
      }
      details.dataset.faqBound = "true";
    });
  };

  /** Boot helpers used from main.js after page render */
  DW.initMotion = function initMotion(root = document) {
    DW.initHeroEntrance(root);
    DW.initScrollAnimations(root);
    DW.initCountUp(root);
    DW.initCarousels(root);
    DW.initMarquees(root);
    DW.initFaqAccordions(root);
  };
})();

;
/* js/main.js */
window.DW = window.DW || {};
DW.pages = DW.pages || {};

document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page || "home";

  if (typeof DW.components?.mountShell === "function") {
    await DW.components.mountShell();
  }

  if (DW.pages && typeof DW.pages[page] === "function") {
    await DW.pages[page]();
  }

  if (typeof DW.components?.initNewsletterForms === "function") {
    DW.components.initNewsletterForms();
  }
  if (typeof DW.components?.initContactForms === "function") {
    DW.components.initContactForms();
  }

  // Shared motion layer (hero load, scroll reveal, count-up, carousel, marquee, FAQ)
  if (typeof DW.initMotion === "function") {
    DW.initMotion(document);
  } else if (typeof DW.initScrollAnimations === "function") {
    DW.initScrollAnimations();
    if (typeof DW.initCountUp === "function") DW.initCountUp();
  }

  // Heavy media after first paint
  if (typeof DW.initDeferredVideos === "function") {
    DW.initDeferredVideos(document);
  }
});

;
