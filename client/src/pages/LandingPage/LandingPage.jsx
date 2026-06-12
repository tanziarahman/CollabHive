import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const timer = setTimeout(() => {
      els.forEach((el, i) => {
        setTimeout(() => el.classList.add("visible"), i * 100);
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="landing-container">
      {/* Nav */}
      <nav className="ch-nav">
        <div className="ch-logo" onClick={() => navigate("/")}>
          Collab<span>Hive</span>
        </div>
        <div className="ch-nav-links">
          <span>Features</span>
          <span>About</span>
        </div>
      </nav>

      {/* Center */}
      <div className="ch-center">
        {/* Hex background pattern */}
        <svg className="ch-hex-bg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="hexPat" x="0" y="0" width="70" height="80" patternUnits="userSpaceOnUse">
              <polygon points="35,4 66,22 66,58 35,76 4,58 4,22" fill="none" stroke="#F5F0E8" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="1200" height="700" fill="url(#hexPat)" />
        </svg>

        <h1 className="ch-h1 reveal">
          Find your <em>hive.</em><br />Build together.
        </h1>

        <p className="ch-sub reveal">
          Connect with developers, designers, and creators who share your vision.
          Post a project, find your team, ship something great.
        </p>

        <div className="ch-cta reveal">
          <div className="ch-btn-row">
            <button className="ch-btn-register" onClick={() => navigate("/register")}>
              Create account
            </button>
            <button className="ch-btn-login" onClick={() => navigate("/login")}>
              Sign in
            </button>
          </div>
          <span className="ch-hint">Free forever · No credit card needed</span>
        </div>
      </div>

      {/* Stats bottom bar */}
      <div className="ch-bottom">
        {[
          ["500+", "Projects posted"],
          ["2.4k+", "Builders joined"],
          ["120+", "Teams formed"],
        ].map(([num, label]) => (
          <div key={label} className="ch-stat">
            <div className="ch-stat-num">{num}</div>
            <div className="ch-stat-label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}