import { NavLink, Route, Routes } from "react-router-dom";
import {
  LuBell,
  LuCircleUserRound,
  LuLayoutDashboard,
  LuList,
  LuPlus,
  LuUser,
} from "react-icons/lu";
import logo from "./assets/maven-logo.svg";
import Dashboard from "./pages/Dashboard";
import AddLead from "./pages/AddLead";
import MyLeads from "./pages/MyLeads";

export default function App() {
  return (
    <div className="panel-shell">
      <aside className="sidebar">
        <div className="logo-card">
          <img src={logo} alt="Maven Jobs" className="logo-image" />
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
          >
            <LuLayoutDashboard />
            Dashboard
          </NavLink>

          <NavLink
            to="/add-lead"
            className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
          >
            <LuPlus />
            Add Lead
          </NavLink>

          <NavLink
            to="/my-leads"
            className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
          >
            <LuList />
            My Leads
          </NavLink>

          <button type="button" className="sidebar-link sidebar-link-muted">
            <LuUser />
            Profile
          </button>
        </nav>

        <div className="sidebar-foot">
          <span className="sidebar-foot-avatar">LG</span>
          <div>
            <p className="sidebar-foot-title">Lead Generator</p>
            <p className="sidebar-foot-copy">Sales Team</p>
          </div>
        </div>
      </aside>

      <main className="page-shell">
        <header className="top-bar">
          <div className="search-wrap">
            <input type="text" placeholder="Search by name or email..." />
          </div>

          <div className="top-bar-actions">
            <button type="button" className="icon-btn" aria-label="Notifications">
              <LuBell />
            </button>
            <div className="profile-chip">
              <div className="profile-meta">
                <strong>Alex Morgan</strong>
                <span>Lead Specialist</span>
              </div>
              <span className="profile-avatar">
                <LuCircleUserRound />
              </span>
            </div>
          </div>
        </header>

        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="/add-lead" element={<AddLead />} />
          <Route path="/my-leads" element={<MyLeads />} />
        </Routes>
      </main>
    </div>
  );
}
