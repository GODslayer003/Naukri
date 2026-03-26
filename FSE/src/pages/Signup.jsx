import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuEye, LuEyeOff } from "react-icons/lu";
import logo from "../assets/maven-logo.svg";
import { signupFSE } from "../api/fseApi";

const SESSION_KEY = "crm_panel_session";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [zone, setZone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await signupFSE({
        fullName: fullName.trim(),
        email: email.trim(),
        zone,
        password,
        confirmPassword,
      });
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token: response.token, user: response.user }));
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Unable to sign up.");
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
            Register to join your zone team and start handling assigned leads.
          </p>
          <ul className="login-feature-list">
            <li className="login-feature-item"><span className="login-feature-dot" />Secure role-based access</li>
            <li className="login-feature-item"><span className="login-feature-dot" />Zone-wise lead visibility</li>
            <li className="login-feature-item"><span className="login-feature-dot" />Complete follow-up workflow</li>
          </ul>
        </div>

        <div className="login-form-wrap">
          <p className="login-eyebrow">FSE Registration</p>
          <h2 className="login-form-title">Create your account</h2>
          <p className="login-form-sub">Fill your details to get started.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label" htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                className="login-input"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
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
              <label className="login-label" htmlFor="signup-zone">Zone</label>
              <select
                id="signup-zone"
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
              <label className="login-label" htmlFor="signup-password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="signup-password"
                  className="login-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
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

            <div className="login-field">
              <label className="login-label" htmlFor="signup-confirm-password">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="signup-confirm-password"
                  className="login-input"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  style={{ paddingRight: "40px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
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
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                </button>
              </div>
            </div>

            {error ? <div className="login-error">{error}</div> : null}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>

            <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.875rem", color: "#475569", fontWeight: 500 }}>
              Already registered?{" "}
              <Link to="/login" style={{ color: "#1e40af", textDecoration: "none", fontWeight: 600 }}>
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
