import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { loginNSH } from "../api/nshApi";
// Importing logo - we will ensure this exists later or use a placeholder
import logo from "../assets/maven-logo.svg";

const SESSION_KEY = "crm_panel_session";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await loginNSH({ email: email.trim(), password });
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ token: response.token, user: response.user })
      );
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        {/* Left panel */}
        <div className="login-brand">
          <img src={logo} alt="Maven Jobs" className="login-brand-logo" style={{ width: "160px", marginBottom: "32px" }} />
          <h1 className="login-brand-title">
            National Sales Head
          </h1>
          <p className="login-brand-sub">
            Overall control of sales operations across India. Monitor performance, approve strategic deals, and define policies.
          </p>
          <ul className="login-feature-list">
            {[
              "View zone-wise performance metrics",
              "Monitor complete sales funnel",
              "Approve high-value strategic deals",
              "Track revenue and growth trends",
            ].map((item) => (
              <li key={item} className="login-feature-item">
                <span className="login-feature-dot" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right panel */}
        <div className="login-form-wrap">
          <p className="login-eyebrow">National Access Portal</p>
          <h2 className="login-form-title">Sign in to your dashboard</h2>
          <p className="login-form-sub">
            Use your NSH credentials to access the national control panel.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label className="login-label" htmlFor="nsh-email">
                Email address
              </label>
              <input
                id="nsh-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nsh@mavenjobs.com"
                className="login-input"
                autoComplete="email"
                required
              />
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="nsh-password">
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="nsh-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  className="login-input"
                  autoComplete="current-password"
                  style={{ paddingRight: "40px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255, 255, 255, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert" style={{ color: "#ef4444", fontSize: "0.875rem", marginBottom: "16px" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="login-btn"
              style={{ padding: "14px", fontSize: "1rem", fontWeight: "600" }}
            >
              {isSubmitting ? "Accessing Dashboard…" : "Sign In to Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
