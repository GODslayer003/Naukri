import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LuEye, LuEyeOff } from "react-icons/lu";
import logo from "../assets/maven-logo.svg";

const resolveRootApiBaseUrl = () => {
  const configuredBaseUrl = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  if (!configuredBaseUrl) {
    return "http://localhost:3000/api/v1";
  }

  const normalized = configuredBaseUrl.replace(/\/+$/, "");
  const match = normalized.match(/^(.*\/api\/v1)(?:\/.*)?$/i);
  return match ? match[1] : normalized;
};

const API_BASE = resolveRootApiBaseUrl();

async function signupLeadGenerator(data) {
  const response = await fetch(`${API_BASE}/lead-generator/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Registration failed");
  }

  return payload;
}

export default function Signup() {
  const [email, setEmail] = useState("");
  const [zone, setZone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !zone.trim() || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await signupLeadGenerator({ 
        email: email.trim(), 
        zone: zone.trim(), 
        password, 
        confirmPassword 
      });
      // Optionally just navigate to login or auto-login
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign up.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        {/* Left panel */}
        <div className="login-brand">
          <img src={logo} alt="Maven Jobs" className="login-brand-logo" />
          <h1 className="login-brand-title">
            Lead Generation Portal
          </h1>
          <p className="login-brand-sub">
            Register your account to manage leads, track your pipeline,
            and submit new opportunities.
          </p>
          <ul className="login-feature-list">
            {[
              "Submit and track leads in real-time",
              "View approval status and feedback",
              "Monitor your performance dashboard",
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
          <p className="login-eyebrow">Lead Generator Access</p>
          <h2 className="login-form-title">Create your account</h2>
          <p className="login-form-sub">
            Fill in the details below to register for the portal.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label className="login-label" htmlFor="lg-email">
                Email address
              </label>
              <input
                id="lg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@mavenjobs.com"
                className="login-input"
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="lg-zone">
                Zone
              </label>
              <select
                id="lg-zone"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="login-input"
                style={{ appearance: "auto" }}
              >
                <option value="" disabled>Select a zone</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="lg-password">
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="lg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="login-input"
                  autoComplete="new-password"
                  style={{ paddingRight: "40px" }}
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

            <div className="login-field">
              <label className="login-label" htmlFor="lg-confirm-password">
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="lg-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="login-input"
                  autoComplete="new-password"
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="login-btn"
            >
              {isSubmitting ? "Creating account…" : "Register"}
            </button>
            <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.875rem", color: "#475569", fontWeight: "500" }}>
              Already have an account? <Link to="/login" style={{ color: "#1e40af", textDecoration: "none", fontWeight: "600" }}>Sign In</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
