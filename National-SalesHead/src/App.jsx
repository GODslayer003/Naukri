import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  LuBell,
  LuCircleUserRound,
  LuLayoutDashboard,
  LuMap,
  LuUsers,
  LuLogOut,
  LuUser,
  LuList
} from "react-icons/lu";
import logo from "./assets/maven-logo.svg";
import Dashboard from "./pages/Dashboard";
import ZoneBreakdown from "./pages/ZoneBreakdown";
import AllLeads from "./pages/AllLeads";
import Profile from "./pages/Profile";
import Login from "./pages/Login";

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
  const displayName = user?.fullName || user?.email || "National Sales Head";
  const displayRole = "National Sales Head";

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    navigate("/login", { replace: true });
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <div className="panel-shell">
              <aside className="sidebar">
                <div className="logo-card">
                  <img src={logo} alt="Maven Jobs" className="logo-image" style={{ width: "140px" }} />
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
                    to="/zones"
                    className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
                  >
                    <LuMap />
                    Zone Performance
                  </NavLink>

                  <NavLink
                    to="/leads"
                    className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
                  >
                    <LuList />
                    All Leads
                  </NavLink>

                  <NavLink
                    to="/profile"
                    className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
                  >
                    <LuUser />
                    Profile
                  </NavLink>
                </nav>

                <div className="sidebar-foot">
                  <span className="sidebar-foot-avatar">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="sidebar-foot-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</p>
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
                <header className="top-bar" style={{ justifyContent: "flex-end" }}>
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

                <div className="page-content" style={{ overflowY: 'auto', height: 'calc(100vh - 72px)' }}>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="/zones" element={<ZoneBreakdown />} />
                    <Route path="/leads" element={<AllLeads />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </div>
              </main>
            </div>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
