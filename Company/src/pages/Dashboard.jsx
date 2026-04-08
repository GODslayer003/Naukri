import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuArrowRight,
  LuBellRing,
  LuBriefcaseBusiness,
  LuFileText,
  LuMapPin,
  LuQrCode,
  LuShieldAlert,
  LuShieldCheck,
  LuUsers,
} from "react-icons/lu";
import { fetchCompanyDashboard } from "../api/companyApi";

const packageCards = [
  {
    name: "Standard",
    posts: 5,
    description: "Starter package for focused hiring and foundational growth.",
  },
  {
    name: "Premium",
    posts: 10,
    description: "Balanced plan for companies managing active and recurring openings.",
  },
  {
    name: "Elite",
    posts: 20,
    description: "High-capacity package for scale hiring across teams and locations.",
  },
];

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getApplicationClass = (value = "") => {
  const normalized = String(value || "").toLowerCase();
  if (
    [
      "applied",
      "screening",
      "shortlisted",
      "interview",
      "offered",
      "hired",
      "rejected",
    ].includes(normalized)
  ) {
    return `app-status-${normalized}`;
  }
  return "app-status-default";
};

const getApprovalTone = (value = "") => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "approved") {
    return "is-success";
  }
  if (normalized === "rejected") {
    return "is-danger";
  }
  return "is-warning";
};

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await fetchCompanyDashboard();
        if (isMounted) {
          setDashboard(data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError?.response?.data?.message || "Unable to load dashboard");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const company = dashboard?.company || {};
  const tracking = dashboard?.tracking || {};

  const metrics = useMemo(
    () => [
      {
        label: "Package slots",
        value: `${Number(company.activeJobCount || 0)}/${Number(company.jobLimit || 0)}`,
        detail: `${Number(company.remainingSlots || 0)} slots available`,
        icon: LuBriefcaseBusiness,
        tone: "blue",
      },
      {
        label: "Pending approvals",
        value: Number(tracking.pendingApprovals || 0),
        detail: `${Number(tracking.packageOverflowRequests || 0)} package overflow requests`,
        icon: LuShieldCheck,
        tone: "amber",
      },
      {
        label: "Applications",
        value: Number(tracking.totalApplications || 0),
        detail: `${Number(tracking.uniqueCandidates || 0)} unique candidates`,
        icon: LuUsers,
        tone: "lime",
      },
      {
        label: "Active jobs",
        value: Number(tracking.activeApprovedJobs || 0),
        detail: `${Number(tracking.rejectedJobs || 0)} rejected posts`,
        icon: LuQrCode,
        tone: "emerald",
      },
    ],
    [company.activeJobCount, company.jobLimit, company.remainingSlots, tracking],
  );

  const pendingJobs = useMemo(
    () => (dashboard?.jobs || []).filter((job) => job.approvalStatus === "PENDING").slice(0, 4),
    [dashboard],
  );

  const recentJobs = useMemo(() => (dashboard?.jobs || []).slice(0, 6), [dashboard]);
  const recentApplications = useMemo(() => (dashboard?.applications || []).slice(0, 8), [dashboard]);

  const utilization = useMemo(() => {
    const active = Number(company.activeJobCount || 0);
    const limit = Number(company.jobLimit || 0);
    const safeLimit = limit > 0 ? limit : 1;
    return Math.min(100, Math.round((active / safeLimit) * 100));
  }, [company.activeJobCount, company.jobLimit]);

  if (isLoading) {
    return (
      <div className="company-page-state">
        <div className="company-panel-card">
          <h2>Loading company dashboard...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="company-page-state">
        <div className="status-banner">{error}</div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="company-page-state">
        <div className="company-panel-card">
          <h2>No dashboard data available.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="company-dashboard">
      <section className="company-panel-card company-hero-card">
        <div className="company-hero-copy">
          <p className="company-section-eyebrow">Company command center</p>
          <h2 className="company-hero-title">
            {company.name || "Company"} hiring operations
          </h2>
          <p className="company-section-copy">
            Monitor approvals, hiring progress, and package utilization from one clean operational view.
          </p>

          <div className="company-hero-meta">
            <span className={`company-status-badge ${company.status === "ACTIVE" ? "is-success" : "is-danger"}`}>
              {company.status || "ACTIVE"}
            </span>
            <span className="company-context-pill">{company.packageType || "STANDARD"} package</span>
            <span className="company-hero-muted">Last updated {company.lastUpdated || "-"}</span>
          </div>
        </div>

        <div className="company-hero-side">
          <p className="company-hero-side-label">Package utilization</p>
          <p className="company-hero-side-value">
            {Number(company.activeJobCount || 0)} / {Number(company.jobLimit || 0)} jobs
          </p>
          <div className="company-progress-track">
            <span className="company-progress-fill" style={{ width: `${utilization}%` }} />
          </div>
          <p className="company-hero-side-note">
            {Number(company.remainingSlots || 0)} posting slots available
          </p>
          <Link to="/create-job" className="company-hero-action">
            Create New Job
            <LuArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="company-metric-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="company-metric-card">
            <div className="company-metric-head">
              <p>{metric.label}</p>
              <span className={`company-metric-icon tone-${metric.tone || "blue"}`}>
                <metric.icon size={20} />
              </span>
            </div>
            <strong>{metric.value}</strong>
            <span>{metric.detail}</span>
          </article>
        ))}
      </section>

      <section className="company-main-grid company-main-grid-modern">
        <article className="company-panel-card">
          <div className="company-section-head">
            <p className="company-section-eyebrow">Operational readiness</p>
            <h2 className="company-section-title">Account and package posture</h2>
            <p className="company-section-copy">
              Align hiring volume to package capacity while keeping decision-makers informed in real-time.
            </p>
          </div>

          <div className="company-package-grid company-package-grid-modern">
            {packageCards.map((item) => {
              const isActive =
                String(company.packageType || "").toUpperCase() ===
                item.name.toUpperCase();

              return (
                <div
                  key={item.name}
                  className={`company-package-card ${isActive ? "company-package-card-active" : ""}`}
                >
                  <div className="company-package-top">
                    <h3>{item.name}</h3>
                    <span className="company-badge">{item.posts} posts</span>
                  </div>
                  <p>{item.description}</p>
                </div>
              );
            })}
          </div>

          <div className="company-jobs-table-wrap">
            <table className="company-jobs-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Applicants</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.length ? (
                  recentJobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <p className="company-table-main">{job.title || "Untitled job"}</p>
                        <p className="company-table-sub">
                          {job.department || "General"} | {job.location || "Location pending"}
                        </p>
                      </td>
                      <td>
                        <span className={`company-status-badge ${getApprovalTone(job.approvalStatus)}`}>
                          {job.approvalStatus || "PENDING"}
                        </span>
                      </td>
                      <td>{Number(job.applicantCount || 0)}</td>
                      <td>{job.lastUpdated || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="company-empty-cell">
                      No jobs posted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="company-panel-card">
          <div className="company-section-head">
            <p className="company-section-eyebrow">Action center</p>
            <h2 className="company-section-title">Approval and hiring signals</h2>
            <p className="company-section-copy">
              Keep track of overflow approvals and make faster planning decisions.
            </p>
          </div>

          <div className="company-output-stack">
            <div className="company-output-card">
              <div>
                <p>Overflow requests</p>
                <strong>{Number(tracking.packageOverflowRequests || 0)}</strong>
              </div>
              <span className="company-output-icon tone-blue">
                <LuBellRing size={20} />
              </span>
            </div>

            <div className="company-output-card">
              <div>
                <p>Total jobs posted</p>
                <strong>{Number(tracking.totalJobs || 0)}</strong>
              </div>
              <span className="company-output-icon tone-emerald">
                <LuShieldAlert size={20} />
              </span>
            </div>
          </div>

          <div className="company-feed-list">
            {pendingJobs.length ? (
              pendingJobs.map((job) => (
                <div key={job.id} className="company-feed-item">
                  <div>
                    <p className="company-feed-title">{job.title || "-"}</p>
                    <p className="company-feed-copy">
                      <LuMapPin size={14} /> {job.location || "Location pending"}
                    </p>
                    <p className="company-feed-meta">
                      Updated {job.lastUpdated || "-"}
                      {job.requiresPackageOverride ? " | Package overflow request" : ""}
                    </p>
                  </div>
                  <span className="company-status-badge is-warning">{job.approvalStatus || "PENDING"}</span>
                </div>
              ))
            ) : (
              <p className="company-empty-copy">No pending approvals.</p>
            )}
          </div>
        </article>
      </section>

      <section className="company-panel-card">
        <div className="company-section-head">
          <p className="company-section-eyebrow">Application flow</p>
          <h2 className="company-section-title">Candidate application directory</h2>
          <p className="company-section-copy">
            View recent candidate submissions with role mapping, status, and contact details.
          </p>
        </div>

        <div className="company-jobs-table-wrap">
          <table className="company-jobs-table company-applications-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Applied role</th>
                <th>Status</th>
                <th>Contact</th>
                <th>Applied on</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.length ? (
                recentApplications.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <p className="company-table-main">
                        {application.candidateName || "Candidate"}
                      </p>
                      <p className="company-table-sub">{application.candidateCurrentTitle || "Role not set"}</p>
                    </td>
                    <td>
                      <p className="company-table-main">
                        <LuFileText size={14} /> {application.jobTitle || "Job not found"}
                      </p>
                    </td>
                    <td>
                      <span className={`company-application-chip ${getApplicationClass(application.status)}`}>
                        {application.status || "APPLIED"}
                      </span>
                    </td>
                    <td>
                      <p className="company-table-sub">{application.candidateEmail || "-"}</p>
                      <p className="company-table-sub">{application.candidatePhone || "-"}</p>
                    </td>
                    <td>{formatDate(application.appliedAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="company-empty-cell">
                    No applications received yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
