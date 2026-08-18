import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

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
    description: "Compares required skills against every builder's profile and surfaces the best-fit collaborators for each open role, with the exact matched skills shown — no black-box scores.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
    title: "Similar Projects",
    description: "Every project page surfaces others like it, ranked by the same skill-matching engine — so browsing turns up more relevant work, not just newest-first.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
    title: "Comments & Q&A",
    description: "Ask a project owner a question or leave a comment before you apply — no need to join first just to find out if a role's still open.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    ),
    title: "Track Project Status",
    description: "Mark a project Active, On Hold, or Completed, and filter the feed the same way — so it's obvious at a glance what's still looking for people.",
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
    title: "Follow, Chat & Get Notified",
    description: "Follow builders whose work you like, message your team once you're on one, and get notified the moment a follow request, invite, or comment needs your response.",
  },
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
      <section className="lp-trusted">
        <span className="lp-trusted-label">Built for Every Discipline</span>
        <div className="lp-trusted-logos">
          {CATEGORY_HIGHLIGHTS.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="lp-features">
        <h2>Everything You Need, From Idea to Team</h2>
        <p className="lp-section-sub">Post a project, find the right people, and manage the whole thing from one place.</p>

        <div className="lp-feature-grid">
          {FEATURES.map((f, i) => (
            <div className="lp-feature-card" key={f.title}>
              <div className={`lp-feature-icon tone-${i % 3}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
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
