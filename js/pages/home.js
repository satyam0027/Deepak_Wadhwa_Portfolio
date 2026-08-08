window.DW = window.DW || {};
DW.pages = DW.pages || {};

DW.pages.home = async function homePage() {
  // Site + hero first for faster first paint; rest in parallel right after
  const siteBoot = await DW.loadPageData(["site"]);
  const site = siteBoot.site || {};
  const statsHtml = DW.components.Stats(site.stats || [], { reveal: false });

  const heroHost = document.querySelector("[data-section='hero']");
  if (heroHost) {
    heroHost.outerHTML = DW.components.Hero({
      eyebrow: "Financial educator · Mentor",
      title: "Deepak Wadhwa",
      tagline: "Financial Education | Trading | Wealth Creation",
      lead: "Clarity over hype. Process over shortcuts. A first conversation with markets that builds understanding, discipline, and long-term thinking.",
      primaryCta: { label: "Explore Programs", href: "/programs/" },
      secondaryCta: { label: "Watch Introduction", href: "/media/" },
      statsHtml,
      backgroundVideo: "assets/videos/hero-bg.mp4",
      portrait: "assets/images/deepak-wadhwa-portrait.webp",
      portraitAlt: "Deepak Wadhwa",
    });
    if (typeof DW.initHeroEntrance === "function") DW.initHeroEntrance(document);
    if (typeof DW.initDeferredVideos === "function") DW.initDeferredVideos(document);
    if (typeof DW.initCountUp === "function") DW.initCountUp(document);
  }

  const data = await DW.loadPageData([
    "programs",
    "testimonials",
    "resources",
    "articles",
    "videos",
    "media-mentions",
  ]);

  const who = document.querySelector("[data-section='who']");
  if (who) {
    who.className = "section";
    who.innerHTML = `
      <div class="container">
        ${DW.components.SectionHeader({
          eyebrow: "Authority",
          title: "Who is Deepak Wadhwa?",
          subheading: "A financial educator and wealth-creation mentor with 20+ years of market experience — focused on teaching frameworks, not chasing noise.",
        })}
        <p data-animate="fade-up">Deepak helps people learn markets with clarity: structured programs, practical resources, and an educational community built on process — not tips or guarantees.</p>
        <a class="btn btn--ghost" href="${DW.href("/about/")}" data-animate="fade-up">Read the full story</a>
      </div>`;
  }

  const expertise = document.querySelector("[data-section='expertise']");
  if (expertise) {
    expertise.className = "section section--soft";
    const areas = [
      { t: "Market Education", d: "Foundations that make charts, instruments, and routines make sense." },
      { t: "Options Learning", d: "Mechanics and risk literacy before any structured practice." },
      { t: "Risk Discipline", d: "Position sizing and capital awareness as everyday skills." },
      { t: "Investor Mindset", d: "Patience, journaling, and decisions you can explain." },
      { t: "Wealth Frameworks", d: "Long-term thinking that compounds knowledge and habits." },
    ];
    expertise.innerHTML = `
      <div class="container">
        ${DW.components.SectionHeader({
          eyebrow: "Expertise",
          title: "Areas of focus",
          subheading: "Education across markets, risk, and decision-making — taught with restraint and clarity.",
          center: true,
        })}
        <div class="card-grid card-grid--3" data-animate="stagger" data-stagger-delay="80">
          ${areas
            .map(
              (a) => `
            <article class="program-card stagger-item">
              <h3>${a.t}</h3>
              <p>${a.d}</p>
            </article>`
            )
            .join("")}
        </div>
      </div>`;
  }

  const programs = document.querySelector("[data-section='programs']");
  if (programs) {
    programs.className = "section";
    const list = (data.programs?.programs || []).filter((p) => p.featured !== false).slice(0, 5);
    programs.innerHTML = `
      <div class="container">
        ${DW.components.SectionHeader({
          eyebrow: "Programs",
          title: "Learning programs",
          subheading: "Learn. Practice. Improve. — structured paths without the academy hype.",
        })}
        ${DW.components.renderProgramGrid(list)}
        <div style="margin-top:var(--space-6)" data-animate="fade-up"><a class="btn btn--primary" href="${DW.href("/programs/")}">View all programs</a></div>
      </div>`;
  }

  const results = document.querySelector("[data-section='results']");
  if (results) {
    results.className = "section section--soft";
    const stories = data.testimonials?.testimonials || [];
    // Duplicate once in markup if few cards so the loop feels continuous
    const cards = stories.map(DW.components.TestimonialCard).join("");
    const track = stories.length < 4 ? cards + cards : cards;
    results.innerHTML = `
      <div class="container">
        ${DW.components.SectionHeader({
          eyebrow: "Results",
          title: "Student & client learning journeys",
          subheading: "Case studies framed as Before → Learning → After — not hype quotes.",
        })}
      </div>
      <div class="marquee marquee--cards" data-marquee data-animate="fade-up">
        <div class="marquee__track" data-marquee-track>
          ${track}
        </div>
      </div>
      <div class="container">
        <div style="margin-top:var(--space-6)" data-animate="fade-up"><a class="btn btn--ghost" href="${DW.href("/success-stories/")}">Success stories</a></div>
      </div>`;
    if (typeof DW.initMarquees === "function") DW.initMarquees(results);
  }

  const resources = document.querySelector("[data-section='resources']");
  if (resources) {
    resources.className = "section";
    const list = (data.resources?.resources || []).filter((r) => r.featured).slice(0, 3);
    resources.innerHTML = `
      <div class="container">
        ${DW.components.SectionHeader({
          eyebrow: "Free resources",
          title: "Start learning today",
          subheading: "Practical guides and checklists — unlock with email so we can stay in touch.",
        })}
        <div class="card-grid card-grid--3" data-animate="stagger" data-stagger-delay="80">
          ${list.map(DW.components.ResourceCard).join("")}
        </div>
        <div style="margin-top:var(--space-6)" data-animate="fade-up"><a class="btn btn--ghost" href="${DW.href("/resources/")}">All free resources</a></div>
      </div>`;
    DW.components.initResourceGate(resources);
  }

  const insights = document.querySelector("[data-section='insights']");
  if (insights) {
    insights.className = "section section--soft";
    const articles = (data.articles?.articles || []).slice(0, 3);
    insights.innerHTML = `
      <div class="container">
        ${DW.components.SectionHeader({
          eyebrow: "DW Insights",
          title: "Latest insights",
          subheading: "Educational writing for search, trust, and long-term learning.",
        })}
        <div class="card-grid card-grid--3" data-animate="stagger" data-stagger-delay="80">
          ${articles.map(DW.components.ArticleCard).join("")}
        </div>
      </div>`;
  }

  const videos = document.querySelector("[data-section='videos']");
  if (videos) {
    videos.className = "section";
    const list = (data.videos?.videos || []).slice(0, 3);
    videos.innerHTML = `
      <div class="container">
        ${DW.components.SectionHeader({
          eyebrow: "Media",
          title: "Latest videos",
        })}
        <div class="card-grid card-grid--3" data-animate="stagger" data-stagger-delay="80">
          ${list.map(DW.components.VideoCard).join("")}
        </div>
      </div>`;
  }

  const media = document.querySelector("[data-section='media']");
  if (media) {
    media.className = "section section--soft";
    const mentions = data["media-mentions"]?.mentions || [];
    media.innerHTML = `
      <div class="container">
        ${DW.components.SectionHeader({
          eyebrow: "Credibility",
          title: "Featured in",
          center: true,
        })}
        ${DW.components.MediaLogoStrip(mentions)}
      </div>`;
  }

  const cta = document.querySelector("[data-section='cta']");
  if (cta) {
    cta.outerHTML = DW.components.CTASection({
      title: "Begin with clarity",
      text: "Explore a learning program, download a free resource, or join the educational community.",
      cta: { label: "Join / Connect", href: "/community/" },
    });
  }
};
