import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { setSession } from "../../utils/session";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.username || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    
    try {
      const data = await login(formData);
      setSession(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Panel */}
      <div className="left-panel">
        <div className="logo" onClick={() => navigate("/")}>
          Collab<span>Hive</span>
        </div>
        <div className="tagline">
          <h2>Welcome back to<br /><em>CollabHive</em></h2>
          <p>Sign in to continue collaborating with your team and building amazing projects together.</p>
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
          <h1 className="form-title">Welcome back!</h1>
          <p className="form-subtitle">
            Don't have an account? <a onClick={() => navigate("/register")}>Sign up</a>
          </p>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Username</label>
              <input 
                name="username" 
                type="text" 
                placeholder="johndoe" 
                value={formData.username} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="field">
              <label>Password</label>
              <div className="password-wrap">
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
                <button type="button" className="toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "hide" : "show"}
                </button>
              </div>
            </div>
            {/* <div className="forgot-password">
              <a onClick={() => navigate("/forgot-password")}>Forgot password?</a>
            </div> */}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}