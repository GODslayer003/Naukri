import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  LuBell,
  LuCircleUserRound,
  LuLayoutDashboard,
  LuList,
  LuLogOut,
  LuPlus,
  LuUser,
  LuSearch,
} from "react-icons/lu";
import logo from "./assets/maven-logo.svg";
import Dashboard from "./pages/Dashboard";
import AddLead from "./pages/AddLead";
import ValidationQueue from "./pages/ValidationQueue";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

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
  const displayName = user?.name || user?.email || "State Manager";
  const displayRole = user?.role || "Sales Manager";

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
                    to="/validation-queue"
                    className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
                  >
                    <LuList />
                    Validation Queue
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
                  <div className="search-wrap" style={{ position: "relative" }}>
                    <LuSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} size={18} />
                    <input type="text" placeholder="Global search..." style={{ paddingLeft: "38px" }} />
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
                  <Route path="/validation-queue" element={<ValidationQueue />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </main>
            </div>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
