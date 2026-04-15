import { useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import {
  LuBell,
  LuBuilding2,
  LuCircleUserRound,
  LuLayoutDashboard,
  LuList,
  LuLogOut,
  LuPlus,
  LuQrCode,
  LuUser,
  LuMenu,
  LuX,
} from "react-icons/lu";
import logo from "./assets/maven-logo.svg";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddLead from "./pages/AddLead";
import MyLeads from "./pages/MyLeads";
import Profile from "./pages/Profile";
import ClientAccounts from "./pages/ClientAccounts";
import QRManagement from "./pages/QRManagement";

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
  const location = useLocation();
  const [session, setSession] = useState(getSession);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);
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
            <div className={`panel-shell ${isSidebarOpen ? "" : "is-collapsed"} ${isSidebarOpen ? "is-mobile-open" : ""}`}>
              <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
              <aside className="sidebar">
                <div className="logo-card">
                  <img src={logo} alt="Maven Jobs" className="login-brand-logo" style={{ width: "120px" }} />
                  <button 
                    className="icon-btn lg-hide" 
                    onClick={() => setIsSidebarOpen(false)}
                    style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'white' }}
                  >
                    <LuX size={20} />
                  </button>
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
                    to="/client-accounts"
                    className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
                  >
                    <LuBuilding2 />
                    Client Accounts
                  </NavLink>
                  <NavLink
                    to="/qr-management"
                    className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
                  >
                    <LuQrCode />
                    QR Management
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
                <header className="top-bar">
                  <div className="top-bar-left">
                    <button 
                      type="button" 
                      className="icon-btn" 
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      aria-label="Toggle Sidebar"
                    >
                      <LuMenu />
                    </button>
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
                  <Route path="/client-accounts" element={<ClientAccounts />} />
                  <Route path="/qr-management" element={<QRManagement />} />
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
