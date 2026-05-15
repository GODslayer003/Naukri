import React, { useState } from 'react';
import { 
  FiBriefcase, FiMapPin, FiClock, FiBookmark, FiChevronRight, 
  FiX, FiPlus, FiEye, FiCheck, FiInfo, FiEdit2, FiShield, FiSend, FiStar, FiZap, FiUsers, FiCalendar,
  FiAward, FiBookOpen, FiPlay, FiTarget, FiMessageSquare
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const MOCK_RECOMMENDED_JOBS = [
  {
    id: 1,
    title: "Process Coordinator",
    company: "Finvin Advisor",
    rating: 2.3,
    reviews: 3,
    exp: "0-1 Yrs",
    salary: "1.2-2.4 Lacs PA",
    location: "Mumbai(Andheri)",
    desc: "Responsibilities:* Ensure timely follow-ups on tasks* Maintain accurate records an...",
    tags: ["Office Coordination", "Coordination", "Follow Ups", "Process", "UPS", "Office"],
    posted: "2 Days Ago",
    logoCode: "F",
    logoBg: "#EFF6FF",
    logoCol: "#2563EB"
  },
  {
    id: 2,
    title: "Java Developer",
    company: "Ignitefortune Tech",
    rating: 4.1,
    reviews: 12,
    exp: "0-1 Yrs",
    salary: "Not disclosed",
    location: "Remote",
    desc: "Internship Experience or experience on self accomplished projects is preferred Pr...",
    tags: ["Java", "JDBC", "Spring Boot", "Microservices", "Web Services", "Hibernate", "MySQL", "SQL"],
    posted: "3 Days Ago",
    logoCode: "I",
    logoBg: "#F5F3FF",
    logoCol: "#7C3AED"
  },
  {
    id: 3,
    title: "Sales Coordinator",
    company: "Siana International",
    rating: 4.6,
    reviews: 2,
    exp: "0-2 Yrs",
    salary: "2-2.5 Lacs PA",
    location: "Pune(Model Colony)",
    desc: "Processing orders & tracking delivery Primary POC for clients, handling inquiries, ...",
    tags: ["Sales Coordination", "Proforma Invoice", "Sales Support", "Sales Order Processing"],
    posted: "2 Days Ago",
    logoCode: "S",
    logoBg: "#FEF2F2",
    logoCol: "#EF4444"
  },
  {
    id: 4,
    title: "Java Developer",
    company: "Jugla Technologies",
    rating: 3.8,
    reviews: 45,
    exp: "0-1 Yrs",
    salary: "Not disclosed",
    location: "Remote",
    desc: "Candidate with Prior Self Project Or Internship ExperienceMust have HandsOn Co...",
    tags: ["Java", "JDBC", "Spring Boot", "MySQL", "Microservices", "Web Services", "SQL"],
    posted: "6 Days Ago",
    logoCode: "J",
    logoBg: "#EEF2FF",
    logoCol: "#4F46E5"
  },
  {
    id: 5,
    title: "R & D Engineer",
    company: "ABB",
    rating: 4.0,
    reviews: 3397,
    exp: "0-3 Yrs",
    salary: "Not disclosed",
    location: "Hybrid - Bengaluru",
    desc: "Must have exposure to agile software development methodologies, with good trac...",
    tags: ["Research and Development", "plc scada", "test automation", "jmeter", "java", "automation"],
    posted: "2 Days Ago",
    logoCode: "ABB",
    logoBg: "#F1F5F9",
    logoCol: "#DC2626"
  }
];

export default function RecommendedJobs({ onBack }) {
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('Profile (15)');
  const [isWebinarModalOpen, setIsWebinarModalOpen] = useState(false);

  const tabs = [
    { name: 'Applies (5)', count: 5 },
    { name: 'Profile (15)', count: 15 },
    { name: 'Preferences (3)', count: 3 },
    { name: 'You might like (6)', count: 6 }
  ];

  const handleToggleJob = (jobId) => {
    setSelectedJobs(prev => {
      if (prev.includes(jobId)) return prev.filter(id => id !== jobId);
      if (prev.length >= 10) return prev;
      return [...prev, jobId];
    });
  };

  return (
    <div className="rj-root">
      <div className="rj-container">
        
        {/* Header */}
        <div className="rj-header">
          <div className="rj-header-left">
            <h1 className="rj-title">Recommended jobs for you</h1>
          </div>
          
          <div className="rj-header-right">
            <span className="rj-helper-text">Select up to 10 jobs to apply</span>
            <button 
              className={`rj-apply-main ${selectedJobs.length > 0 ? 'active' : ''}`}
              disabled={selectedJobs.length === 0}
            >
              Apply {selectedJobs.length} Job{selectedJobs.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="rj-tabs-wrap">
          {tabs.map(tab => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`rj-tab ${activeTab === tab.name ? 'active' : ''}`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rj-layout">
          
          {/* Left Column */}
          <div className="rj-list">
            {MOCK_RECOMMENDED_JOBS.map(job => (
              <div 
                key={job.id} 
                className={`rj-job-card ${selectedJobs.includes(job.id) ? 'selected' : ''}`}
              >
                <div className="rj-job-row">
                  <div className="rj-check-col">
                    <label className="rj-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => handleToggleJob(job.id)}
                      />
                      <span className="rj-checkmark"><FiCheck size={12} /></span>
                    </label>
                  </div>

                  <div className="rj-job-content">
                    <div className="rj-job-header">
                      <div className="rj-job-info">
                        <h3 className="rj-job-title">{job.title}</h3>
                        <div className="rj-company-row">
                          <span className="rj-company-name">{job.company}</span>
                          {job.rating && (
                            <span className="rj-rating-pill">
                              <FiStar size={10} /> {job.rating} <span>|</span> {job.reviews} Reviews
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="rj-job-logo" style={{ background: job.logoBg, color: job.logoCol }}>
                        {job.logoCode}
                      </div>
                    </div>

                    <div className="rj-job-meta">
                      <span><FiBriefcase size={13} /> {job.exp}</span>
                      <span><FiZap size={13} /> {job.salary}</span>
                      <span><FiMapPin size={13} /> {job.location}</span>
                    </div>

                    <div className="rj-job-desc">
                      <FiEdit2 size={13} />
                      <p>{job.desc}</p>
                    </div>

                    <div className="rj-job-tags">
                      {job.tags.map(tag => (
                        <span key={tag} className="rj-tag">{tag}</span>
                      ))}
                    </div>

                    <div className="rj-job-footer">
                      <span className="rj-posted">{job.posted}</span>
                      <div className="rj-job-actions">
                        <button className="rj-action-btn"><FiEye size={15} /> Hide</button>
                        <button className="rj-action-btn"><FiBookmark size={15} /> Save</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="rj-disclaimer">
              IEIL ensures site authenticity. <br />
              <Link to="#">Security Guidelines</Link> · <Link to="#">Terms & Conditions</Link>
            </div>
          </div>

          {/* Right Column */}
          <div className="rj-sidebar">
            
            <div className="rj-card">
              <div className="rj-card-head">
                <h3>Add preferences to get matching jobs</h3>
              </div>
              <div className="rj-pref-group">
                <div className="rj-pref-item">
                  <div className="rj-pref-label">PREFERRED JOB ROLE <FiEdit2 size={12} /></div>
                  <div className="rj-pref-tags">
                    {['Front End', 'MERN Stack', 'Software Developer'].map(r => <span key={r}>{r}</span>)}
                  </div>
                </div>
                <div className="rj-pref-item">
                  <div className="rj-pref-label">PREFERRED LOCATION <FiEdit2 size={12} /></div>
                  <div className="rj-pref-tags">
                    {['Pune', 'Noida', 'Mumbai', 'Bengaluru'].map(l => <span key={l}>{l}</span>)}
                  </div>
                </div>
                <div className="rj-pref-item">
                  <div className="rj-pref-label">PREFERRED SALARY <FiEdit2 size={12} /></div>
                  <div className="rj-pref-val">₹ 5,00,000</div>
                </div>
              </div>
            </div>

            <div className="rj-card rj-webinar-card" onClick={() => setIsWebinarModalOpen(true)} style={{ cursor: 'pointer' }}>
              <div className="rj-webinar-head">
                <h3>Join webinar for career growth</h3>
                <p>Powered by <span>Coding Ninjas</span></p>
              </div>
              <div className="rj-webinar-img">
                <img src="https://images.unsplash.com/photo-1591115765373-520b7a0d4c8d?q=80&w=2070&auto=format&fit=crop" alt="Webinar" />
                <div className="rj-webinar-overlay">
                  <span className="rj-webinar-badge">LIVE WORKSHOP</span>
                  <div className="rj-webinar-info">
                    <div className="rj-webinar-timer">Entry closes in 9h</div>
                    <h4>Multi-Agent AI Systems: Live Workshop for 25L+ CTC</h4>
                  </div>
                </div>
              </div>
              <div className="rj-webinar-body">
                <div className="rj-webinar-tags">
                  <span>Interview Prep</span>
                  <span>Career Guidance</span>
                </div>
                <div className="rj-webinar-stats">
                  <span><FiClock size={12} /> 1 May, 8:30 PM</span>
                  <span><FiUsers size={12} /> 54 Enrolled</span>
                </div>
                <div className="rj-webinar-foot">
                  <button className="rj-webinar-cta" onClick={(e) => { e.stopPropagation(); setIsWebinarModalOpen(true); }}><FiSend size={13} /> Learn from experts</button>
                  <button className="rj-text-btn" onClick={(e) => { e.stopPropagation(); setIsWebinarModalOpen(true); }}>Details</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Webinar Modal */}
      {isWebinarModalOpen && (
        <div className="rj-modal-overlay" onClick={() => setIsWebinarModalOpen(false)}>
          <div className="rj-modal-content" onClick={e => e.stopPropagation()}>
            {/* Header / Close */}
            <div className="rj-modal-nav">
              <div className="rj-nav-left">
                <span className="rj-nav-powered">Powered by <span className="highlight">Coding Ninjas</span></span>
              </div>
              <button className="rj-modal-close-btn" onClick={() => setIsWebinarModalOpen(false)}>
                <FiX size={20} />
              </button>
            </div>
            
            <div className="rj-modal-scroll-area">
              <div className="rj-modal-hero">
                <div className="rj-hero-content">
                  <div className="rj-hero-tags">
                    <span className="rj-tag-live"><span className="dot"></span> LIVE MASTERCLASS</span>
                    <span className="rj-tag-time"><FiClock /> Starting in 9h : 12m</span>
                  </div>
                  <h2>Mastering Multi-Agent AI Systems: The 2026 Career Roadmap</h2>
                  <p>Scale your career to 25L+ CTC by mastering autonomous AI agents, LLM orchestration, and production-ready AI architectures.</p>
                  <div className="rj-hero-features">
                    <span><FiAward /> Industry Certificate</span>
                    <span><FiPlay /> Live Hands-on Lab</span>
                    <span><FiMessageSquare /> Q&A with Experts</span>
                  </div>
                </div>
                <div className="rj-hero-visual">
                  <div className="rj-visual-card">
                    <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop" alt="AI Visual" />
                    <div className="rj-visual-glass">
                      <FiZap size={24} />
                      <span>Next-Gen AI</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rj-modal-grid">
                <div className="rj-modal-main">
                  {/* What you'll learn */}
                  <section className="rj-section">
                    <h3 className="rj-section-title">What you'll master</h3>
                    <div className="rj-learning-grid">
                      {[
                        { title: 'Agent Architecture', desc: 'Design multi-agent systems using AutoGen & CrewAI.', icon: <FiTarget /> },
                        { title: 'LLM Orchestration', desc: 'Master LangChain for production-grade AI apps.', icon: <FiZap /> },
                        { title: 'AI Infrastructure', desc: 'Deploy scalable AI models on AWS & Azure.', icon: <FiBriefcase /> },
                        { title: 'Career Strategy', desc: 'Inside secrets to land high-paying AI roles.', icon: <FiStar /> }
                      ].map((item, i) => (
                        <div key={i} className="rj-learn-card">
                          <div className="rj-learn-icon">{item.icon}</div>
                          <div className="rj-learn-info">
                            <h5>{item.title}</h5>
                            <p>{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Agenda */}
                  <section className="rj-section">
                    <h3 className="rj-section-title">Workshop Agenda</h3>
                    <div className="rj-agenda">
                      <div className="rj-agenda-item">
                        <div className="rj-agenda-time">08:30 PM</div>
                        <div className="rj-agenda-desc">Introduction to Multi-Agent Paradigms</div>
                      </div>
                      <div className="rj-agenda-item">
                        <div className="rj-agenda-time">09:15 PM</div>
                        <div className="rj-agenda-desc">Building your first Autonomous Agent (Live Demo)</div>
                      </div>
                      <div className="rj-agenda-item">
                        <div className="rj-agenda-time">10:00 PM</div>
                        <div className="rj-agenda-desc">Salary Negotiation & Portfolio Review for AI Roles</div>
                      </div>
                    </div>
                  </section>

                  {/* Experts */}
                  <section className="rj-section">
                    <h3 className="rj-section-title">Learn from the Best</h3>
                    <div className="rj-experts-row">
                      <div className="rj-expert-item">
                        <div className="rj-expert-photo" style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)' }}>AK</div>
                        <div className="rj-expert-detail">
                          <h6>Aman Khurana</h6>
                          <span>Lead AI Engineer @ Google</span>
                        </div>
                      </div>
                      <div className="rj-expert-item">
                        <div className="rj-expert-photo" style={{ background: 'linear-gradient(135deg, #10b981, #065f46)' }}>SP</div>
                        <div className="rj-expert-detail">
                          <h6>Sneha Patil</h6>
                          <span>Senior ML Architect @ Microsoft</span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="rj-modal-side">
                  <div className="rj-sticky-box">
                    <div className="rj-box-header">
                      <div className="rj-price-wrap">
                        <span className="rj-price-tag">FREE</span>
                        <span className="rj-price-old">₹1,499</span>
                      </div>
                      <div className="rj-slot-tag">🔥 Only 12 slots left!</div>
                    </div>
                    
                    <div className="rj-box-meta">
                      <div className="rj-meta-item"><FiCalendar /> 1st May, 2026</div>
                      <div className="rj-meta-item"><FiClock /> 08:30 PM - 10:30 PM</div>
                    </div>

                    <button className="rj-btn-enroll">Reserve My Free Spot</button>
                    
                    <div className="rj-social-proof">
                      <div className="rj-avatars-mini">
                        {[1,2,3,4].map(i => <div key={i} className="rj-av-mini" style={{ zIndex: 10-i }} />)}
                        <span className="rj-av-text">+1.2k joined</span>
                      </div>
                      <div className="rj-rating-mini"><FiStar /> 4.9/5 (240 reviews)</div>
                    </div>

                    <div className="rj-box-footer">
                      <FiShield /> 100% Secure Registration
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .rj-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: rjFadeIn 0.3s ease;
        }
        .rj-modal-content {
          background: #ffffff;
          width: 100%;
          max-width: 1000px;
          height: 90vh;
          border-radius: 32px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.25);
          animation: rjSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .rj-modal-nav {
          padding: 20px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
          background: #fff;
          z-index: 10;
        }
        .rj-nav-powered {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }
        .rj-nav-powered .highlight {
          color: #f59e0b;
          font-weight: 700;
        }
        .rj-modal-close-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: none;
          background: #f8faFc;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rj-modal-close-btn:hover {
          background: #fee2e2;
          color: #ef4444;
          transform: rotate(90deg);
        }
        .rj-modal-scroll-area {
          flex: 1;
          overflow-y: auto;
          padding: 40px;
        }
        .rj-modal-hero {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 48px;
          margin-bottom: 56px;
          align-items: center;
        }
        .rj-hero-tags {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        .rj-tag-live {
          background: #fef2f2;
          color: #ef4444;
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .rj-tag-live .dot {
          width: 6px;
          height: 6px;
          background: #ef4444;
          border-radius: 50%;
          animation: rjPulse 1.5s infinite;
        }
        .rj-tag-time {
          background: #f0f9ff;
          color: #0ea5e9;
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .rj-hero-content h2 {
          font-size: 36px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
          margin-bottom: 20px;
          letter-spacing: -0.02em;
        }
        .rj-hero-content p {
          font-size: 17px;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .rj-hero-features {
          display: flex;
          gap: 24px;
        }
        .rj-hero-features span {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #64748b;
          font-weight: 600;
        }
        .rj-hero-features span svg {
          color: #2563eb;
        }
        .rj-hero-visual {
          position: relative;
        }
        .rj-visual-card {
          width: 100%;
          height: 240px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(37, 99, 235, 0.15);
          position: relative;
        }
        .rj-visual-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .rj-visual-glass {
          position: absolute;
          bottom: 16px;
          left: 16px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          padding: 12px 20px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
          color: #0f172a;
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .rj-modal-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 56px;
        }
        .rj-section {
          margin-bottom: 48px;
        }
        .rj-section-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rj-learning-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .rj-learn-card {
          padding: 20px;
          background: #f8fafc;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          transition: all 0.2s;
        }
        .rj-learn-card:hover {
          background: #fff;
          border-color: #e2e8f0;
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          transform: translateY(-2px);
        }
        .rj-learn-icon {
          width: 40px;
          height: 40px;
          background: #eff6ff;
          color: #2563eb;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .rj-learn-info h5 {
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }
        .rj-learn-info p {
          font-size: 13px;
          color: #64748b;
          line-height: 1.5;
        }
        .rj-agenda {
          background: #f8fafc;
          border-radius: 24px;
          padding: 8px;
        }
        .rj-agenda-item {
          display: flex;
          padding: 20px 24px;
          border-radius: 16px;
          gap: 32px;
        }
        .rj-agenda-item:not(:last-child) {
          border-bottom: 1px solid #f1f5f9;
        }
        .rj-agenda-time {
          font-size: 14px;
          font-weight: 800;
          color: #2563eb;
          white-space: nowrap;
        }
        .rj-agenda-desc {
          font-size: 14px;
          color: #334155;
          font-weight: 600;
        }
        .rj-experts-row {
          display: flex;
          gap: 24px;
        }
        .rj-expert-item {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #fff;
          border: 1px solid #f1f5f9;
          border-radius: 20px;
        }
        .rj-expert-photo {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 800;
          font-size: 16px;
        }
        .rj-expert-detail h6 {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .rj-expert-detail span {
          font-size: 12px;
          color: #64748b;
        }
        .rj-sticky-box {
          position: sticky;
          top: 0;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 28px;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }
        .rj-box-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .rj-price-tag {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
        }
        .rj-price-old {
          font-size: 15px;
          color: #94a3b8;
          text-decoration: line-through;
          margin-left: 8px;
        }
        .rj-slot-tag {
          font-size: 11px;
          font-weight: 700;
          color: #ef4444;
          background: #fef2f2;
          padding: 4px 10px;
          border-radius: 8px;
        }
        .rj-box-meta {
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .rj-meta-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #475569;
          font-weight: 600;
        }
        .rj-meta-item svg {
          color: #94a3b8;
        }
        .rj-btn-enroll {
          width: 100%;
          padding: 16px;
          border-radius: 16px;
          background: #2563eb;
          color: #fff;
          border: none;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 24px;
        }
        .rj-btn-enroll:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.3);
        }
        .rj-social-proof {
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #f1f5f9;
        }
        .rj-avatars-mini {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }
        .rj-av-mini {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #e2e8f0;
          border: 2px solid #fff;
          margin-right: -10px;
        }
        .rj-av-text {
          margin-left: 16px;
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
        }
        .rj-rating-mini {
          font-size: 12px;
          color: #475569;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .rj-rating-mini svg {
          color: #f59e0b;
        }
        .rj-box-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
        }
        @keyframes rjFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes rjSlideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rjPulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.4; }
          100% { transform: scale(1); opacity: 1; }
        }
        .rj-modal-scroll-area::-webkit-scrollbar {
          width: 6px;
        }
        .rj-modal-scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }
        .rj-modal-scroll-area::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
