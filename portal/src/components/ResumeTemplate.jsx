import React, { forwardRef } from 'react';

const SKILL_PAIRS = [
  ['React.js', 'Redux'],
  ['Node.js', 'Express.js'],
  ['MongoDB', 'Mongoose'],
  ['JavaScript', 'TypeScript'],
  ['HTML5', 'CSS3'],
  ['REST APIs', 'GraphQL'],
  ['Git', 'GitHub'],
  ['Figma', 'Tailwind'],
];

const CONTACT = [
  {
    label: 'Phone', text: '+91 98765 43210',
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 11.43 19.79 19.79 0 01.21 2.82 2 2 0 012.22 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l.66-.66a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>,
  },
  {
    label: 'Email', text: 'rohan.kundliya@gmail.com',
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  },
  {
    label: 'Location', text: 'Dehradun, Uttarakhand',
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  },
  {
    label: 'LinkedIn', text: 'linkedin.com/in/rohankundliya',
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>,
  },
  {
    label: 'GitHub', text: 'github.com/rohankundliya',
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" /></svg>,
  },
];

const PHOTO = 'https://images.weserv.nl/?url=i.pinimg.com/736x/26/89/19/268919fb14ab9fb609647d7011140ab7.jpg&w=200&h=200&fit=cover&a=attention';

