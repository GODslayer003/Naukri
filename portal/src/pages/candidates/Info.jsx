import React, { useState, useEffect, useRef } from 'react';
import {
    FiCheckCircle, FiClock, FiEye, FiSend, FiBriefcase,
    FiTrendingUp, FiStar, FiChevronRight, FiFilter,
    FiMapPin, FiUsers, FiBarChart2, FiAward, FiZap,
    FiMail, FiPhone, FiCalendar, FiArrowUp, FiArrowRight,
    FiXCircle, FiAlertCircle, FiRefreshCw, FiBookmark, FiX
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

const SAVED_JOBS = [
    {
        id: 101, title: 'Senior Product Designer', company: 'Google', location: 'Bengaluru',
        logo: 'G', logoColor: '#4285F4', salary: '₹35L - ₹45L', type: 'Full-time', savedAgo: '2d ago',
        match: 92
    },
    {
        id: 102, title: 'Frontend Lead', company: 'Atlassian', location: 'Remote',
        logo: 'A', logoColor: '#0052CC', salary: '₹40L - ₹50L', type: 'Remote', savedAgo: '5d ago',
        match: 85
    },
    {
        id: 103, title: 'UX Engineer', company: 'Microsoft', location: 'Hyderabad',
        logo: 'M', logoColor: '#00A4EF', salary: '₹28L - ₹38L', type: 'Hybrid', savedAgo: '1w ago',
        match: 78
    }
];

function SavedJobsModal({ onClose }) {
    const overlayRef = useRef(null);
    const modalRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(overlayRef.current, { opacity: 0, backdropFilter: 'blur(0px)' }, { opacity: 1, backdropFilter: 'blur(8px)', duration: 0.3, ease: 'power2.out' });
        gsap.fromTo(modalRef.current, { y: 40, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)', delay: 0.1 });
        if (listRef.current) {
            gsap.fromTo(listRef.current.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.08, ease: 'power2.out', delay: 0.3 });
        }
    }, []);

    const handleClose = () => {
        gsap.to(overlayRef.current, { opacity: 0, backdropFilter: 'blur(0px)', duration: 0.2 });
        gsap.to(modalRef.current, { y: 20, opacity: 0, scale: 0.95, duration: 0.2, onComplete: onClose });
    };

    return (
        <div ref={overlayRef} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div ref={modalRef} style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 640, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,35,102,0.25)', border: '1px solid rgba(255,255,255,0.2)' }}>
                
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#002366' }}>
                            <FiBookmark size={20} fill="#002366" />
                        </div>
                        <div>
                            <h2 style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Saved Jobs</h2>
                            <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginTop: 2 }}>You have {SAVED_JOBS.length} jobs saved for later.</p>
                        </div>
                    </div>
                    <button onClick={handleClose} style={{ background: '#fff', border: '1.5px solid #e2e8f0', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all .2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#002366'; e.currentTarget.style.color = '#002366'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}>
                        <FiX size={18} />
                    </button>
                </div>

                <div ref={listRef} style={{ padding: '24px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {SAVED_JOBS.map(job => (
                        <div key={job.id} style={{ padding: 20, borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: 16, transition: 'all .2s', cursor: 'pointer', background: '#fff' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,35,102,.15)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,35,102,.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${job.logoColor}15`, border: `2px solid ${job.logoColor}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 800, color: job.logoColor, flexShrink: 0 }}>
                                {job.logo}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                    <h3 style={{ fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{job.title}</h3>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981', background: '#ecfdf5', padding: '4px 10px', borderRadius: 100 }}>{job.match}% Match</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 12 }}>
                                    <span style={{ color: '#475569' }}>{job.company}</span>
                                    <span>•</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={12} /> {job.location}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '4px 10px', borderRadius: 6 }}>{job.salary}</span>
                                        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '4px 10px', borderRadius: 6 }}>{job.type}</span>
                                    </div>
                                    <button style={{ background: '#002366', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: 'var(--fd)', cursor: 'pointer', transition: 'background .2s' }} onMouseEnter={e => e.currentTarget.style.background = '#1a3a8f'} onMouseLeave={e => e.currentTarget.style.background = '#002366'}>
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ padding: '16px 32px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
                    <Link to="/saved-jobs" onClick={handleClose} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 700, color: '#002366', textDecoration: 'none' }}>
                        Browse more saved jobs <FiArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ── Mock Data ──────────────────────────────────────────────
