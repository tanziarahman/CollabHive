import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

// Sample of the real, multi-discipline category list from the Post Project form —
// CollabHive isn't limited to software, so the landing page shouldn't look like it is.
const CATEGORY_HIGHLIGHTS = ["Software & AI", "Robotics & Hardware", "Business & Startups", "Design", "Research", "Hackathons & Case Comps"];

const FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
    title: "Post Any Project",
    description: "From hackathons to research papers to startup ideas — describe what you're building, list the roles you need, and the skills that matter. No discipline is off-limits.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l1.9 5.6L19.5 9l-5.6 1.9L12 16.5l-1.9-5.6L4.5 9l5.6-1.4L12 2z" />
      </svg>
    ),
    title: "Skill-Matched Recommendations",
    description: "Our matching engine compares required skills against every builder's profile and surfaces the best-fit collaborators for each open role — so you spend less time searching.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Follow, Get Notified, Team Up",
    description: "Follow builders whose work you like, see their new projects show up in your feed, and get notified the moment a follow request, invite, or join request needs your response.",
  },
];

const ADVANTAGES = [
  "Open to every discipline — software, hardware, business, design, research and more",
  "Skill-based matching connects you with the right collaborators, faster",
  "Follow builders you admire and see their new projects the moment they post",
];

const PREVIEW_TILES = [
  { label: "Follow request accepted", sub: "Sarah wants to collaborate", type: "people" },
  { label: "92% skill match", sub: "Recommended for EcoTrack", type: "level" },
  { label: "Invite accepted", sub: "Join request approved", type: "check" },
  { label: "New project posted", sub: "Someone you follow just shared one", type: "bolt" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="lp-page">
      {/* Nav */}
      <nav className="lp-nav">
        <div className="lp-logo" onClick={() => navigate("/")}>
          Collab<span>Hive</span>
        </div>
        <div className="lp-nav-links">
          {[
            { label: "Features", id: "features" },
            { label: "How it Works", id: "how-it-works" },
            { label: "Community", id: "community" },
          ].map(({ label, id }) => (
            <span
              key={id}
              role="button"
              tabIndex={0}
              onClick={() => scrollToSection(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  scrollToSection(id);
                }
              }}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="lp-nav-actions">
          <button className="lp-nav-login" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="lp-nav-cta" onClick={() => navigate("/register")}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <span className="lp-badge">⚡ Find your next collaborator</span>
          <h1 className="lp-h1">
            Where Teams Build the Future, <span>Together.</span>
          </h1>
          <p className="lp-sub">
            CollabHive helps you find the right people for your next project or competition — across
            software, hardware, business, design, research, and beyond. Post what you're building, list
            the roles you need, and let skill-matched collaborators find you.
          </p>
          <div className="lp-hero-actions">
            <button className="lp-btn-primary" onClick={() => navigate("/register")}>
              Get Started for Free
            </button>
            <button className="lp-btn-secondary" onClick={() => navigate("/login")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
              See How It Works
            </button>
          </div>
        </div>

        <div className="lp-hero-visual">
          <div className="lp-mock-card">
            <div className="lp-mock-card-header">
              <div>
                <p className="lp-mock-title">Aurora Weather App</p>
                <p className="lp-mock-sub">Web Development · React, Node.js</p>
              </div>
              <span className="lp-mock-match">75% match</span>
            </div>
            <div className="lp-mock-tags">
              <span className="lp-mock-tag">React</span>
              <span className="lp-mock-tag">Node.js</span>
              <span className="lp-mock-tag">Firebase</span>
            </div>
            <div className="lp-mock-row">
              <span className="lp-mock-avatar">S</span>
              <span className="lp-mock-name">Sam Ito</span>
              <span className="lp-mock-invite">Invite</span>
            </div>
          </div>
          <div className="lp-mock-floating-badge">✓ Matches: React, Node.js</div>
        </div>
      </section>

      {/* Categories */}
      <section className="lp-trusted" id="community">
        <span className="lp-trusted-label">Built for Every Discipline</span>
        <div className="lp-trusted-logos">
          {CATEGORY_HIGHLIGHTS.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="lp-features" id="features">
        <h2>From Idea to Team</h2>
        <p className="lp-section-sub">Everything you need to find the right people and get your project moving.</p>

        <div className="lp-feature-grid">
          {FEATURES.map((f, i) => (
            <div className="lp-feature-card" key={f.title}>
              <div className={`lp-feature-icon tone-${i}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Advantage */}
      <section className="lp-advantage" id="how-it-works">
        <div className="lp-advantage-visual">
          {PREVIEW_TILES.map((tile, i) => (
            <div className={`lp-preview-tile tile-${i}`} key={tile.label}>
              <div className={`lp-preview-icon type-${tile.type}`}>
                {tile.type === "check" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {tile.type === "level" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  </svg>
                )}
                {tile.type === "bolt" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                )}
                {tile.type === "people" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                )}
              </div>
              <div>
                <b>{tile.label}</b>
                <span>{tile.sub}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="lp-advantage-copy">
          <h2>The Hive Advantage</h2>
          <p>
            Most collaboration tools assume you already have a team. CollabHive helps you build one — from
            any field, not just tech. Post a project or a competition entry, tell us what roles and skills
            you need, and our matching engine does the searching so you can focus on the work itself.
          </p>
          <ul className="lp-advantage-list">
            {ADVANTAGES.map((item) => (
              <li key={item}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="lp-cta">
        <div className="lp-cta-card">
          <h2>Ready to find your team?</h2>
          <p>Post your project or browse what others are building — your next collaborator could be one follow away.</p>
          <button className="lp-btn-primary" onClick={() => navigate("/register")}>
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-logo small" onClick={() => navigate("/")}>
          Collab<span>Hive</span>
        </div>
        <div className="lp-footer-links">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Contact Us</span>
          <span>Twitter</span>
          <span>LinkedIn</span>
        </div>
        <span className="lp-footer-copy">© 2026 CollabHive. All rights reserved.</span>
      </footer>
    </div>
  );
}
