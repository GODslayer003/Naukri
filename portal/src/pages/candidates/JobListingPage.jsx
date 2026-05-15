import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiSearch, FiMapPin, FiBriefcase, FiChevronDown, FiFilter,
  FiCheck, FiClock, FiBookmark, FiArrowRight, FiTrendingUp, FiAward,
  FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { FaRupeeSign, FaStar, FaFacebookF, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useAuth } from "../../AuthContext";
import { EXTENDED_JOBS as JOBS, TOP_CATEGORIES } from "../../data/jobs";
import mavenLogo from '../../../assets/maven-logo-BdiSsfJk.svg';
import "./JobListingPage.css";

// Data moved to data/jobs.js
const FILTER_CATEGORIES = [
  {
    id: "dept",
    label: "Department",
    options: ["Engineering", "Product", "Design", "Marketing", "Sales", "HR", "Finance", "Legal", "Operations", "Customer Success"]
  },
  {
    id: "mode",
    label: "Work Mode",
    options: ["Work from office", "Remote", "Hybrid"]
  },
  {
    id: "loc",
    label: "Location",
    options: ["Bengaluru", "Mumbai", "Pune", "Delhi / NCR", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Gurugram", "Noida"]
  },
  {
    id: "salaryRange",
    label: "Salary",
    options: ["0–3 Lakhs", "3–6 Lakhs", "6–10 Lakhs", "10–15 Lakhs", "15+ Lakhs", "25+ Lakhs", "50+ Lakhs"]
  },
  {
    id: "type",
    label: "Company Type",
    options: ["Corporate", "Foreign MNC", "Indian MNC", "Startup", "Govt / PSU"]
  },
];

export default function JobListingPage() {
  const navigate = useNavigate();
  const scrollRef = React.useRef(null);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");
  const [showSort, setShowSort] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // stores catId if modal is open
  const [draftFilters, setDraftFilters] = useState({}); // local state for modal
  const [expRange, setExpRange] = useState(0);

  const JOBS_PER_PAGE = 15;
  const { user, logout, openLogin, openRegister } = useAuth();

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -250, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 250, behavior: "smooth" });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleFilter = (catId, option) => {
    setFilters(prev => {
      const cur = prev[catId] || [];
      const updated = cur.includes(option) ? cur.filter(o => o !== option) : [...cur, option];
      return { ...prev, [catId]: updated };
    });
    setCurrentPage(1);
  };

  const openFilterModal = (catId) => {
    setDraftFilters({ ...filters }); // Copy current filters to draft
    setActiveModal(catId);
  };

  const toggleDraftFilter = (catId, option) => {
    setDraftFilters(prev => {
      const cur = prev[catId] || [];
      const updated = cur.includes(option) ? cur.filter(o => o !== option) : [...cur, option];
      return { ...prev, [catId]: updated };
    });
  };

  const applyModalFilters = () => {
    setFilters(draftFilters);
    setCurrentPage(1);
    setActiveModal(null);
  };

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [activeModal]);

  const hasFilters = Object.values(filters).some(arr => arr.length > 0);

  // Filter and Sort Logic
  const filteredJobs = JOBS.filter(job => {
    // Search match
    if (search && !job.title.toLowerCase().includes(search.toLowerCase()) && !job.company.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    // Category match
    for (const [catId, selectedOpts] of Object.entries(filters)) {
      if (selectedOpts.length > 0) {
        const jobVal = job[catId];
        if (!selectedOpts.includes(jobVal)) return false;
      }
    }

    // Experience match
    if (expRange > 0) {
      // Parse job exp (e.g., "3–6 Yrs")
      const minJobExp = parseInt(job.exp.split("–")[0]) || 0;
      if (minJobExp > expRange) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === "newest") return b.date - a.date;
    if (sortBy === "salary") {
      // Very crude salary sort
      const getSal = s => parseInt(s.split("–")[0]) || 0;
      return getSal(b.salary) - getSal(a.salary);
    }
    return a.id - b.id; // relevance/default
  });

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const currentJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  );

  return (
    <div className="jlp-root">
      {/* ── Header ── */}
      <header className={`jlp-header${scrolled ? " scrolled" : ""}`}>
        <div className="jlp-header-inner">
          <Link to="/">
            <img src={mavenLogo} alt="Maven Jobs" className="jlp-logo" />
          </Link>

          <div className="jlp-search-bar">
            <div className="jlp-search-field">
              <FiSearch size={16} />
              <input
                type="text"
                placeholder="Job title, skills, or company"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="jlp-search-field">
              <FiMapPin size={16} />
              <input type="text" placeholder="Location" />
            </div>
            <button className="jlp-search-btn" aria-label="Search">
              <FiSearch size={18} />
            </button>
          </div>

          <div className="jlp-header-actions">
            {user ? (
              <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#333', fontWeight: '600', cursor: 'pointer' }}>
                  <img src={user.profilePic || "https://i.pinimg.com/736x/26/89/19/268919fb14ab9fb609647d7011140ab7.jpg"} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb' }} />
                </Link>
                <button className="jlp-btn-login" onClick={logout}>Logout</button>
              </div>
            ) : (
              <>
                <button className="jlp-btn-login" onClick={openLogin}>Login</button>
                <button className="jlp-btn-register" onClick={openRegister}>Register Free</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Top Categories Strip ── */}
      <div className="jlp-top-categories-wrapper">
        <div className="jlp-top-categories-inner">
          <button className="jlp-scroll-btn left" onClick={scrollLeft}>
            <FiChevronLeft size={20} />
          </button>

          <div className="jlp-top-categories-container" ref={scrollRef}>
            {TOP_CATEGORIES.map((cat, idx) => (
              <div key={idx} className="jlp-top-category-chip">
                {cat}
              </div>
            ))}
          </div>

          <button className="jlp-scroll-btn right" onClick={scrollRight}>
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="jlp-body">

        {/* Left: Filters */}
        <aside className="jlp-sidebar">
          <div className="jlp-filter-card">
            <div className="jlp-filter-header">
              <div className="jlp-filter-title">
                <FiFilter size={16} /> All Filters
              </div>
              {hasFilters || expRange > 0 ? (
                <button className="jlp-clear-btn" onClick={() => { setFilters({}); setExpRange(0); }}>Clear All</button>
              ) : null}
            </div>

            {/* Experience Slider */}
            <div className="jlp-filter-group">
              <div className="jlp-filter-group-header">
                <div className="jlp-filter-group-label">Experience</div>
                <FiChevronDown size={14} className="jlp-group-arrow" />
              </div>
              <div className="jlp-exp-slider-container">
                <div className="jlp-exp-tooltip" style={{ left: `${(expRange / 30) * 100}%` }}>
                  {expRange}
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={expRange}
                  onChange={(e) => {
                    setExpRange(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    background: `linear-gradient(to right, #143f86 0%, #143f86 ${(expRange / 30) * 100}%, #e2e8f0 ${(expRange / 30) * 100}%, #e2e8f0 100%)`
                  }}
                  className="jlp-exp-slider"
                />
                <div className="jlp-exp-labels">
                  <span>0 Yrs</span>
                  <span>30 Yrs</span>
                </div>
              </div>
            </div>

            {/* Filter categories moved to data but let's keep them here for local logic if needed, 
                but for simplicity we'll just use a local constant or import them */}
            {FILTER_CATEGORIES.map(cat => {
              const displayOptions = cat.options.slice(0, 5);
              const hasMore = cat.options.length > 5;
              return (
                <div className="jlp-filter-group" key={cat.id}>
                  <div className="jlp-filter-group-label">{cat.label}</div>
                  <div className="jlp-filter-options">
                    {displayOptions.map(opt => {
                      const isChecked = (filters[cat.id] || []).includes(opt);
                      return (
                        <div
                          key={opt}
                          className="jlp-filter-option"
                          onClick={() => toggleFilter(cat.id, opt)}
                        >
                          <div className={`jlp-checkbox${isChecked ? " checked" : ""}`}>
                            {isChecked && <FiCheck strokeWidth={3} size={10} />}
                          </div>
                          <span className={`jlp-option-label${isChecked ? " active" : ""}`}>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                  {hasMore && (
                    <button
                      className="jlp-view-more-btn"
                      onClick={() => openFilterModal(cat.id)}
                    >
                      View More
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center: Job Listings */}
        <section className="jlp-center">
          <div className="jlp-results-bar">
            <div>
              <div className="jlp-results-title">
                {filteredJobs.length > 0 ? (
                  <>
                    {Math.min((currentPage - 1) * JOBS_PER_PAGE + 1, filteredJobs.length)} – {Math.min(currentPage * JOBS_PER_PAGE, filteredJobs.length)} of {filteredJobs.length} <span>Jobs Found</span>
                  </>
                ) : (
                  <span>No Jobs Found</span>
                )}
              </div>
              <div className="jlp-results-sub">Recommended based on your preferences</div>
            </div>
            <div className="jlp-sort-row">
              <span className="jlp-sort-label">Sort by:</span>
              <div className="jlp-sort-wrapper">
                <button className="jlp-sort-btn" onClick={() => setShowSort(!showSort)}>
                  {sortBy === "relevance" ? "Relevance" : sortBy === "newest" ? "Newest" : "Salary"} <FiChevronDown size={14} />
                </button>
                {showSort && (
                  <div className="jlp-sort-dropdown">
                    <div onClick={() => { setSortBy("relevance"); setShowSort(false); }}>Relevance</div>
                    <div onClick={() => { setSortBy("newest"); setShowSort(false); }}>Newest</div>
                    <div onClick={() => { setSortBy("salary"); setShowSort(false); }}>Salary</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {currentJobs.map(job => (
            <div key={job.id} className={`jlp-job-card${job.featured ? " featured" : ""}`}>
              {job.featured && <div className="jlp-featured-badge"><FaStar size={12} className="inline mr-1" /> Featured</div>}

              <div className="jlp-card-top">
                <div className="jlp-company-logo">{job.logo}</div>
                <div className="jlp-card-meta">
                  <div className="jlp-job-title">{job.title}</div>
                  <div className="jlp-company-row">
                    <span className="jlp-company-name">{job.company}</span>
                    <div className="jlp-rating-badge">
                      {job.rating} <FaStar size={9} />
                    </div>
                    <span className="jlp-reviews">{job.reviews} Reviews</span>
                  </div>
                </div>
              </div>

              <div className="jlp-card-details">
                <div className="jlp-detail-item">
                  <div className="jlp-detail-icon"><FiBriefcase size={15} /></div>
                  <span className="jlp-detail-text">{job.exp}</span>
                </div>
                <div className="jlp-detail-item">
                  <div className="jlp-detail-icon"><FaRupeeSign size={13} /></div>
                  <span className="jlp-detail-text">{job.salary}</span>
                </div>
                <div className="jlp-detail-item">
                  <div className="jlp-detail-icon"><FiMapPin size={15} /></div>
                  <span className="jlp-detail-text">{job.location}</span>
                </div>
                <div className="jlp-detail-item">
                  <div className="jlp-detail-icon"><FiClock size={15} /></div>
                  <span className="jlp-detail-text">{job.posted}</span>
                </div>
              </div>

              <p className="jlp-card-desc">{job.desc}</p>

              <div className="jlp-card-footer">
                <div className="jlp-tags">
                  {job.tags.map(tag => (
                    <span key={tag} className="jlp-tag">{tag}</span>
                  ))}
                </div>
                <div className="jlp-card-actions">
                  <button className="jlp-save-btn" aria-label="Save job">
                    <FiBookmark size={17} />
                  </button>
                  <button
                    className="jlp-apply-btn"
                    onClick={() => navigate(`/job/${job.id}`)}
                  >
                    Quick Apply <FiArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="jlp-pagination">
            <button
              className="jlp-page-btn nav-btn"
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage(prev => prev - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Previous
            </button>
            <div className="jlp-page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  className={`jlp-page-btn num-btn${currentPage === num ? " active" : ""}`}
                  onClick={() => {
                    setCurrentPage(num);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
            <button
              className="jlp-page-btn nav-btn"
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage(prev => prev + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Next
            </button>
          </div>
        </section>

        {/* Right: Companies & Trending */}
        <aside className="jlp-right-sidebar">
          <div className="jlp-right-card">
            <div className="jlp-right-card-title">Top Companies Hiring</div>
            <div className="jlp-company-list">
              {[
                { name: "Virtusa", jobs: 12 },
                { name: "Accenture", jobs: 24 },
                { name: "Conduent", jobs: 8 },
                { name: "DataPulse", jobs: 17 },
              ].map(c => (
                <div key={c.name} className="jlp-company-item">
                  <div className="jlp-company-item-left">
                    <div className="jlp-company-item-logo">{c.name[0]}</div>
                    <div>
                      <div className="jlp-company-item-name">{c.name}</div>
                      <div className="jlp-company-item-jobs">{c.jobs} Open Roles</div>
                    </div>
                  </div>
                  <div className="jlp-company-item-arrow"><FiArrowRight size={14} /></div>
                </div>
              ))}
            </div>
            <button className="jlp-view-all-btn">View All Companies</button>
          </div>

          <div className="jlp-trending-card">
            <div className="jlp-trending-icon"><FiTrendingUp /></div>
            <div className="jlp-trending-title">Trending Career Paths</div>
            <div className="jlp-trending-desc">Roles seeing 40%+ more hiring this quarter.</div>
            <div className="jlp-trending-paths">
              {["Data Engineering", "Cloud Architecture", "Product Operations", "AI / ML Engineering"].map(p => (
                <div key={p} className="jlp-trending-path">
                  <div className="jlp-trending-dot" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>

      {/* ── Footer (same as NaukriLandingPage) ── */}
      <footer className="jlp-footer">
        <div className="jlp-footer-grid">
          <div className="jlp-footer-brand">
            <img src={mavenLogo} alt="Maven Jobs" className="jlp-footer-brand-logo" />
            <p>
              Maven Jobs helps candidates discover better opportunities and helps teams
              hire faster with a cleaner, more focused recruiting experience.
            </p>
            <div className="jlp-footer-social">
              {[
                { label: "Facebook", icon: FaFacebookF },
                { label: "LinkedIn", icon: FaLinkedinIn },
                { label: "X", icon: FaXTwitter },
                { label: "Instagram", icon: FaInstagram },
              ].map(({ label, icon: Icon }) => (
                <Link key={label} to="#" aria-label={label}><Icon /></Link>
              ))}
            </div>
          </div>

          <div className="jlp-footer-col">
            <h4>Company</h4>
            <ul>
              {["About Us", "Careers", "Press", "Blog", "Sitemap"].map(link => (
                <li key={link}><Link to={link === "Blog" ? "/blogs" : "/info"}>{link}</Link></li>
              ))}
            </ul>
          </div>

          <div className="jlp-footer-col">
            <h4>Support</h4>
            <ul>
              {["Help Center", "Grievances", "Fraud Alert", "Trust & Safety", "Report Issue"].map(link => (
                <li key={link}><Link to="/info">{link}</Link></li>
              ))}
            </ul>
          </div>

          <div className="jlp-footer-col">
            <h4>Legal</h4>
            <ul>
              {["Privacy Policy", "Terms & Conditions", "Cookie Policy", "GDPR", "Credits"].map(link => (
                <li key={link}><Link to="/info">{link}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="jlp-footer-bottom">
          <p>&copy; 2026 MavenJobs. All rights reserved. All trademarks are the property of their respective owners.</p>
          <div className="jlp-footer-bottom-links">
            <a href="#">iimjobs</a>
            <a href="#">Shiksha</a>
            <a href="#">Jeevansathi</a>
            <a href="#">Our Businesses</a>
          </div>
        </div>
      </footer>

      {/* ── Filter Modal ── */}
      {activeModal && (
        <div className="jlp-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="jlp-modal-content" onClick={e => e.stopPropagation()}>
            <div className="jlp-modal-header">
              <h3 className="jlp-modal-title">
                {FILTER_CATEGORIES.find(c => c.id === activeModal)?.label}
              </h3>
              <button className="jlp-modal-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div className="jlp-modal-body">
              <div className="jlp-modal-grid">
                {FILTER_CATEGORIES.find(c => c.id === activeModal)?.options.map(opt => {
                  const isChecked = (draftFilters[activeModal] || []).includes(opt);
                  // Mock count for professional look
                  const mockCount = Math.floor(Math.random() * 900) + 15;
                  return (
                    <div
                      key={opt}
                      className="jlp-filter-option"
                      onClick={() => toggleDraftFilter(activeModal, opt)}
                    >
                      <div className={`jlp-checkbox${isChecked ? " checked" : ""}`}>
                        {isChecked && <FiCheck strokeWidth={3} size={10} />}
                      </div>
                      <span className={`jlp-option-label${isChecked ? " active" : ""}`}>
                        {opt} <span className="jlp-option-count">({mockCount})</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="jlp-modal-footer">
              <button className="jlp-modal-apply-btn" onClick={applyModalFilters}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