const APPLICATIONS = [
    {
        id: 1, title: 'Fullstack Developer', company: 'Route Mobile (RML)',
        rating: 3.5, reviews: 122, logo: 'R', logoColor: '#6366f1',
        status: 'application_sent', statusLabel: 'Application Sent',
        appliedDate: '06 May \'26', updatedDate: '06 May \'26',
        totalApps: 737, recruiterViews: 0, tag: 'Applies on Naukri',
        recruiterActive: null, highlight: true,
        match: { earlyApplicant: true, keyskills: true, location: true, workExp: true, industry: false, department: true },
    },
    {
        id: 2, title: 'Intern', company: 'Eurofins It Solutions In...',
        rating: 2.9, reviews: 424, logo: 'E', logoColor: '#10b981',
        status: 'applied', statusLabel: 'Applied today',
        appliedDate: '06 May \'26', updatedDate: '06 May \'26',
        totalApps: 214, recruiterViews: 0, tag: 'Applies on Naukri',
        recruiterActive: null, highlight: false,
        match: { earlyApplicant: true, keyskills: true, location: false, workExp: true, industry: true, department: false },
    },
    {
        id: 3, title: 'Trainee Software Engineer', company: 'NetNautix Technologie...',
        rating: 3.9, reviews: 4, logo: 'N', logoColor: '#002366',
        status: 'application_sent', statusLabel: 'Application Sent',
        appliedDate: '06 May \'26', updatedDate: '06 May \'26',
        totalApps: 89, recruiterViews: 2, tag: 'Applies on Naukri',
        recruiterActive: 'today', highlight: false,
        match: { earlyApplicant: true, keyskills: true, location: true, workExp: false, industry: true, department: true },
    },
    {
        id: 4, title: 'Software Developer', company: 'Tele Infotech',
        rating: 3.7, reviews: 4, logo: 'T', logoColor: '#f59e0b',
        status: 'application_sent', statusLabel: 'Application Sent',
        appliedDate: '05 May \'26', updatedDate: '05 May \'26',
        totalApps: 312, recruiterViews: 1, tag: 'Applies on Naukri',
        recruiterActive: null, highlight: false,
        match: { earlyApplicant: false, keyskills: true, location: true, workExp: true, industry: true, department: true },
    },
    {
        id: 5, title: 'Software Developer', company: 'Acciojob',
        rating: 3.6, reviews: 111, logo: 'A', logoColor: '#ec4899',
        status: 'contacted', statusLabel: 'Contacted',
        appliedDate: '30 Apr \'26', updatedDate: '30 Apr \'26',
        totalApps: 445, recruiterViews: 5, tag: 'Recruiter Actions',
        recruiterActive: '6d ago', highlight: false,
        match: { earlyApplicant: false, keyskills: true, location: true, workExp: true, industry: false, department: true },
    },
    {
        id: 6, title: 'Graduate Engineer Trainee', company: 'WIPRO GE HEALTHCA...',
        rating: 4.0, reviews: 358, logo: 'W', logoColor: '#0ea5e9',
        status: 'resume_viewed', statusLabel: 'Resume viewed',
        appliedDate: '29 Apr \'26', updatedDate: '30 Apr \'26',
        totalApps: 1203, recruiterViews: 1, tag: 'Recruiter Actions',
        recruiterActive: '1d ago', highlight: false,
        match: { earlyApplicant: false, keyskills: true, location: false, workExp: true, industry: true, department: true },
    },
    {
        id: 7, title: 'Fullstack Developer', company: 'Blueapplecloud Tech...',
        rating: 3.8, reviews: 18, logo: 'B', logoColor: '#8b5cf6',
        status: 'applied', statusLabel: 'Applied',
        appliedDate: '28 Apr \'26', updatedDate: '28 Apr \'26',
        totalApps: 56, recruiterViews: 0, tag: 'Applies on External Site',
        recruiterActive: null, highlight: false,
        match: { earlyApplicant: true, keyskills: false, location: true, workExp: true, industry: true, department: false },
    },
    {
        id: 8, title: 'React Developer', company: 'Dr Design Pvt Ltd',
        rating: 4.8, reviews: 52, logo: 'D', logoColor: '#10b981',
        status: 'contacted', statusLabel: 'Contacted',
        appliedDate: '25 Apr \'26', updatedDate: '26 Apr \'26',
        totalApps: 112, recruiterViews: 4, tag: 'Recruiter Actions',
        recruiterActive: '2d ago', highlight: true,
        match: { earlyApplicant: true, keyskills: true, location: true, workExp: true, industry: true, department: true },
    },
    {
        id: 9, title: 'Frontend Engineer', company: 'Tech Innovators',
        rating: 4.2, reviews: 210, logo: 'T', logoColor: '#f43f5e',
        status: 'resume_viewed', statusLabel: 'Resume viewed',
        appliedDate: '22 Apr \'26', updatedDate: '24 Apr \'26',
        totalApps: 890, recruiterViews: 2, tag: 'Applies on Naukri',
        recruiterActive: '1w ago', highlight: false,
        match: { earlyApplicant: false, keyskills: true, location: false, workExp: true, industry: true, department: true },
    },
    {
        id: 10, title: 'UI Developer', company: 'Creative Solutions',
        rating: 3.4, reviews: 15, logo: 'C', logoColor: '#3b82f6',
        status: 'applied', statusLabel: 'Applied',
        appliedDate: '20 Apr \'26', updatedDate: '20 Apr \'26',
        totalApps: 34, recruiterViews: 0, tag: 'Applies on External Site',
        recruiterActive: null, highlight: false,
        match: { earlyApplicant: true, keyskills: true, location: true, workExp: false, industry: false, department: true },
    },
];

