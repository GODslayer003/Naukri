import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuArrowRight,
  LuBadgeCheck,
  LuClock3,
  LuCircleX,
  LuPlus,
  LuSparkles,
} from "react-icons/lu";
import { fetchLeadDashboard } from "../api/leadApi";

const statusToneMap = {
  NEW: "tag-blue",
  CONTACTED: "tag-amber",
  QUALIFIED: "tag-violet",
  FOLLOW_UP: "tag-orange",
  WON: "tag-green",
  LOST: "tag-rose",
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
  const approvedCount = pipeline
    .filter((item) => ["QUALIFIED", "WON"].includes(item.label))
    .reduce((total, item) => total + item.value, 0);
  const rejectedCount = pipeline
    .filter((item) => item.label === "LOST")
    .reduce((total, item) => total + item.value, 0);

  return (
    <div className="page-section">
      <section className="hero-card">
        <div className="hero-copy">
          <div className="eyebrow">
            <LuSparkles />
            Lead Generator Panel
          </div>
          <h1>Welcome back, Alex</h1>
          <p>
            Here's what is happening with your leads today.
          </p>
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
            <span>Approved Leads</span>
            <span className="stat-icon stat-icon-green">
              <LuBadgeCheck />
            </span>
          </div>
          <h2>{loading ? "..." : approvedCount}</h2>
          <p>Validated records</p>
        </article>

        <article className="stat-card stat-card-rejected">
          <div className="stat-card-top">
            <span>Rejected Leads</span>
            <span className="stat-icon stat-icon-red">
              <LuCircleX />
            </span>
          </div>
          <h2>{loading ? "..." : rejectedCount}</h2>
          <p>Needs correction</p>
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
