import React, { useState } from "react";
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiX,
  FiCheck,
  FiUserCheck,
  FiCheckCircle,
  FiBriefcase,
} from "react-icons/fi";
import { FaGraduationCap, FaWhatsapp } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import mavenLogo from "../../assets/maven-logo-BdiSsfJk.svg";
import "./AuthModals.css";

import { useAuth } from "../AuthContext";

export default function SignUp({ isOpen, onClose, openLogin }) {
  const { register } = useAuth();
  const [workStatus, setWorkStatus] = useState("experienced"); // 'experienced' | 'fresher'
  const [updatesAccepted, setUpdatesAccepted] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, phone } = formData;

    if (!name || !email || !password || !phone) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setError("");

    // Map workStatus to designation as expected by server
    const designation = workStatus === "experienced" ? "Experienced Professional" : "Fresher / Student";

    const result = await register({
      name,
      email,
      password,
      phone,
      designation
    });

    if (result.success) {
      onClose();
    } else {
      setError(result.message || "Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="register-modal-overlay">
      <div className="register-modal-backdrop" onClick={onClose}></div>
      <div className="register-modal-content">
        <button 
          className="register-modal-close" 
          onClick={onClose}
          aria-label="Close Modal"
        >
          <FiX aria-hidden="true" />
        </button>
        
        <div className="register-layout">
          {/* Left Column: Visuals & Benefits */}
          <div className="register-left">
            <div className="register-logo-container">
              <img src={mavenLogo} alt="Maven Jobs" className="register-modal-logo" />
            </div>
            <div className="register-left-content">
              <div className="register-illustration">
                <div className="illustration-circle">
                  <FiUserCheck aria-hidden="true" className="illustration-icon" />
                  <div className="illustration-accent"></div>
                  <div className="illustration-accent-2"></div>
                </div>
              </div>
              
              <h3>Join our community of professionals</h3>
              
              <ul className="register-benefits-list">
                <li>
                  <FiCheckCircle className="benefit-icon" aria-hidden="true" />
                  <span>Build a standout profile for top recruiters</span>
                </li>
                <li>
                  <FiCheckCircle className="benefit-icon" aria-hidden="true" />
                  <span>Get personalized job alerts daily</span>
                </li>
                <li>
                  <FiCheckCircle className="benefit-icon" aria-hidden="true" />
                  <span>Accelerate your career growth with Maven</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Right Column: Form */}
          <div className="register-right">
            <div className="register-header-top">
              <h2>Create Profile</h2>
              <div className="register-login-link">
                Joined already? <button 
                  type="button" 
                  className="link-button" 
                  onClick={() => {
                    onClose();
                    if (openLogin) openLogin();
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
                  Login here
                </button>
              </div>
            </div>
            <p className="register-sub">India's leading platform for career opportunities</p>
            
            <form className="register-form" onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label>FULL NAME <span className="required-dot"></span></label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" aria-hidden="true" />
                  <input 
                    type="text" 
                    name="name"
                    placeholder="What is your name?" 
                    className="register-input" 
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="auth-form-group">
                <label>EMAIL ID <span className="required-dot"></span></label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" aria-hidden="true" />
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Tell us your Email ID" 
                    className="register-input" 
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <span className="input-hint">We'll send relevant jobs and updates to this email</span>
              </div>
              
              <div className="auth-form-group">
                <label>PASSWORD <span className="required-dot"></span></label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" aria-hidden="true" />
                  <input 
                    type="password" 
                    name="password"
                    placeholder="(Minimum 6 characters)" 
                    className="register-input" 
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                <span className="input-hint">Use a strong password to protect your account</span>
              </div>
              
              <div className="auth-form-group">
                <label>MOBILE NUMBER <span className="required-dot"></span></label>
                <div className="input-wrapper mobile-wrapper">
                  <span className="mobile-prefix">+91</span>
                  <input 
                    type="tel" 
                    name="phone"
                    placeholder="Enter your mobile number" 
                    className="register-input mobile-input" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={10}
                  />
                </div>
                <span className="input-hint">Recruiters will contact you on this number</span>
              </div>
              
              <div className="auth-form-group">
                <label>WORK STATUS <span className="required-dot"></span></label>
                <div className="work-status-cards">
                  <div 
                    className={`work-status-card ${workStatus === 'experienced' ? 'active' : ''}`}
                    onClick={() => setWorkStatus('experienced')}
                  >
                    <div className="ws-card-content">
                      <div className="ws-card-title">Experienced</div>
                      <div className="ws-card-desc">I have work experience</div>
                    </div>
                    <FiBriefcase className="ws-card-icon" aria-hidden="true" />
                    {workStatus === 'experienced' && <div className="ws-card-check"><FiCheck aria-hidden="true" /></div>}
                  </div>
                  
                  <div 
                    className={`work-status-card ${workStatus === 'fresher' ? 'active' : ''}`}
                    onClick={() => setWorkStatus('fresher')}
                  >
                    <div className="ws-card-content">
                      <div className="ws-card-title">Fresher</div>
                      <div className="ws-card-desc">I am a student/grad</div>
                    </div>
                    <FaGraduationCap className="ws-card-icon" aria-hidden="true" />
                    {workStatus === 'fresher' && <div className="ws-card-check"><FiCheck aria-hidden="true" /></div>}
                  </div>
                </div>
              </div>
              
              <div className="updates-checkbox">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={updatesAccepted} 
                    onChange={(e) => setUpdatesAccepted(e.target.checked)} 
                  />
                  <span className="checkmark">
                    {updatesAccepted && <FiCheck aria-hidden="true" />}
                  </span>
                  <span className="checkbox-text">Send me important updates via SMS, Email, and <span className="whatsapp-text"><FaWhatsapp /> WhatsApp</span></span>
                </label>
              </div>
              
              <div className="register-terms">
                By registering, you agree to our <a href="#" style={{color: '#143f86'}}>Terms</a> & <a href="#" style={{color: '#143f86'}}>Privacy Policy</a>
              </div>
              
              {error && <div style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: '600', marginTop: '8px' }}>{error}</div>}

              <div className="register-actions-row">
                <button type="submit" className="btn-register-submit" disabled={isLoading}>
                  {isLoading ? "Creating Profile..." : "Register Now"}
                </button>
                
                <div className="auth-separator">
                  <span>Or</span>
                </div>
                
                <button type="button" className="btn-google">
                  <FcGoogle className="google-icon" aria-hidden="true" />
                  Sign up with Google
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