const FILTER_TABS = [
    { id: 'all', label: 'All Applications', count: 118 },
    { id: 'recruiter', label: 'Recruiter Actions', count: 13 },
    { id: 'naukri', label: 'Applies on Naukri', count: 104 },
    { id: 'external', label: 'External Site', count: 14 },
];

// Weekly apply data for mini chart
const WEEKLY_DATA = [4, 7, 12, 9, 15, 18, 11, 14, 8, 16, 20, 13, 17, 22];

const STATUS_CONFIG = {
    applied: { color: '#6366f1', bg: '#EEF2FF', icon: <FiSend size={13} />, label: 'Applied' },
    application_sent: { color: '#10b981', bg: '#ecfdf5', icon: <FiCheckCircle size={13} />, label: 'Sent' },
    resume_viewed: { color: '#0ea5e9', bg: '#e0f2fe', icon: <FiEye size={13} />, label: 'Viewed' },
    contacted: { color: '#f59e0b', bg: '#fffbeb', icon: <FiMail size={13} />, label: 'Contacted' },
    rejected: { color: '#ef4444', bg: '#fef2f2', icon: <FiXCircle size={13} />, label: 'Rejected' },
};

function StarRating({ rating }) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <FiStar size={11} fill="#f59e0b" color="#f59e0b" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>{rating}</span>
        </span>
    );
}

