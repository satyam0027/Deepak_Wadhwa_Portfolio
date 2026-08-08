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