export const ResumeTemplate = forwardRef((_, ref) => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

      .R *, .R *::before, .R *::after { box-sizing:border-box; margin:0; padding:0; }

      .R {
        width:794px; height:1123px;
        background:#fff;
        font-family:'DM Sans',system-ui,sans-serif;
        color:#1e293b;
        display:flex; flex-direction:column;
        position:relative; overflow:hidden;
        -webkit-font-smoothing:antialiased;
        text-rendering:optimizeLegibility;
      }

      /* sidebar */
      .R-sbg {
        position:absolute; top:0; left:0; bottom:0; width:242px;
        background-color:#002366;
        z-index:0;
      }
      .R-sdots {
        position:absolute; inset:0;
        /* Removed radial-gradient as it causes html2canvas InvalidStateError */
        background-color:rgba(255,255,255,0.01);
        pointer-events:none;
      }
      .R-sglow {
        position:absolute; bottom:-90px; left:-70px;
        width:280px; height:280px; border-radius:50%;
        background-color:rgba(16,185,129,0.05); /* Fallback solid color instead of radial-gradient to prevent html2canvas crash */
        pointer-events:none;
      }

      /* layout */
      .R-body { position:relative; z-index:1; display:flex; flex:1; min-height:0; }

      /* ── LEFT ── */
      .R-L {
        width:242px; flex-shrink:0;
        padding:30px 18px 28px 20px;
        display:flex; flex-direction:column;
      }

      /* photo */
      .R-photo {
        width:86px; height:86px; border-radius:50%;
        border:3px solid rgba(16,185,129,.82);
        box-shadow:0 0 0 5px rgba(16,185,129,.15),0 6px 22px rgba(0,0,0,.45);
        overflow:hidden; flex-shrink:0; align-self:center; margin-bottom:11px;
      }
      .R-photo img { width:100%; height:100%; object-fit:cover; display:block; }

      .R-lname {
        text-align:center;
        font-family:'Bricolage Grotesque',sans-serif;
        font-size:17px; font-weight:800; color:#fff;
        line-height:1.2; letter-spacing:-0.02em; margin-bottom:4px;
      }
      .R-lrole {
        text-align:center;
        font-size:8.5px; font-weight:800; color:#10b981;
        letter-spacing:.2em; text-transform:uppercase; margin-bottom:15px;
      }

      /* divider */
      .R-div {
        height:1px; flex-shrink:0;
        background-color:rgba(255,255,255,.1);
        margin-bottom:13px;
      }

      /* section label */
      .R-slbl {
        font-family:'Bricolage Grotesque',sans-serif;
        font-size:8px; font-weight:800;
        letter-spacing:.24em; text-transform:uppercase;
        color:#10b981; margin-bottom:9px; flex-shrink:0;
        display:flex; align-items:center; gap:5px;
      }
      .R-slbl::after { content:''; flex:1; height:1px; background:rgba(255,255,255,.1); }

      /* contact */
      .R-ci { display:flex; align-items:flex-start; gap:8px; margin-bottom:8px; }
      .R-cicon {
        width:22px; height:22px; border-radius:6px;
        background:rgba(16,185,129,.14); border:1px solid rgba(16,185,129,.28);
        /* flex centering for the svg icon */
        display:flex; align-items:center; justify-content:center;
        flex-shrink:0; margin-top:1px;
      }
      .R-cbody { min-width:0; flex:1; }
      .R-clbl {
        font-size:7.5px; font-weight:800; letter-spacing:.1em;
        text-transform:uppercase; color:rgba(255,255,255,.28);
        display:block; margin-bottom:1px;
      }
      .R-ctxt {
        font-size:10px; font-weight:500; color:rgba(255,255,255,.76);
        line-height:1.4; word-break:break-word;
      }

      /* skill grid */
      .R-sgrid {
        display:grid; grid-template-columns:1fr 1fr;
        gap:5px; flex-shrink:0;
      }

      /* education */
      .R-edu { padding-left:9px; border-left:2px solid rgba(16,185,129,.38); margin-bottom:9px; flex-shrink:0; }
      .R-edu-d { font-size:10.5px; font-weight:700; color:rgba(255,255,255,.88); line-height:1.3; margin-bottom:2px; }
      .R-edu-s { font-size:9.5px; color:rgba(255,255,255,.44); margin-bottom:1px; }
      .R-edu-y { font-size:9.5px; font-weight:800; color:#10b981; }

      /* ── RIGHT ── */
      .R-R {
        flex:1; min-width:0;
        padding:30px 26px 24px 28px;
        display:flex; flex-direction:column;
        background:#fff;
      }

      .R-rname {
        font-family:'Bricolage Grotesque',sans-serif;
        font-size:28px; font-weight:800; color:#0f172a;
        letter-spacing:-0.04em; line-height:1; margin-bottom:4px;
      }
      .R-rname b { color:#002366; font-weight:800; }
      .R-rrole { font-size:11.5px; font-weight:700; color:#64748b; letter-spacing:.04em; margin-bottom:11px; }
      .R-tagline {
        font-size:11px; color:#475569; line-height:1.72; font-style:italic;
        padding:9px 13px; background:#f8fafc;
        border-left:3px solid #10b981; border-radius:0 7px 7px 0;
      }

      /* section heading */
      .R-rh {
        font-family:'Bricolage Grotesque',sans-serif;
        font-size:9px; font-weight:800;
        letter-spacing:.22em; text-transform:uppercase; color:#002366;
        display:flex; align-items:center; gap:8px;
        margin:16px 0 10px; flex-shrink:0;
      }
      .R-rh::after {
        content:''; flex:1; height:2px;
        background-color:#10b981;
        border-radius:2px;
      }

      /* experience */
      .R-xrow { display:flex; gap:10px; margin-bottom:12px; }
      .R-xrow:last-child { margin-bottom:0; }
      .R-xtl { display:flex; flex-direction:column; align-items:center; width:13px; flex-shrink:0; padding-top:4px; }
      .R-xdot { width:9px; height:9px; border-radius:50%; background:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,.18); flex-shrink:0; }
      .R-xline { flex:1; width:1.5px; margin-top:4px; background-color:rgba(16,185,129,.2); }
      .R-xb { flex:1; min-width:0; }
      .R-xrole { font-family:'Bricolage Grotesque',sans-serif; font-size:12.5px; font-weight:800; color:#0f172a; margin-bottom:1px; }
      .R-xco { font-size:10.5px; font-weight:700; color:#002366; margin-bottom:4px; }
      .R-xdesc { font-size:11px; color:#475569; line-height:1.68; }

      /* project */
      .R-pc {
        background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;
        padding:10px 12px 10px 14px; margin-bottom:7px;
        position:relative; overflow:hidden; flex-shrink:0;
      }
      .R-pc::before {
        content:''; position:absolute; top:0; left:0;
        width:3px; height:100%;
        background-color:#10b981;
      }
      .R-pc:last-child { margin-bottom:0; }
      .R-pname { font-family:'Bricolage Grotesque',sans-serif; font-size:12px; font-weight:800; color:#0f172a; margin-bottom:3px; }
      .R-pdesc { font-size:10.5px; color:#475569; line-height:1.6; margin-bottom:6px; }
      .R-tags { display:flex; flex-wrap:wrap; gap:4px; }

      /* achievements */
      .R-ach {
        display:flex; align-items:flex-start; gap:9px;
        padding:7px 11px; background:#f8fafc;
        border:1px solid #e2e8f0; border-radius:7px; margin-bottom:5px;
      }
      .R-ach:last-child { margin-bottom:0; }
      .R-adot { width:6px; height:6px; border-radius:50%; flex-shrink:0; margin-top:5px; }
      .R-atxt { font-size:10.5px; color:#334155; line-height:1.5; font-weight:500; }

      /* footer */
      .R-strip {
        height:4px; flex-shrink:0;
        background-color:#002366;
      }

      /* minimalist skills list */
      .R-skill {
        display:flex; align-items:center; gap:6px;
        font-size:10.5px; font-weight:600; color:rgba(255,255,255,.9);
        letter-spacing:.02em; padding:4px 0;
      }
      .R-skill-dot {
        color:#10b981; font-size:14px;
        line-height:1; margin-right:2px;
      }

      /* minimalist date */
      .R-date-clean {
        font-size:9px; font-weight:800; color:#10b981;
        letter-spacing:.06em; text-transform:uppercase;
        margin-bottom:6px; display:inline-block;
      }

      /* minimalist project tags */
      .R-ptags-clean {
        font-size:9px; font-weight:700; color:#002366;
        letter-spacing:.04em; text-transform:uppercase;
        margin-top:2px; display:flex; flex-wrap:wrap;
      }
      .R-ptag-item:not(:last-child)::after {
        content: ' • ';
        color: #10b981;
        margin: 0 5px;
      }
    `}</style>

    <div className="R" ref={ref}>
      <div className="R-sbg"><div className="R-sdots" /><div className="R-sglow" /></div>

      <div className="R-body">

        {/* ════ LEFT ════ */}
        <div className="R-L">
          <div className="R-photo">
            <img src={PHOTO} alt="Rohan Kundliya" />
          </div>
          <div className="R-lname">Rohan<br />Kundliya</div>
          <div className="R-lrole">MERN Stack Developer</div>
          <div className="R-div" />

          <div className="R-slbl">Contact</div>
          {CONTACT.map(c => (
            <div className="R-ci" key={c.label}>
              <div className="R-cicon">{c.icon}</div>
              <div className="R-cbody">
                <span className="R-clbl">{c.label}</span>
                <div className="R-ctxt">{c.text}</div>
              </div>
            </div>
          ))}

          <div className="R-div" style={{ marginTop: 6 }} />

          {/* ── SKILL CHIPS ──
              Each chip is a <div> with inline style using PILL_BASE.
              display:flex + align-items:center + justify-content:center
              is the only method guaranteed to center on every renderer.
              No padding-top, no line-height hack, no block tricks.
          */}
          <div className="R-slbl">Skills</div>
          <div className="R-sgrid">
            {SKILL_PAIRS.flat().map(s => (
              <div key={s} className="R-skill">
                <span className="R-skill-dot">•</span> {s}
              </div>
            ))}
          </div>

          <div className="R-div" style={{ marginTop: 10 }} />

          <div className="R-slbl">Education</div>
          {[
            { d: 'B.Tech — CS', s: 'Graphic Era Univ., Dehradun', y: '2021 – 2025' },
            { d: 'Class XII', s: 'CBSE Board', y: '2020' },
            { d: 'Class X', s: 'CBSE Board', y: '2018' },
          ].map(e => (
            <div className="R-edu" key={e.d}>
              <div className="R-edu-d">{e.d}</div>
              <div className="R-edu-s">{e.s}</div>
              <div className="R-edu-y">{e.y}</div>
            </div>
          ))}
        </div>

        {/* ════ RIGHT ════ */}
        <div className="R-R">
          <div className="R-rname"><b>Rohan</b> Kundliya</div>
          <div className="R-rrole">MERN Stack Developer &nbsp;·&nbsp; Full-Stack Engineer</div>
          <div className="R-tagline">
            Results-driven developer passionate about building scalable, production-grade web
            applications. I thrive at the intersection of clean architecture and intuitive user
            experience — always shipping with quality.
          </div>

          <div className="R-rh">Work Experience</div>
          {[
            {
              role: 'MERN Stack Developer', co: 'Dr Design Private Limited',
              date: 'Oct 2025 – Present', last: false,
              desc: 'Building scalable web applications using the full MERN stack. Optimising performance via code-splitting, lazy loading, and MongoDB indexing. Collaborating with cross-functional teams to deliver high-quality software on schedule.',
            },
            {
              role: 'Frontend Intern', co: 'MavenJobs · Internship',
              date: 'Jun 2024 – Sep 2024', last: true,
              desc: 'Built reusable React components, implemented Context API state management, and improved page-load performance by 35% through optimised rendering patterns.',
            },
          ].map(x => (
            <div className="R-xrow" key={x.role}>
              <div className="R-xtl">
                <div className="R-xdot" />
                {!x.last && <div className="R-xline" />}
              </div>
              <div className="R-xb">
                <div className="R-xrole">{x.role}</div>
                <div className="R-xco">{x.co}</div>
                {/* sleek date text */}
                <div className="R-date-clean">{x.date}</div>
                <div className="R-xdesc">{x.desc}</div>
              </div>
            </div>
          ))}

          <div className="R-rh">Projects</div>
          {[
            {
              name: 'MyQuoteMate',
              desc: 'Scalable Node.js + Express + MongoDB backend with an AI orchestration layer integrating OpenAI — 500+ daily requests at sub-200 ms.',
              tags: ['Node.js', 'Express', 'MongoDB', 'OpenAI API'],
            },
            {
              name: 'MavenJobs Platform',
              desc: 'Production-ready React components with dynamic routing and Context API state management. Achieved 98 / 100 Lighthouse score.',
              tags: ['React.js', 'Context API', 'React Router', 'Tailwind CSS'],
            },
            {
              name: 'DevConnect — Developer Community',
              desc: 'Real-time developer chat via WebSocket, GitHub OAuth login, and a project collaboration board.',
              tags: ['Socket.io', 'JWT', 'GitHub OAuth', 'Redux'],
            },
          ].map(p => (
            <div className="R-pc" key={p.name}>
              <div className="R-pname">{p.name}</div>
              <div className="R-pdesc">{p.desc}</div>
              <div className="R-ptags-clean">
                {/* clean inline text tags */}
                {p.tags.map(t => <span key={t} className="R-ptag-item">{t}</span>)}
              </div>
            </div>
          ))}

          <div className="R-rh">Achievements &amp; Certifications</div>
          {[
            { t: 'Meta Front-End Developer Certificate — Coursera (2024)', c: '#6366f1' },
            { t: 'MongoDB Associate Developer Certification (2024)', c: '#10b981' },
            { t: 'Top 5% LeetCode JavaScript Track · 350+ problems solved', c: '#002366' },
            { t: 'Winner — Graphic Era Hackathon 2023 (Full-Stack Track)', c: '#f59e0b' },
          ].map(a => (
            <div className="R-ach" key={a.t}>
              <div className="R-adot" style={{ background: a.c }} />
              <div className="R-atxt">{a.t}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="R-strip" />
    </div>
  </>
));

export default ResumeTemplate;