import { LuBell, LuLogOut, LuMenu } from "react-icons/lu";
import { useLocation, useNavigate } from "react-router-dom";
import { getCandidatePageMeta } from "../config/candidateMenuConfig";
import { clearStoredSession, getStoredSession } from "../services/candidateApi";

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

export default function CandidateHeader({ toggleSidebar }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const pageMeta = getCandidatePageMeta(pathname);
  const session = getStoredSession();
  const user = session?.user || null;
  const profile = session?.profile || null;

  const displayName = user?.name || "Candidate";
  const displayDesignation =
    profile?.currentTitle || user?.designation || "Candidate Portal";
  const initials = getInitials(displayName) || "C";

  const handleLogout = () => {
    clearStoredSession();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur md:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-2xl border border-slate-200 p-2.5 text-slate-700 transition-all duration-200 hover:border-lime-300 hover:bg-lime-50"
        >
          <LuMenu size={20} />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            {pageMeta.panelLabel}
          </p>
          <h1 className="mt-1 text-lg font-bold text-slate-900">
            {pageMeta.title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/candidate/notifications")}
          className="rounded-2xl border border-slate-200 p-2.5 text-slate-700 transition-all duration-200 hover:border-lime-300 hover:bg-lime-50 hover:text-[#163060]"
        >
          <LuBell size={18} />
        </button>

        {/* Candidate identity pill */}
        <div
          className="hidden cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2 transition-all duration-200 hover:border-lime-300 hover:bg-lime-50 sm:flex"
          onClick={() => navigate("/candidate/profile")}
          title="View Profile"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#163060] text-xs font-bold text-white shadow">
            {initials}
          </div>
          <div className="min-w-0 text-left">
            <p className="max-w-[120px] truncate text-xs font-semibold text-slate-800">
              {displayName}
            </p>
            <p className="max-w-[120px] truncate text-[10px] text-slate-400">
              {displayDesignation}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        >
          <LuLogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
