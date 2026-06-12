import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0D0D0D", minHeight: "100vh", display: "flex", color: "#F5F0E8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Syne:wght@700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .left-panel { width: 45%; background: #111; border-right: 0.5px solid rgba(245,240,232,0.08); display: flex; flex-direction: column; justify-content: space-between; padding: 3rem; position: relative; overflow: hidden; }
        .right-panel { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .form-box { width: 100%; max-width: 420px; }
        .logo { font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 800; color: #F5B84C; cursor: pointer; }
        .logo span { color: #F5F0E8; }
        .tagline { margin-top: auto; }
        .tagline h2 { font-family: 'Syne', sans-serif; font-size: 2.5rem; font-weight: 800; letter-spacing: -1.5px; line-height: 1.1; color: #F5F0E8; margin-bottom: 1rem; }
        .tagline h2 em { font-style: normal; color: #F5B84C; }
        .tagline p { font-size: 0.9rem; color: rgba(245,240,232,0.45); line-height: 1.7; max-width: 320px; }
        .hex-bg { position: absolute; bottom: -80px; right: -80px; opacity: 0.05; }
        .form-title { font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; letter-spacing: -1px; color: #F5F0E8; margin-bottom: 0.4rem; }
        .form-subtitle { font-size: 0.875rem; color: rgba(245,240,232,0.45); margin-bottom: 2rem; }
        .form-subtitle a { color: #F5B84C; cursor: pointer; text-decoration: none; }
        .field { margin-bottom: 1.1rem; }
        .field label { display: block; font-size: 0.8rem; color: rgba(245,240,232,0.6); margin-bottom: 0.4rem; letter-spacing: 0.3px; }
        .field input { width: 100%; background: rgba(245,240,232,0.05); border: 0.5px solid rgba(245,240,232,0.15); border-radius: 10px; padding: 0.75rem 1rem; color: #F5F0E8; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
        .field input:focus { border-color: #F5B84C; background: rgba(245,184,76,0.04); }
        .field input::placeholder { color: rgba(245,240,232,0.25); }
        .password-wrap { position: relative; }
        .password-wrap input { padding-right: 3rem; }
        .toggle-pw { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: rgba(245,240,232,0.4); cursor: pointer; font-size: 0.8rem; font-family: 'DM Sans', sans-serif; }
        .toggle-pw:hover { color: #F5B84C; }
        .error-msg { background: rgba(226,75,74,0.1); border: 0.5px solid rgba(226,75,74,0.3); color: #f09595; font-size: 0.85rem; padding: 0.75rem 1rem; border-radius: 10px; margin-bottom: 1.25rem; }
        .submit-btn { width: 100%; background: #F5B84C; color: #0D0D0D; border: none; padding: 0.85rem; border-radius: 10px; font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem; }
        .submit-btn:hover:not(:disabled) { background: #f7c96d; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .divider { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; }
        .divider span { font-size: 0.75rem; color: rgba(245,240,232,0.25); white-space: nowrap; }
        .divider-line { flex: 1; height: 0.5px; background: rgba(245,240,232,0.1); }
        @media (max-width: 768px) { .left-panel { display: none; } }
      `}</style>

      {/* Left Panel */}
      <div className="left-panel">
        <div className="logo" onClick={() => navigate("/")}>Collab<span>Hive</span></div>
        <div className="tagline">
          <h2>Your next great<br /><em>team</em> is here</h2>
          <p>Create a profile, showcase your skills, and connect with builders who share your vision.</p>
        </div>
        <svg className="hex-bg" width="300" height="300" viewBox="0 0 300 300">
          {Array.from({ length: 25 }).map((_, i) => {
            const col = i % 5, row = Math.floor(i / 5);
            const x = col * 60 + (row % 2 === 0 ? 0 : 30) + 30;
            const y = row * 52 + 30;
            return <polygon key={i} points={`${x},${y + 22} ${x + 19},${y + 11} ${x + 19},${y - 11} ${x},${y - 22} ${x - 19},${y - 11} ${x - 19},${y + 11}`} fill="none" stroke="#F5F0E8" strokeWidth="0.8" />;
          })}
        </svg>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div className="form-box">
          <h1 className="form-title">Create account</h1>
          <p className="form-subtitle">
            Already have one? <a onClick={() => navigate("/login")}>Sign in</a>
          </p>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full name</label>
              <input name="fullName" type="text" placeholder="John Doe" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Username</label>
              <input name="username" type="text" placeholder="johndoe" value={formData.username} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Password</label>
              <div className="password-wrap">
                <input name="password" type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} required />
                <button type="button" className="toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "hide" : "show"}
                </button>
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating account..." : "Create account →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}