function MiniBarChart({ data }) {
    const max = Math.max(...data);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 48 }}>
            {data.map((v, i) => (
                <div key={i} style={{
                    flex: 1, borderRadius: '3px 3px 0 0',
                    background: i === data.length - 1
                        ? 'linear-gradient(180deg,#10b981,#0da371)'
                        : 'rgba(16,185,129,.25)',
                    height: `${(v / max) * 100}%`,
                    transition: 'all .3s',
                    minHeight: 4,
                }} />
            ))}
        </div>
    );
}

function DonutChart({ value, total, color = '#10b981', size = 80, stroke = 9 }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const pct = total > 0 ? value / total : 0;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
                strokeWidth={stroke} strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - pct)}
                style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.4,0,.2,1)' }}
            />
        </svg>
    );
}

function MatchBar({ label, value }) {
    return (
        <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>{value}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 6, background: '#f1f5f9', overflow: 'hidden' }}>
                <div style={{
                    height: '100%', borderRadius: 6,
                    background: value >= 75 ? 'linear-gradient(90deg,#10b981,#0da371)'
                        : value >= 50 ? 'linear-gradient(90deg,#6366f1,#4f46e5)'
                            : 'linear-gradient(90deg,#f59e0b,#d97706)',
                    width: `${value}%`,
                    transition: 'width .8s cubic-bezier(.4,0,.2,1)',
                }} />
            </div>
        </div>
    );
}

