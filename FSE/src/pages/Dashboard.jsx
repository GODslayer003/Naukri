import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuArrowRight,
  LuChartNoAxesCombined,
  LuCircleCheckBig,
  LuClock3,
  LuClipboardList,
  LuListChecks,
} from "react-icons/lu";
import { fetchFseDashboard } from "../api/fseApi";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchFseDashboard();
        setData(result);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="page-section">
        <div className="data-card">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-section">
        <div className="status-banner">{error}</div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const recentLeads = data?.recentLeads || [];

  const statusTagClass = (status) => {
    if (status === "CONVERTED") {
      return "tag tag-green";
    }
    if (["LOST", "REJECTED"].includes(status)) {
      return "tag tag-rose";
    }
    return "tag tag-blue";
  };

  return (
    <div className="page-section">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">
            <LuClipboardList />
            FSE Workspace
          </p>
          <h1>Dashboard Overview</h1>
          <p>Track assigned leads, follow-ups, and conversion performance.</p>
        </div>
        <Link to="/my-leads" className="button button-primary">
          Open Assigned Leads
          <LuArrowRight />
        </Link>
      </section>

      <section className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
        <article className="stat-card stat-card-submitted">
          <div className="stat-card-top">
            <span>Total Assigned</span>
            <span className="stat-icon stat-icon-blue"><LuListChecks /></span>
          </div>
          <h2>{summary.totalAssigned || 0}</h2>
          <p>Leads currently linked to your account</p>
        </article>
        <article className="stat-card">
          <div className="stat-card-top">
            <span>Pending</span>
            <span className="stat-icon stat-icon-blue"><LuClock3 /></span>
          </div>
          <h2>{summary.pending || 0}</h2>
          <p>In-progress follow-up leads</p>
        </article>
        <article className="stat-card stat-card-approved">
          <div className="stat-card-top">
            <span>Converted</span>
            <span className="stat-icon stat-icon-green"><LuCircleCheckBig /></span>
          </div>
          <h2>{summary.converted || 0}</h2>
          <p>Successfully closed customers</p>
        </article>
        <article className="stat-card">
          <div className="stat-card-top">
            <span>Follow-ups Today</span>
            <span className="stat-icon stat-icon-blue"><LuClock3 /></span>
          </div>
          <h2>{summary.followUpsToday || 0}</h2>
          <p>Next actions planned for today</p>
        </article>
        <article className="stat-card">
          <div className="stat-card-top">
            <span>Conversion Rate</span>
            <span className="stat-icon stat-icon-green"><LuChartNoAxesCombined /></span>
          </div>
          <h2>{summary.conversionRate || 0}%</h2>
          <p>Overall close rate from assigned leads</p>
        </article>
      </section>

      <section className="data-card">
        <div className="card-header">
          <div className="section-copy">
            <h2>Recent Activity</h2>
            <p>Latest updates from your assigned leads</p>
          </div>
        </div>

        {recentLeads.length ? (
          <div className="table-wrap">
            <table className="lead-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <strong>{lead.companyName || "-"}</strong>
                      <small>{lead.contactName || "-"}</small>
                    </td>
                    <td><span className={statusTagClass(lead.status)}>{lead.status}</span></td>
                    <td>{lead.updatedAt ? new Date(lead.updatedAt).toLocaleString("en-IN") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="helper-copy">No assigned leads yet.</p>
        )}
      </section>
    </div>
  );
}
