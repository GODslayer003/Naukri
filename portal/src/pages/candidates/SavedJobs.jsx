import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiMapPin, FiBriefcase, FiDollarSign, FiClock,
  FiBookmark, FiArrowLeft, FiTrash2, FiExternalLink,
  FiSearch, FiFilter, FiTrendingUp
} from 'react-icons/fi';
import { gsap } from 'gsap';
import { useAuth } from '../../AuthContext';
import mavenLogo from '../../../assets/maven-logo-BdiSsfJk.svg';

const INITIAL_SAVED_JOBS = [
  {
    id: 101, title: 'Senior Product Designer', company: 'Google',
    location: 'Bengaluru, Karnataka', logo: 'G', logoColor: '#4285F4',
    salary: '₹35L – ₹45L', type: 'Full-time', savedAgo: '2 days ago',
    match: 92, tags: ['Figma', 'UI/UX', 'Design Systems'],
    urgent: true, applicants: '124 applicants'
  },
  {
    id: 102, title: 'Frontend Lead Engineer', company: 'Atlassian',
    location: 'Remote, India', logo: 'A', logoColor: '#0052CC',
    salary: '₹40L – ₹50L', type: 'Remote', savedAgo: '5 days ago',
    match: 85, tags: ['React', 'TypeScript', 'Tailwind'],
    urgent: false, applicants: '89 applicants'
  },
  {
    id: 103, title: 'UX Engineer', company: 'Microsoft',
    location: 'Hyderabad, Telangana', logo: 'M', logoColor: '#00A4EF',
    salary: '₹28L – ₹38L', type: 'Hybrid', savedAgo: '1 week ago',
    match: 78, tags: ['User Research', 'Prototyping', 'CSS'],
    urgent: true, applicants: '210 applicants'
  },
  {
    id: 104, title: 'Product Manager', company: 'Amazon',
    location: 'Bengaluru, Karnataka', logo: 'a', logoColor: '#FF9900',
    salary: '₹30L – ₹42L', type: 'Full-time', savedAgo: '2 weeks ago',
    match: 88, tags: ['Agile', 'Strategy', 'B2C'],
    urgent: false, applicants: '176 applicants'
  },
];

const TYPE_COLORS = {
  'Full-time': { bg: '#EEF2FF', color: '#3730A3' },
  'Remote': { bg: '#F0FDF4', color: '#166534' },
  'Hybrid': { bg: '#FFF7ED', color: '#9A3412' },
  'Part-time': { bg: '#FDF4FF', color: '#6B21A8' },
};

const matchColor = (m) => {
  if (m >= 90) return { bg: '#ECFDF5', color: '#065F46', ring: '#10B98130' };
  if (m >= 80) return { bg: '#EFF6FF', color: '#1E40AF', ring: '#3B82F630' };
  return { bg: '#FFFBEB', color: '#92400E', ring: '#F59E0B30' };
};

