import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuArrowRight,
  LuBadgeCheck,
  LuClock3,
  LuPlus,
  LuSparkles,
  LuSend,
} from "react-icons/lu";
import { fetchLeadDashboard } from "../api/leadApi";

const SESSION_KEY = "crm_panel_session";

const getSessionUser = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.user || null;
  } catch {
    return null;
  }
};

const statusToneMap = {
  NEW: "tag-blue",
  CONTACTED: "tag-amber",
  QUALIFIED: "tag-violet",
  FOLLOW_UP: "tag-orange",
  WON: "tag-green",
  LOST: "tag-rose",
  CONVERTED: "tag-green",
  FORWARDED: "tag-blue",
  ASSIGNED: "tag-blue",
};

const formatDate = (value) => {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatStatus = (value = "") =>
  value
    .toLowerCase()
    .split("_")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sessionUser = getSessionUser();

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await fetchLeadDashboard();
        if (mounted) {
          setDashboard(data);
          setError("");
        }
      } catch (requestError) {
        if (mounted) {
          setError(requestError.response?.data?.message || "Unable to load dashboard");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const summary = dashboard?.summary || {};
  const recentLeads = dashboard?.recentLeads || [];
  const pipeline = dashboard?.pipeline || [];
  const activeZone = sessionUser?.zone || dashboard?.zone || "";
  const activeState = sessionUser?.state || dashboard?.state || "";

  const countByStatuses = (statuses = []) =>
    pipeline
      .filter((item) => statuses.includes(String(item.label || "").toUpperCase()))
      .reduce((total, item) => total + Number(item.value || 0), 0);

  const convertedCount = countByStatuses(["CONVERTED", "WON"]);
  const forwardedCount = countByStatuses(["FORWARDED", "ASSIGNED"]);

  const totalConverted = convertedCount;
  const totalForwarded = forwardedCount;

  const convertedDescription = "Successfully converted";
  const forwardedDescription = "Sent to State Manager pipeline";

  const totalConvertedSafe = Number(totalConverted || 0);

  return (
    <div className="page-section">
      <section className="hero-card">
        <div className="hero-copy">
          <div className="eyebrow">
            <LuSparkles />
            Lead Generator Panel
          </div>
          <h1>Welcome back</h1>
          <p>
            Here's what is happening with your leads today.
          </p>
          {activeZone || activeState ? (
            <p style={{ marginTop: "8px", fontWeight: 600, color: "#0f172a" }}>
              Territory: {activeState || "State not assigned"}{activeZone ? `, ${activeZone} Zone` : ""}
            </p>
          ) : null}
        </div>

        <div className="hero-actions">
          <Link to="/add-lead" className="button button-primary">
            <LuPlus />
            Add New Lead
          </Link>
        </div>
      </section>

      {error ? <div className="status-banner">{error}</div> : null}

      <section className="stat-grid">
        <article className="stat-card stat-card-submitted">
          <div className="stat-card-top">
            <span>Total Leads</span>
            <span className="stat-icon stat-icon-blue">
              <LuClock3 />
            </span>
          </div>
          <h2>{loading ? "..." : summary.totalLeads || 0}</h2>
          <p>{summary.leadsThisMonth || 0} added this month</p>
        </article>

        <article className="stat-card stat-card-approved">
          <div className="stat-card-top">
            <span>Converted Leads</span>
            <span className="stat-icon stat-icon-green">
              <LuBadgeCheck />
            </span>
          </div>
          <h2>{loading ? "..." : totalConvertedSafe || 0}</h2>
          <p>{convertedDescription}</p>
        </article>

        <article className="stat-card stat-card-forwarded">
          <div className="stat-card-top">
            <span>Forwarded Leads</span>
            <span className="stat-icon stat-icon-blue">
              <LuSend />
            </span>
          </div>
          <h2>{loading ? "..." : totalForwarded || 0}</h2>
          <p>{forwardedDescription}</p>
        </article>
      </section>

      <section className="content-grid">
        <article className="data-card recent-leads-card">
          <div className="card-header recent-leads-header">
            <div>
              <h3 className="recent-title">Recent Leads</h3>
              <p className="recent-subtitle">Recent Activity</p>
            </div>
            <Link to="/my-leads" className="button recent-add-btn">
              View All
              <LuArrowRight />
            </Link>
          </div>

          <div className="table-wrap">
            <table className="lead-table recent-table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Date Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.length ? (
                  recentLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td>{lead.companyName}</td>
                      <td>{formatDate(lead.createdAt)}</td>
                      <td>
                        <span className={`tag ${statusToneMap[lead.status] || "tag-neutral"}`}>
                          {formatStatus(lead.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="empty-cell">
                      No leads yet. Use Add New Lead to create the first record.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}
