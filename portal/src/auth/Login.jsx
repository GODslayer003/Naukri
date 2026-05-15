import React, { useState } from "react";
import {
  FiMail,
  FiLock,
  FiX,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiArrowRight,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import mavenLogo from "../../assets/maven-logo-BdiSsfJk.svg";
import { useAuth } from "../AuthContext";
import "./AuthModals.css";

export default function Login({ isOpen, onClose, openSignUp }) {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await login(email, password);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.message || "Invalid credentials. Please try again.");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="register-modal-overlay">
      <div className="register-modal-backdrop" onClick={onClose}></div>
      <div className="register-modal-content" style={{ maxWidth: '1050px' }}>
        <button 
          className="register-modal-close" 
          onClick={onClose}
          aria-label="Close Modal"
        >
          <FiX aria-hidden="true" />
        </button>
        
        <div className="register-layout">
          {/* Left Column: New User Promo */}
          <div className="register-left">
            <div className="register-logo-container">
              <img src={mavenLogo} alt="Maven Jobs" className="register-modal-logo" />
            </div>
            <div className="register-left-content">
              <h3>New to MavenJobs?</h3>
              
              <ul className="register-benefits-list">
                <li>
                  <FiCheckCircle className="benefit-icon" aria-hidden="true" />
                  <span>One click apply using MavenJobs profile.</span>
                </li>
                <li>
                  <FiCheckCircle className="benefit-icon" aria-hidden="true" />
                  <span>Get relevant job recommendations.</span>
                </li>
                <li>
                  <FiCheckCircle className="benefit-icon" aria-hidden="true" />
                  <span>Showcase profile to top companies.</span>
                </li>
                <li>
                  <FiCheckCircle className="benefit-icon" aria-hidden="true" />
                  <span>Know application status instantly.</span>
                </li>
              </ul>
              
              <button 
                type="button" 
                className="btn-register-submit" 
                style={{ 
                  marginTop: '40px', 
                  background: 'rgba(20, 63, 134, 0.08)', 
                  color: '#143f86',
                  boxShadow: 'none',
                  border: '1.5px solid rgba(20, 63, 134, 0.1)'
                }}
                onClick={() => {
                  onClose();
                  if (openSignUp) openSignUp();
                }}
              >
                Register for Free <FiArrowRight style={{marginLeft: '8px'}} />
              </button>
            </div>
          </div>
          
          {/* Right Column: Form */}
          <div className="register-right">
            <div className="register-header-top">
              <h2>Login</h2>
              <div className="register-login-link">
                No account? <button 
                  type="button" 
                  className="link-button" 
                  onClick={() => {
                    onClose();
                    if (openSignUp) openSignUp();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#143f86',
                    fontWeight: '700',
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: 'inherit',
                    fontSize: 'inherit'
                  }}
                >
                  Create one
                </button>
              </div>
            </div>
            <p className="register-sub">Welcome back! Please enter your details.</p>
            
            <form className="register-form" onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label>EMAIL ID / USERNAME <span className="required-dot"></span></label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" aria-hidden="true" />
                  <input 
                    type="text" 
                    placeholder="Enter Email ID / Username" 
                    className="register-input" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="auth-form-group">
                <label>PASSWORD <span className="required-dot"></span></label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" aria-hidden="true" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter Password" 
                    className="register-input" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      background: 'none',
                      border: 'none',
                      color: '#143f86',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <a href="#" style={{ color: '#143f86', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '700' }}>Forgot Password?</a>
                </div>
              </div>
              
              {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>{error}</div>}
              <div className="register-actions-row">
                <button type="submit" className="btn-register-submit" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login to Account"}
                </button>
                
                <div className="auth-separator">
                  <span>Or</span>
                </div>
                
                <button type="button" className="btn-google">
                  <FcGoogle className="google-icon" aria-hidden="true" />
                  Sign in with Google
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <a href="#" style={{ 
                  color: '#143f86', 
                  fontSize: '1rem', 
                  fontWeight: '700', 
                  textDecoration: 'none',
                  fontFamily: 'Syne, sans-serif'
                }}>
                  Use OTP to Login
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
