import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuEye, LuEyeOff } from "react-icons/lu";
import logo from "../assets/maven-logo.svg";
import { loginFSE } from "../api/fseApi";

const SESSION_KEY = "crm_panel_session";

export default function Login() {
  const [email, setEmail] = useState("");
  const [zone, setZone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginFSE({ email: email.trim(), zone, password });
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token: response.token, user: response.user }));
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-logo-card">
            <img src={logo} alt="Maven Jobs" className="login-brand-logo" />
          </div>
          <h1 className="login-brand-title">Field Sales Executive Portal</h1>
          <p className="login-brand-sub">
            Sign in to manage assigned leads, update statuses, and track follow-up activity.
          </p>
          <ul className="login-feature-list">
            <li className="login-feature-item"><span className="login-feature-dot" />Track zone-wise assigned leads</li>
            <li className="login-feature-item"><span className="login-feature-dot" />Update lead status in real time</li>
            <li className="login-feature-item"><span className="login-feature-dot" />Log complete follow-up history</li>
          </ul>
        </div>

        <div className="login-form-wrap">
          <p className="login-eyebrow">FSE Access</p>
          <h2 className="login-form-title">Sign in to your account</h2>
          <p className="login-form-sub">Use your registered email, zone, and password.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label" htmlFor="fse-email">Email address</label>
              <input
                id="fse-email"
                className="login-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@mavenjobs.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="fse-zone">Zone</label>
              <select
                id="fse-zone"
                className="login-input"
                value={zone}
                onChange={(event) => setZone(event.target.value)}
                style={{ appearance: "auto" }}
                required
              >
                <option value="">Select a zone</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="fse-password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="fse-password"
                  className="login-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{ paddingRight: "40px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                </button>
              </div>
            </div>

            {error ? <div className="login-error">{error}</div> : null}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.875rem", color: "#475569", fontWeight: 500 }}>
              Account creation is managed by your State Manager.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
