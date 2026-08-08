window.DW = window.DW || {};
DW.pages = DW.pages || {};

DW.pages.about = async function aboutPage() {
  const data = await DW.loadPageData(["media-mentions", "site"]);
  const main = document.querySelector("[data-page-main]");
  if (!main) return;

  main.innerHTML = `
    ${DW.components.Hero({
      compact: true,
      eyebrow: "About",
      title: "Founder story & credibility",
      tagline: "Financial Education | Trading | Wealth Creation",
      lead: "Not a biography dump — the journey, philosophy, and 20+ years that shape how Deepak teaches.",
      primaryCta: { label: "Explore Programs", href: "/programs/" },
      secondaryCta: { label: "Connect", href: "/contact/" },
      backgroundVideo: "assets/videos/about-hero-bg.mp4",
    })}
    <section class="section" data-animate>
      <div class="container">
        ${DW.components.SectionHeader({ eyebrow: "Journey", title: "My Journey", subheading: "From market practice to teaching others how to learn with discipline." })}
        <p>Deepak’s path into education grew from years on the markets and a clear conviction: people need frameworks, not noise. The work today is about making that learning accessible and rigorous.</p>
      </div>
    </section>
    <section class="section section--soft" data-animate>
      <div class="container">
        ${DW.components.SectionHeader({ eyebrow: "Identity", title: "Who I Am" })}
        <p>Educator first — markets as a craft to understand, not a spectacle. Mentorship and programs exist to build skills, judgment, and patience.</p>
      </div>
    </section>
    <section class="section" data-animate>
      <div class="container">
        ${DW.components.SectionHeader({ eyebrow: "Beliefs", title: "My Philosophy" })}
        <p>Process over prediction. Risk awareness before aggression. Patient compounding of knowledge — the same principles that support long-term wealth thinking.</p>
      </div>
    </section>
    <section class="section section--soft" data-animate>
      <div class="container">
        ${DW.components.SectionHeader({ eyebrow: "Method", title: "My Approach" })}
        <p>Teach frameworks, practise with accountability, and review honestly. Live sessions, clear curriculum, and resources you can return to.</p>
      </div>
    </section>
    <section class="section section--navy">
      <div class="container">
        ${DW.components.SectionHeader({ eyebrow: "Experience", title: "20+ Years Experience", center: true })}
        ${DW.components.Stats((data.site && data.site.stats) || [])}
      </div>
    </section>
    <section class="section" data-animate>
      <div class="container">
        ${DW.components.SectionHeader({ eyebrow: "Timeline", title: "Career journey / major milestones" })}
        <div class="card-grid card-grid--2">
          ${[
            { t: "Early market years", d: "Building first-hand experience across market cycles." },
            { t: "Teaching practice", d: "Turning hard-won lessons into structured education." },
            { t: "Community building", d: "Growing spaces for shared learning and discussion." },
            { t: "Media & education", d: "Sharing ideas through interviews, sessions, and writing." },
          ]
            .map(
              (m) => `
            <article class="program-card">
              <h3>${m.t}</h3>
              <p>${m.d}</p>
            </article>`
            )
            .join("")}
        </div>
      </div>
    </section>
    <section class="section section--soft" data-animate>
      <div class="container">
        ${DW.components.SectionHeader({ eyebrow: "Recognition", title: "Achievements" })}
        <p>Selected milestones will appear here — kept factual and restrained, in line with an education-first brand.</p>
      </div>
    </section>
    <section class="section" data-animate>
      <div class="container">
        ${DW.components.SectionHeader({ eyebrow: "Media", title: "Media features", center: true })}
        ${DW.components.MediaLogoStrip((data["media-mentions"] && data["media-mentions"].mentions) || [])}
      </div>
    </section>
    <section class="section section--soft" data-animate>
      <div class="container">
        ${DW.components.SectionHeader({ eyebrow: "Purpose", title: "My Mission" })}
        <p>Help people learn markets with clarity, discipline, and integrity — so education becomes a durable advantage, not a short-lived tip.</p>
      </div>
    </section>
    ${DW.components.CTASection({
      title: "Learn with structure",
      text: "See the programs, or start with a free resource.",
      cta: { label: "View Programs", href: "/programs/" },
    })}
  `;
};
