import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  LuBell,
  LuCircleUserRound,
  LuLayoutDashboard,
  LuList,
  LuLogOut,
  LuPlus,
  LuUser,
} from "react-icons/lu";
import logo from "./assets/maven-logo.svg";
import Dashboard from "./pages/Dashboard";
import AddLead from "./pages/AddLead";
import MyLeads from "./pages/MyLeads";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const SESSION_KEY = "crm_panel_session";

function getStoredSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function RequireAuth({ children }) {
  const session = getStoredSession();
  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const navigate = useNavigate();
  const session = getStoredSession();
  const user = session?.user;
  const displayName = user?.name || user?.email || "Lead Generator";
  const displayRole = user?.role || "Sales Team";

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    navigate("/login", { replace: true });
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <div className="panel-shell">
              <aside className="sidebar">
                <div className="logo-card">
                  <img src={logo} alt="Maven Jobs" className="login-brand-logo" style={{ width: "120px" }} />
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
                  <span className="sidebar-foot-avatar">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="sidebar-foot-title">{displayName}</p>
                    <p className="sidebar-foot-copy">{displayRole}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Logout"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "inherit",
                      opacity: 0.6,
                      display: "flex",
                      alignItems: "center",
                      padding: "4px",
                      flexShrink: 0,
                    }}
                  >
                    <LuLogOut size={16} />
                  </button>
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
                        <strong>{displayName}</strong>
                        <span>{displayRole}</span>
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
          </RequireAuth>
        }
      />
    </Routes>
  );
}
