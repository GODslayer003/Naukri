import { useEffect, useState } from "react";
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
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddLead from "./pages/AddLead";
import MyLeads from "./pages/MyLeads";
import Profile from "./pages/Profile";

const SESSION_KEY = "crm_panel_session";

const getSession = () => {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

function RequireAuth({ children }) {
  const session = getSession();
  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const navigate = useNavigate();
  const [session, setSession] = useState(getSession);
  useEffect(() => {
    const syncSession = () => setSession(getSession());
    window.addEventListener("crm-session-updated", syncSession);
    window.addEventListener("storage", syncSession);
    return () => {
      window.removeEventListener("crm-session-updated", syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  const user = session?.user || {};
  const displayName = user.fullName || user.email || "Field Sales Executive";
  const displayRole = user.role || "FSE";
  const profileImage = user.profileImage || "";

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event("crm-session-updated"));
    navigate("/login", { replace: true });
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={(
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
                    Assigned Leads
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
                  {profileImage ? (
                    <img src={profileImage} alt={displayName} className="sidebar-foot-avatar-img" />
                  ) : (
                    <span className="sidebar-foot-avatar">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="sidebar-foot-title">{displayName}</p>
                    <p className="sidebar-foot-copy">{user.zone ? `${user.zone} Zone` : "Field Team"}</p>
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
                      {profileImage ? (
                        <img src={profileImage} alt={displayName} className="profile-avatar-img" />
                      ) : (
                        <span className="profile-avatar">
                          <LuCircleUserRound />
                        </span>
                      )}
                    </div>
                  </div>
                </header>

                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="/add-lead" element={<AddLead />} />
                  <Route path="/my-leads" element={<MyLeads />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </main>
            </div>
          </RequireAuth>
        )}
      />
    </Routes>
  );
}
