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