export default function SavedJobs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState(INITIAL_SAVED_JOBS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const headerRef = useRef(null);
  const statsRef = useRef([]);

  const filters = ['All', 'Full-time', 'Remote', 'Hybrid'];

  const filtered = jobs.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || j.type === filter;
    return matchSearch && matchFilter;
  });

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(headerRef.current,
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    );
    tl.fromTo(statsRef.current,
      { opacity: 0, y: 20, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.08, ease: 'back.out(1.4)' },
      '-=0.2'
    );
    tl.fromTo(cardsRef.current.filter(Boolean),
      { opacity: 0, y: 32, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.2)' },
      '-=0.15'
    );
  }, []);

  const handleRemove = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const idx = jobs.findIndex(j => j.id === id);
    if (idx !== -1 && cardsRef.current[idx]) {
      gsap.to(cardsRef.current[idx], {
        opacity: 0, scale: 0.93, y: 12, duration: 0.28, ease: 'power2.in',
        onComplete: () => setJobs(prev => prev.filter(j => j.id !== id))
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F1F4F9', fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>

      {/* ── HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 1px 12px rgba(0,35,102,0.06)'
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 32px',
          height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link to="/">
              <img src={mavenLogo} alt="MavenJobs" style={{ height: 34, display: 'block' }} />
            </Link>
            <div style={{ width: 1, height: 28, background: '#E2E8F0' }} />
            <button
              onClick={() => navigate('/profile')}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                fontSize: 13.5, fontWeight: 600, color: '#64748B',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px 10px', borderRadius: 10,
                transition: 'all 0.18s'
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#002366'; e.currentTarget.style.background = '#EEF2FF'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'none'; }}
            >
              <FiArrowLeft size={15} /> Back to Profile
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/jobs" style={{
              fontSize: 13.5, fontWeight: 700, color: '#002366',
              background: '#EEF2FF', border: '1.5px solid #C7D7FF',
              padding: '9px 20px', borderRadius: 12, textDecoration: 'none',
              transition: 'all 0.18s', display: 'inline-flex', alignItems: 'center', gap: 6
            }}>
              <FiSearch size={14} /> Find more jobs
            </Link>
            {user && (
              <img
                src={user.profilePic || 'https://i.pinimg.com/736x/26/89/19/268919fb14ab9fb609647d7011140ab7.jpg'}
                alt="Profile"
                onClick={() => navigate('/profile')}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  border: '2.5px solid #E2E8F0', objectFit: 'cover',
                  cursor: 'pointer', transition: 'border-color 0.18s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#002366'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
              />
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px 80px' }} ref={containerRef}>

        {/* Page hero */}
        <div ref={headerRef} style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{
                width: 58, height: 58, borderRadius: 18,
                background: 'linear-gradient(135deg, #001a50 0%, #002fa0 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,35,102,0.24)'
              }}>
                <FiBookmark size={24} color="#fff" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  Saved Jobs
                </h1>
                <p style={{ margin: '6px 0 0', fontSize: 14.5, color: '#64748B', fontWeight: 500 }}>
                  {jobs.length} roles saved · Review and apply before they expire
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'Saved', value: jobs.length, icon: <FiBookmark size={16} />, accent: '#002366', bg: '#EEF2FF' },
                { label: 'Avg Match', value: `${Math.round(jobs.reduce((a, b) => a + b.match, 0) / (jobs.length || 1))}%`, icon: <FiTrendingUp size={16} />, accent: '#059669', bg: '#ECFDF5' },
              ].map((s, i) => (
                <div key={i} ref={el => statsRef.current[i] = el} style={{
                  background: '#fff', border: '1px solid #E2E8F0',
                  borderRadius: 16, padding: '14px 20px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: s.bg, color: s.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>{s.value}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: '#94A3B8', marginTop: 2 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search + Filter bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, flexWrap: 'wrap'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <FiSearch size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or company…"
              style={{
                width: '100%', paddingLeft: 42, paddingRight: 16, paddingTop: 11, paddingBottom: 11,
                fontSize: 14, fontWeight: 500, color: '#1E293B',
                background: '#fff', border: '1.5px solid #E2E8F0',
                borderRadius: 13, outline: 'none', boxSizing: 'border-box',
                fontFamily: 'inherit', transition: 'border-color 0.18s'
              }}
              onFocus={e => e.target.style.borderColor = '#93C5FD'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <FiFilter size={14} color="#94A3B8" />
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700,
                border: filter === f ? '1.5px solid #002366' : '1.5px solid #E2E8F0',
                background: filter === f ? '#002366' : '#fff',
                color: filter === f ? '#fff' : '#64748B',
                cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'inherit'
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── JOB CARDS ── */}
        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(520px, 1fr))', gap: 20 }}>
            {filtered.map((job, index) => {
              const mc = matchColor(job.match);
              const tc = TYPE_COLORS[job.type] || TYPE_COLORS['Full-time'];
              return (
                <div
                  key={job.id}
                  ref={el => cardsRef.current[index] = el}
                  style={{
                    background: '#fff',
                    borderRadius: 22,
                    border: '1px solid #E8EDF5',
                    padding: '26px 28px',
                    boxShadow: '0 2px 12px rgba(0,30,80,0.05)',
                    display: 'flex', flexDirection: 'column',
                    position: 'relative', overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.25s, transform 0.25s, border-color 0.25s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,35,102,0.12)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = '#C7D7FF';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,30,80,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#E8EDF5';
                  }}
                >
                  {/* Top accent line */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: `linear-gradient(90deg, ${job.logoColor}, ${job.logoColor}55)`,
                    borderRadius: '22px 22px 0 0'
                  }} />

                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {/* Company logo */}
                      <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: `${job.logoColor}12`,
                        border: `1.5px solid ${job.logoColor}25`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 900, color: job.logoColor, flexShrink: 0
                      }}>
                        {job.logo}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 17.5, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                          {job.title}
                        </h3>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
                          {job.company}
                        </div>
                      </div>
                    </div>

                    {/* Right: match + remove */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <div style={{
                        padding: '5px 12px', borderRadius: 100,
                        background: mc.bg, color: mc.color,
                        fontSize: 12.5, fontWeight: 800,
                        border: `1px solid ${mc.ring}`,
                        whiteSpace: 'nowrap'
                      }}>
                        ✦ {job.match}% Match
                      </div>
                      <button
                        onClick={(e) => handleRemove(e, job.id)}
                        title="Remove"
                        style={{
                          width: 32, height: 32, borderRadius: 10,
                          background: '#FEF2F2', border: '1px solid #FECACA',
                          color: '#EF4444', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.18s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Meta pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                    {[
                      { icon: <FiMapPin size={12} />, label: job.location },
                      { icon: <FiBriefcase size={12} />, label: job.type, custom: tc },
                      { icon: <FiDollarSign size={12} />, label: job.salary },
                      { icon: <FiClock size={12} />, label: `Saved ${job.savedAgo}` },
                    ].map((m, mi) => (
                      <div key={mi} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 10,
                        background: m.custom ? m.custom.bg : '#F8FAFC',
                        color: m.custom ? m.custom.color : '#475569',
                        border: `1px solid ${m.custom ? m.custom.color + '25' : '#E8EDF5'}`,
                        fontSize: 12.5, fontWeight: 600,
                      }}>
                        {m.icon} {m.label}
                      </div>
                    ))}
                  </div>

                  {/* Skill tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 22 }}>
                    {job.tags.map(tag => (
                      <span key={tag} style={{
                        padding: '4px 11px', borderRadius: 8,
                        background: '#F1F5F9', color: '#475569',
                        fontSize: 12, fontWeight: 700, letterSpacing: '0.01em'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: '#F1F5F9', marginBottom: 18 }} />

                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {job.urgent && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          fontSize: 12.5, fontWeight: 700, color: '#B45309',
                          background: '#FFFBEB', padding: '4px 10px',
                          borderRadius: 8, border: '1px solid #FDE68A',
                          width: 'fit-content'
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                          Hiring quickly
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
                        {job.applicants}
                      </span>
                    </div>

                    <button style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '11px 22px', borderRadius: 13,
                      background: 'linear-gradient(135deg, #001a50 0%, #0F3DB5 100%)',
                      color: '#fff', fontSize: 13.5, fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(0,35,102,0.28)',
                      transition: 'all 0.22s', fontFamily: 'inherit'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1.5px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,35,102,0.38)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,35,102,0.28)'; }}
                    >
                      Apply Now <FiExternalLink size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── EMPTY STATE ── */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '80px 24px',
            background: '#fff', borderRadius: 24,
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 12px rgba(0,30,80,0.04)'
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: 24,
              background: '#F1F5F9', display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: 24
            }}>
              <FiBookmark size={36} color="#CBD5E1" />
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0F172A' }}>No saved jobs yet</h2>
            <p style={{ margin: '10px 0 32px', fontSize: 15, color: '#64748B', fontWeight: 500, textAlign: 'center', maxWidth: 380 }}>
              {search || filter !== 'All'
                ? 'No jobs match your current filters. Try adjusting your search.'
                : "Save roles you like while browsing — they'll appear here so you can apply anytime."}
            </p>
            {search || filter !== 'All' ? (
              <button
                onClick={() => { setSearch(''); setFilter('All'); }}
                style={{
                  padding: '12px 28px', borderRadius: 13, fontSize: 14.5, fontWeight: 700,
                  background: '#F1F5F9', color: '#002366', border: '1.5px solid #E2E8F0',
                  cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                Clear filters
              </button>
            ) : (
              <Link to="/jobs" style={{
                padding: '12px 28px', borderRadius: 13, fontSize: 14.5, fontWeight: 700,
                background: 'linear-gradient(135deg,#001a50,#0F3DB5)',
                color: '#fff', textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(0,35,102,0.28)'
              }}>
                Browse Jobs
              </Link>
            )}
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}