export default function Info() {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedApp, setSelectedApp] = useState(APPLICATIONS[0]);
    const [showSavedJobs, setShowSavedJobs] = useState(false);

    const matchScore = selectedApp ? Object.values(selectedApp.match).filter(Boolean).length : 0;
    const matchTotal = selectedApp ? Object.values(selectedApp.match).length : 6;
    const matchPct = Math.round((matchScore / matchTotal) * 100);

    const statusCounts = {
        applied: APPLICATIONS.filter(a => a.status === 'applied').length,
        application_sent: APPLICATIONS.filter(a => a.status === 'application_sent').length,
        resume_viewed: APPLICATIONS.filter(a => a.status === 'resume_viewed').length,
        contacted: APPLICATIONS.filter(a => a.status === 'contacted').length,
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f0f4fb', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#1e293b' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --navy: #002366; --green: #10b981; --gd: #0da371;
          --s50: #f8fafc; --s100: #f1f5f9; --s200: #e2e8f0;
          --s500: #64748b; --s600: #475569; --s900: #0f172a;
          --fd: 'Bricolage Grotesque', sans-serif;
        }
        .app-card {
          padding: 16px 20px; border-radius: 14px; cursor: pointer;
          border: 1.5px solid transparent; transition: all .2s;
          background: #fff;
        }
        .app-card:hover { border-color: rgba(0,35,102,.12); box-shadow: 0 6px 24px rgba(0,35,102,.07); }
        .app-card.active { border-color: #002366; background: #fff; box-shadow: 0 8px 28px rgba(0,35,102,.12); }
        .stat-card {
          background: #fff; border-radius: 18px; padding: 24px;
          border: 1px solid var(--s200); transition: all .25s;
        }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,35,102,.07); }
        .tag-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 100px; font-size: 11.5px; font-weight: 700;
        }
        .filter-tab {
          padding: 8px 16px; border-radius: 10px; font-size: 12.5px; font-weight: 700;
          border: 1.5px solid var(--s200); cursor: pointer; background: #fff;
          color: var(--s600); font-family: var(--fd); transition: all .2s;
          white-space: nowrap;
        }
        .filter-tab:hover { border-color: rgba(0,35,102,.2); color: var(--navy); }
        .filter-tab.active { background: var(--navy); color: #fff; border-color: var(--navy); }
        .match-item {
          display: flex; align-items: center; gap: 9px;
          padding: 8px 0; font-size: 13.5px; font-weight: 600; color: var(--s600);
          border-bottom: 1px solid var(--s100);
        }
        .match-item:last-child { border-bottom: none; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        @media (max-width: 900px) {
          .info-grid { grid-template-columns: 1fr !important; }
          .stats-row { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

            {/* ── TOP HEADER BAR ── */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
                <div>
                    {/* Breadcrumbs */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 8, fontFamily: 'var(--fd)' }}>
                        <Link to="/profile" style={{ color: '#64748b', textDecoration: 'none', transition: 'color .2s' }} onMouseEnter={e => e.target.style.color = '#002366'} onMouseLeave={e => e.target.style.color = '#64748b'}>Profile</Link>
                        <FiChevronRight size={12} />
                        <span style={{ color: '#002366' }}>Information</span>
                    </div>
                    <h1 style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Job Application Status</h1>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
                        Not getting views on your CV?{' '}
                        <a href="#" style={{ color: '#002366', fontWeight: 700, textDecoration: 'none' }}>Highlight your application</a>
                        {' '}to get recruiter's attention
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <button 
                        onClick={() => setShowSavedJobs(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#EEF2FF', color: '#002366', border: '1px solid rgba(0,35,102,.1)', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--fd)', whiteSpace: 'nowrap', transition: 'all .2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#00236620'}
                        onMouseLeave={e => e.currentTarget.style.background = '#EEF2FF'}
                    >
                        <FiBookmark size={14} /> Saved Jobs
                    </button>
                    <div style={{ width: 1, height: 40, background: '#e2e8f0' }} />
                    {[{ val: 118, label: 'Total applies' }, { val: 13, label: 'Application updates' }].map((s, i) => (
                        <div key={i} style={{ textAlign: 'center', padding: '0 16px', borderLeft: i > 0 ? '1px solid #e2e8f0' : 'none' }}>
                            <div style={{ fontFamily: 'var(--fd)', fontSize: 34, fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.04em' }}>{s.val}</div>
                            <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 32px' }}>

                {/* ── STATS ROW ── */}
                <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
                    {/* Total Applied */}
                    <div className="stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>Total Applied</div>
                                <div style={{ fontFamily: 'var(--fd)', fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1 }}>118</div>
                            </div>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                                <FiBriefcase size={20} />
                            </div>
                        </div>
                        <MiniBarChart data={WEEKLY_DATA} />
                        <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiArrowUp size={12} /> +22 this week
                        </div>
                    </div>

                    {/* Recruiter Actions */}
                    <div className="stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>Recruiter Actions</div>
                                <div style={{ fontFamily: 'var(--fd)', fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1 }}>13</div>
                            </div>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                                <FiEye size={20} />
                            </div>
                        </div>
                        <div style={{ position: 'relative', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DonutChart value={13} total={118} color="#10b981" size={56} stroke={7} />
                            <div style={{ position: 'absolute', fontSize: 11, fontWeight: 800, color: '#0f172a' }}>11%</div>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 8 }}>of applications noticed</div>
                    </div>

                    {/* Resume Views */}
                    <div className="stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>Resume Views</div>
                                <div style={{ fontFamily: 'var(--fd)', fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1 }}>9</div>
                            </div>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                                <FiUsers size={20} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {[{ l: 'Direct views', v: 6 }, { l: 'Search views', v: 3 }].map((r, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#64748b', fontWeight: 600, marginBottom: 3 }}>
                                        <span>{r.l}</span><span style={{ color: '#0f172a', fontWeight: 800 }}>{r.v}</span>
                                    </div>
                                    <div style={{ height: 5, borderRadius: 5, background: '#f1f5f9' }}>
                                        <div style={{ height: '100%', borderRadius: 5, background: i === 0 ? '#0ea5e9' : '#6366f1', width: `${(r.v / 9) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Profile Score */}
                    <div className="stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>Profile Score</div>
                                <div style={{ fontFamily: 'var(--fd)', fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1 }}>72%</div>
                            </div>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                                <FiAward size={20} />
                            </div>
                        </div>
                        <MatchBar label="Completeness" value={72} />
                        <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiZap size={12} /> Add projects to reach 90%
                        </div>
                    </div>
                </div>

                {/* ── STATUS BREAKDOWN ── */}
                <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ fontFamily: 'var(--fd)', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Application Pipeline</div>
                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Last 30 days</span>
                    </div>
                    <div style={{ display: 'flex', gap: 0, borderRadius: 10, overflow: 'hidden', height: 10, marginBottom: 16 }}>
                        {[
                            { pct: 70, color: '#10b981' },
                            { pct: 11, color: '#6366f1' },
                            { pct: 8, color: '#0ea5e9' },
                            { pct: 11, color: '#f59e0b' },
                        ].map((s, i) => (
                            <div key={i} style={{ width: `${s.pct}%`, background: s.color, transition: 'width .6s' }} />
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                        {[
                            { label: 'Sent / Applied', count: statusCounts.application_sent + statusCounts.applied, color: '#10b981', bg: '#ecfdf5', icon: <FiSend size={14} /> },
                            { label: 'Recruiter Noticed', count: statusCounts.contacted, color: '#6366f1', bg: '#EEF2FF', icon: <FiMail size={14} /> },
                            { label: 'Resume Viewed', count: statusCounts.resume_viewed, color: '#0ea5e9', bg: '#e0f2fe', icon: <FiEye size={14} /> },
                            { label: 'Awaiting Action', count: 83, color: '#f59e0b', bg: '#fffbeb', icon: <FiClock size={14} /> },
                        ].map((s, i) => (
                            <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: s.bg, border: `1px solid ${s.color}22` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6, color: s.color }}>
                                    {s.icon}
                                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: s.color }}>{s.label}</span>
                                </div>
                                <div style={{ fontFamily: 'var(--fd)', fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>{s.count}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── MAIN GRID: List + Detail ── */}
                <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20 }}>

                    {/* ── LEFT: Application List ── */}
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column' }}>
                            {/* Filter tabs */}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4, flexShrink: 0 }}>
                            {FILTER_TABS.map(tab => (
                                <button key={tab.id} className={`filter-tab ${activeFilter === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveFilter(tab.id)}>
                                    {tab.label}
                                    <span style={{ marginLeft: 5, padding: '1px 7px', borderRadius: 100, background: activeFilter === tab.id ? 'rgba(255,255,255,.2)' : '#f1f5f9', fontSize: 11, fontWeight: 800 }}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 4 }}>
                            {APPLICATIONS.map(app => {
                                const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
                                const isSelected = selectedApp?.id === app.id;
                                return (
                                    <div key={app.id} className={`app-card ${isSelected ? 'active' : ''}`}
                                        onClick={() => setSelectedApp(app)}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                            {/* Logo */}
                                            <div style={{ width: 40, height: 40, borderRadius: 11, background: `${app.logoColor}18`, border: `1.5px solid ${app.logoColor}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 800, color: app.logoColor, flexShrink: 0 }}>
                                                {app.logo}
                                            </div>
                                            {/* Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                                                    <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', lineHeight: 1.3, marginBottom: 3 }}>{app.title}</div>
                                                    {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#002366', flexShrink: 0, marginTop: 4 }} />}
                                                </div>
                                                <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ fontWeight: 600 }}>{app.company}</span>
                                                    <span>·</span>
                                                    <StarRating rating={app.rating} />
                                                    <span style={{ color: '#94a3b8' }}>({app.reviews})</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <span className="tag-pill" style={{ background: sc.bg, color: sc.color }}>
                                                        {sc.icon} {app.statusLabel}
                                                    </span>
                                                    {app.recruiterActive && (
                                                        <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>
                                                            Recruiter active {app.recruiterActive}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Detail Panel ── */}
                    {selectedApp && (() => {
                        const sc = STATUS_CONFIG[selectedApp.status] || STATUS_CONFIG.applied;
                        const steps = [
                            { label: 'Applied', date: selectedApp.appliedDate, done: true },
                            { label: 'Application Sent', date: selectedApp.updatedDate, done: selectedApp.status !== 'applied' },
                            { label: 'Recruiter Viewed', date: null, done: selectedApp.status === 'resume_viewed' || selectedApp.status === 'contacted' },
                            { label: 'Interview / Action', date: null, done: false },
                        ];
                        const matchEntries = Object.entries(selectedApp.match);

                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                                {/* ── Job Header Card ── */}
                                <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                    {/* Gradient top bar */}
                                    <div style={{ height: 4, background: 'linear-gradient(90deg,#002366,#10b981)' }} />
                                    <div style={{ padding: '24px 28px' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                                            <div style={{ width: 56, height: 56, borderRadius: 14, background: `${selectedApp.logoColor}18`, border: `2px solid ${selectedApp.logoColor}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 800, color: selectedApp.logoColor, flexShrink: 0 }}>
                                                {selectedApp.logo}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h2 style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 5, letterSpacing: '-0.02em' }}>{selectedApp.title}</h2>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: 14, fontWeight: 700, color: '#475569' }}>{selectedApp.company}</span>
                                                    <StarRating rating={selectedApp.rating} />
                                                    <span style={{ fontSize: 12.5, color: '#94a3b8' }}>{selectedApp.reviews} Reviews</span>
                                                </div>
                                            </div>
                                            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#EEF2FF', color: '#002366', fontSize: 13, fontWeight: 800, borderRadius: 10, textDecoration: 'none', fontFamily: 'var(--fd)', transition: 'all .2s', border: '1px solid rgba(0,35,102,.1)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#002366' + '20'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#EEF2FF'}>
                                                View Job <FiArrowRight size={13} />
                                            </a>
                                        </div>

                                        {/* Progress stepper */}
                                        <div style={{ marginBottom: 4 }}>
                                            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: '#64748b', marginBottom: 16 }}>Application Status</div>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, position: 'relative' }}>
                                                {/* Track line */}
                                                <div style={{ position: 'absolute', top: 14, left: 14, right: 14, height: 3, background: '#f1f5f9', borderRadius: 3, zIndex: 0 }}>
                                                    <div style={{
                                                        height: '100%', borderRadius: 3,
                                                        background: 'linear-gradient(90deg,#10b981,#6ee7b7)',
                                                        width: `${(steps.filter(s => s.done).length / (steps.length - 1)) * 100}%`,
                                                        transition: 'width .6s',
                                                    }} />
                                                </div>
                                                {steps.map((step, si) => (
                                                    <div key={si} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                                                        <div style={{
                                                            width: 28, height: 28, borderRadius: '50%', marginBottom: 10,
                                                            background: step.done ? '#10b981' : '#fff',
                                                            border: step.done ? 'none' : '2.5px solid #e2e8f0',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            boxShadow: step.done ? '0 0 0 4px rgba(16,185,129,.15)' : 'none',
                                                            transition: 'all .3s',
                                                        }}>
                                                            {step.done
                                                                ? <FiCheckCircle size={14} color="#fff" />
                                                                : <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1' }} />}
                                                        </div>
                                                        <div style={{ fontSize: 12, fontWeight: 700, color: step.done ? '#0f172a' : '#94a3b8', textAlign: 'center', lineHeight: 1.3 }}>{step.label}</div>
                                                        {step.date && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{step.date}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Bottom Row: Activity + Match ── */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                                    {/* Activity */}
                                    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '24px 24px' }}>
                                        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: '#64748b', marginBottom: 16 }}>Activity on this Job</div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                                            {[
                                                { val: selectedApp.totalApps, label: 'Total applications', color: '#6366f1', bg: '#EEF2FF' },
                                                { val: selectedApp.recruiterViews === 0 ? '—' : selectedApp.recruiterViews, label: 'Viewed by recruiter', color: '#10b981', bg: '#ecfdf5' },
                                            ].map((m, i) => (
                                                <div key={i} style={{ padding: '16px', borderRadius: 14, background: m.bg, textAlign: 'center' }}>
                                                    <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 800, color: m.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{m.val}</div>
                                                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, marginTop: 5, lineHeight: 1.4 }}>{m.label}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Competition level */}
                                        <div style={{ padding: '14px 16px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#475569' }}>Competition level</span>
                                                <span style={{ fontSize: 12, fontWeight: 800, color: selectedApp.totalApps > 500 ? '#ef4444' : selectedApp.totalApps > 200 ? '#f59e0b' : '#10b981', padding: '2px 10px', borderRadius: 100, background: selectedApp.totalApps > 500 ? '#fef2f2' : selectedApp.totalApps > 200 ? '#fffbeb' : '#ecfdf5' }}>
                                                    {selectedApp.totalApps > 500 ? 'High' : selectedApp.totalApps > 200 ? 'Medium' : 'Low'}
                                                </span>
                                            </div>
                                            <div style={{ height: 6, borderRadius: 6, background: '#f1f5f9', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', borderRadius: 6, background: selectedApp.totalApps > 500 ? '#ef4444' : selectedApp.totalApps > 200 ? '#f59e0b' : '#10b981', width: `${Math.min((selectedApp.totalApps / 1500) * 100, 100)}%` }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Match */}
                                    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '24px 24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: '#64748b' }}>Profile Match</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <DonutChart value={matchScore} total={matchTotal} color={matchPct >= 75 ? '#10b981' : matchPct >= 50 ? '#6366f1' : '#f59e0b'} size={52} stroke={6} />
                                                    <div style={{ position: 'absolute', fontFamily: 'var(--fd)', fontSize: 12, fontWeight: 800, color: '#0f172a' }}>{matchPct}%</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: 16 }}>
                                            <MatchBar label="Overall Match" value={matchPct} />
                                            <MatchBar label="Skills Alignment" value={selectedApp.match.keyskills ? 88 : 42} />
                                            <MatchBar label="Experience Fit" value={selectedApp.match.workExp ? 76 : 38} />
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {matchEntries.map(([key, val]) => (
                                                <div key={key} className="match-item">
                                                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: val ? '#ecfdf5' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        {val
                                                            ? <FiCheckCircle size={12} color="#10b981" />
                                                            : <FiXCircle size={12} color="#ef4444" />}
                                                    </div>
                                                    <span style={{ color: val ? '#0f172a' : '#94a3b8', textDecoration: val ? 'none' : 'none' }}>
                                                        {key === 'earlyApplicant' ? 'Early Applicant'
                                                            : key === 'keyskills' ? 'Key Skills'
                                                                : key === 'workExp' ? 'Work Experience'
                                                                    : key.charAt(0).toUpperCase() + key.slice(1)}
                                                    </span>
                                                    {!val && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><FiAlertCircle size={11} /> Improve</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* ── Tips banner ── */}
                                <div style={{ background: 'linear-gradient(135deg,#002366,#1a3a8f)', borderRadius: 18, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(16,185,129,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <FiTrendingUp size={20} color="#6ee7b7" />
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: 'var(--fd)', fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 3 }}>Boost your visibility</div>
                                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>
                                                Highlight your application to appear at the top of recruiter searches and get 3× more views.
                                            </div>
                                        </div>
                                    </div>
                                    <button style={{ padding: '10px 22px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--fd)', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all .2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#0da371'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#10b981'}>
                                        Highlight Now
                                    </button>
                                </div>

                            </div>
                        );
                    })()}
                </div>
            </div>
            {showSavedJobs && <SavedJobsModal onClose={() => setShowSavedJobs(false)} />}
        </div>
    );
}