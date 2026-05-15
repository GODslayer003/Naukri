import React, { useState, useEffect } from 'react';
import { 
  FiX, FiBriefcase, FiMapPin, FiZap, FiCheckCircle, 
  FiInfo, FiStar, FiChevronRight, FiClock, FiSend, FiUsers
} from 'react-icons/fi';
import './EarlyAccessModal.css';

const MOCK_EARLY_ROLES = [
  {
    id: 1,
    title: "Developer",
    company: "Top Rated Firm in FinTech Sector",
    rating: 3.5,
    tags: ["Foreign MNC"],
    exp: "0-1 Yrs",
    salary: "3-5 Lacs P.A.",
    location: "Bangalore/Bengaluru",
    skills: ["Java", "CSS", "Python", "SQL", "C++", "Javascript", "Database", "HTML"],
    posted: "5d ago",
    logos: ['K', 'T', 'E', 'A', 'J', 'P', 'P']
  },
  {
    id: 2,
    title: "React Js Developer",
    company: "Top B2C Company in Retail Domain",
    rating: 3.5,
    tags: ["Corporate", "Product", "Highly Rated by Women"],
    exp: "0-5 Yrs",
    salary: "4-7 Lacs P.A.",
    location: "Pune",
    skills: ["Node.Js", "Angular", "Mern", "PHP", "React.Js", "Java", "CSS", "Node"],
    posted: "7h ago",
    logos: ['B', 'F', 'F', 'R', 'B', 'Y', 'S']
  },
  {
    id: 3,
    title: "Python Software Developer",
    company: "Mid-sized B2B IT & software solutions globally",
    rating: 3.5,
    tags: ["Startup", "Service"],
    exp: "0-3 Yrs",
    salary: "1-6 Lacs P.A.",
    location: "Kochi/Cochin, Chennai, Coimbatore, Bangalore...",
    skills: ["React.Js", "Angular", "Python", "Front End", "Django", "Javascript", "Node.Js", "Flask"],
    posted: "8h ago",
    logos: ['M', 'L', 'S', 'G', 'I', 'V', 'D']
  },
  {
    id: 4,
    title: "Fullstack Developer",
    company: "Firm in IT Services Sector",
    rating: 2.5,
    tags: ["Corporate", "Service"],
    exp: "0-2 Yrs",
    salary: "1-4 Lacs P.A.",
    location: "Mumbai, Thane, Pune",
    skills: ["Rest Api Integration", "Docker", "Postgresql", "Javascript", "AWS", "Backend", "GIT"],
    posted: "5d ago",
    logos: ['V', 'O', 'A', 'S', 'L', 'I', 'M']
  }
];

export default function EarlyAccessModal({ isOpen, onClose }) {
  const [sharedInterests, setSharedInterests] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!isOpen) return null;

  const handleShareInterest = (id) => {
    if (sharedInterests.includes(id)) return;
    setSharedInterests([...sharedInterests, id]);
    setNotification("Interest shared successfully");
  };

  return (
    <div className="ea-modal-overlay" onClick={onClose}>
      <div className="ea-modal-container" onClick={e => e.stopPropagation()}>
        <button className="ea-modal-close" onClick={onClose}><FiX size={24} /></button>
        
        <div className="ea-modal-header">
          <h1>{MOCK_EARLY_ROLES.length} Early access roles from top companies</h1>
          <p>Exclusive opportunities based on what recruiters are searching for, even before they post a job on MavenJobs</p>
        </div>

        <div className="ea-modal-content">
          {/* Main List */}
          <div className="ea-roles-list">
            {MOCK_EARLY_ROLES.map(role => (
              <div key={role.id} className="ea-role-card">
                <div className="ea-role-header">
                  <div className="ea-role-info">
                    <h3 className="ea-role-title">{role.title}</h3>
                    <p className="ea-role-company">{role.company}</p>
                    <div className="ea-role-tags-row">
                      <span className="ea-rating-pill"><FiStar size={12} /> {role.rating.toFixed(1)}+</span>
                      {role.tags.map(tag => <span key={tag} className="ea-tag-pill">{tag}</span>)}
                    </div>
                  </div>
                  <span className="ea-posted-time">{role.posted}</span>
                </div>

                <div className="ea-role-meta">
                  <div className="ea-meta-item"><FiBriefcase size={14} /> {role.exp}</div>
                  <div className="ea-meta-item">₹ {role.salary}</div>
                  <div className="ea-meta-item"><FiMapPin size={14} /> {role.location}</div>
                </div>

                <div className="ea-skills-list">
                  {role.skills.map((s, i) => (
                    <span key={i} className="ea-skill-dot">{s}</span>
                  ))}
                </div>

                <div className="ea-hiring-row">
                  <div className="ea-hiring-logos">
                    <p>Hiring for one of these companies</p>
                    <div className="ea-logos-wrap">
                      {role.logos.map((l, i) => (
                        <div key={i} className="ea-logo-circle">{l}</div>
                      ))}
                    </div>
                  </div>
                  <button 
                    className={`ea-share-btn ${sharedInterests.includes(role.id) ? 'shared' : ''}`}
                    onClick={() => handleShareInterest(role.id)}
                  >
                    {sharedInterests.includes(role.id) ? (
                      <><FiCheckCircle size={16} /> Interest shared</>
                    ) : (
                      'Share interest'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="ea-modal-sidebar">
            <div className="ea-sidebar-card">
              <div className="ea-sidebar-icon-box">
                <FiSend size={32} color="#2563eb" />
                <div className="ea-sidebar-dot" />
              </div>
              <h3>What's unique about early access roles?</h3>
              
              <div className="ea-feat-list">
                <div className="ea-feat-item">
                  <FiCheckCircle size={18} className="ea-feat-check" />
                  <div>
                    <h4>Discover hidden roles from top companies</h4>
                    <p>Share interest for roles that haven't even been posted</p>
                  </div>
                </div>
                <div className="ea-feat-item">
                  <FiCheckCircle size={18} className="ea-feat-check" />
                  <div>
                    <h4>Share early interest</h4>
                    <p>Stay ahead in the game by sharing an early interest to fresher recruiter searches</p>
                  </div>
                </div>
                <div className="ea-feat-item">
                  <FiCheckCircle size={18} className="ea-feat-check" />
                  <div>
                    <h4>Get noticed by recruiters</h4>
                    <p>If your profile is a match, it will get better visibility on their search results</p>
                  </div>
                </div>
              </div>

              <div className="ea-sidebar-divider" />
              
              <div className="ea-sidebar-faq">
                <h4>Can I know the exact company for these roles?</h4>
                <p>These roles are confidential, but we can assure you that they're from one of the mentioned companies. The recruiter will share more details if you're shortlisted.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Notification */}
        {notification && (
          <div className="ea-notification">
            <FiCheckCircle size={18} />
            {notification}
          </div>
        )}
      </div>
    </div>
  );
}
