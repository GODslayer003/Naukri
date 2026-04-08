import { useEffect, useMemo, useState } from "react";
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  LuBell,
  LuBuilding2,
  LuBriefcaseBusiness,
  LuFileText,
  LuLayoutDashboard,
  LuLogOut,
  LuMenu,
  LuSettings,
} from "react-icons/lu";
import logo from "./assets/maven-logo.svg";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateJob from "./pages/CreateJob";
import Profile from "./pages/Profile";
import Applies from "./pages/Applies";

const SESSION_KEY = "company_panel_session";

const parseSession = () => {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
};

function RequireAuth({ children }) {
  const session = parseSession();
  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

const navItems = [
  { path: "/", label: "Dashboard", icon: LuLayoutDashboard },
  { path: "/create-job", label: "Create Job", icon: LuBriefcaseBusiness },
  { path: "/applies", label: "Applies", icon: LuFileText },
  { path: "/profile", label: "Profile", icon: LuSettings },
];

const pageMeta = (pathname) => {
  if (pathname.startsWith("/create-job")) {
    return { panelLabel: "Company Panel", title: "Create Job" };
  }

  if (pathname.startsWith("/profile")) {
    return { panelLabel: "Company Panel", title: "Profile" };
  }

  if (pathname.startsWith("/applies")) {
    return { panelLabel: "Company Panel", title: "Applies" };
  }

  return { panelLabel: "Company Panel", title: "Dashboard" };
};

function PanelLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(parseSession);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const displayUser = useMemo(() => {
    const user = session?.user || {};
    const company = session?.company || {};

    return {
      username: user.username || "Client User",
      email: user.email || "",
      companyName: user.companyName || company.name || "Company",
      packageType: company.packageType || "STANDARD",
    };
  }, [session]);

  useEffect(() => {
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  const syncSession = () => setSession(parseSession());

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    syncSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="company-shell">
      <div
        className={`company-sidebar-backdrop ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={`company-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="company-sidebar-brand">
          <img src={logo} alt="Maven Jobs" className="company-sidebar-logo" />
        </div>

        <nav className="company-nav">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) => `company-nav-link ${isActive ? "active" : ""}`}
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="company-sidebar-user">
          <p className="company-user-name">{displayUser.companyName}</p>
          <p className="company-user-role">{displayUser.packageType} package</p>
          <p className="company-user-email">{displayUser.email || "No email linked"}</p>
        </div>
      </aside>

      <div className="company-main-wrap">
        <header className="company-header">
          <div className="company-header-left">
            <button
              type="button"
              className="company-menu-btn"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <LuMenu size={20} />
            </button>
            <div>
              <p className="company-panel-label">{pageMeta(pathname).panelLabel}</p>
              <h1 className="company-page-title">{pageMeta(pathname).title}</h1>
            </div>
          </div>

          <div className="company-header-actions">
            <button type="button" className="company-icon-btn" aria-label="Notifications">
              <LuBell size={18} />
              <span className="company-dot" />
            </button>
            <button type="button" className="company-header-logout" onClick={handleLogout}>
              <LuLogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <main className="company-main">
          <section className="company-panel-context">
            <span className="company-context-pill company-context-pill-primary">
              <LuBuilding2 size={14} />
              {displayUser.companyName}
            </span>
            <span className="company-context-pill">{displayUser.packageType} package</span>
          </section>

          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="/create-job" element={<CreateJob onSessionRefresh={syncSession} />} />
            <Route path="/applies" element={<Applies />} />
            <Route path="/profile" element={<Profile onSessionRefresh={syncSession} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <PanelLayout />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
