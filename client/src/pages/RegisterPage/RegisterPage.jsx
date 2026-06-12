import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

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
      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Left Panel */}
      <div className="left-panel">
        <div className="logo" onClick={() => navigate("/")}>
          Collab<span>Hive</span>
        </div>
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
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}