import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuCircleAlert,
  LuUsers,
  LuCircleCheck,
  LuTrendingUp,
  LuArrowRight,
  LuFileText,
} from "react-icons/lu";
import { fetchLeadDashboard } from "../api/leadApi";
import MemberReportModal from "../components/MemberReportModal";

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

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [reportMember, setReportMember] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    // simple clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  useEffect(() => {
    if (!isNotificationsModalOpen && !isTeamModalOpen) {
      return undefined;
    }

    const onEscape = (event) => {
      if (event.key === "Escape") {
        setIsNotificationsModalOpen(false);
        setIsTeamModalOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onEscape);
    };
  }, [isNotificationsModalOpen, isTeamModalOpen]);

  if (loading) {
    return (
      <div className="page-section" style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px', color: '#64748b' }}>
        Loading dashboard metrics...
      </div>
    );
  }

  if (error) {
    return <div className="page-section"><div className="status-banner">{error}</div></div>;
  }

  const {
    pendingValidation,
    activeFses,
    activeLeadGenerators,
    totalAssigned,
    conversionRate,
    conversionGrowth,
    teamOverview,
    recentActivity,
    rolePerformance,
  } = dashboard || {};

  const allTeamOverview = Array.isArray(teamOverview) ? teamOverview : [];
  const previewTeamOverview = allTeamOverview.slice(0, 3);
  const allNotifications = Array.isArray(recentActivity) ? recentActivity : [];
  const previewNotifications = allNotifications.slice(0, 3);
  const fseSummary = rolePerformance?.fse?.summary || {};
  const leadGeneratorSummary = rolePerformance?.leadGenerator?.summary || {};
  const fsePerformers = Array.isArray(rolePerformance?.fse?.members)
    ? rolePerformance.fse.members
    : [];
  const leadGeneratorPerformers = Array.isArray(rolePerformance?.leadGenerator?.members)
    ? rolePerformance.leadGenerator.members
    : [];
  const previewFsePerformers = fsePerformers.slice(0, 5);
  const previewLeadGeneratorPerformers = leadGeneratorPerformers.slice(0, 5);
  const currentUser = getSessionUser();
  const managerName = currentUser?.fullName || currentUser?.email || "State Manager";
  const managerZone = currentUser?.zone || "Assigned";
  const managerState = currentUser?.state || "State Not Assigned";

  const handleViewReport = (member) => {
    setReportMember(member);
    setIsReportModalOpen(true);
  };

  const renderNotificationItem = (activity) => {
    const colorMap = {
      success: "#10b981",
      danger: "#ef4444",
      primary: "#1e3a8a",
      default: "#64748b"
    };

    const dotColor = colorMap[activity.type] || colorMap.default;

    return (
      <div key={activity.id} className="dashboard-notification-item">
        <div style={{ marginTop: "6px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: dotColor }} />
        </div>
        <div>
          <p style={{ margin: "0 0 4px 0", fontSize: "0.875rem", color: "#334155", fontWeight: "500", lineHeight: "1.4" }}>
            {activity.text}
          </p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{activity.time}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="page-section" style={{ padding: "24px 32px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1e3a8a", margin: 0, letterSpacing: "-0.5px" }}>
            Dashboard Overview
          </h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "1rem" }}>
            {managerZone} Zone, {managerState} | {managerName}
          </p>
        </div>
        <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
          Last updated: Today, {currentTime.toLocaleTimeString("en-US")}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>

        {/* Pending Validation Card */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #fdba74", borderRadius: "12px", padding: "24px", position: "relative", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Leads</span>
            <div style={{ backgroundColor: "#ea580c", color: "#fff", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LuCircleAlert size={24} />
            </div>
          </div>
          <div style={{ marginTop: "16px", marginBottom: "24px" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: "700", color: "#ea580c", lineHeight: "1" }}>{pendingValidation}</span>
          </div>
          <div>
            <Link to="/validation-queue" style={{ color: "#ea580c", fontSize: "0.875rem", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              Review Now <LuArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Active FSEs Card */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px", position: "relative", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Active FSEs</span>
            <div style={{ backgroundColor: "#1e3a8a", color: "#fff", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LuUsers size={24} />
            </div>
          </div>
          <div style={{ marginTop: "16px" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: "700", color: "#1e3a8a", lineHeight: "1" }}>{activeFses}</span>
          </div>
        </div>

        {/* Active Lead Generators Card */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px", position: "relative", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Active Lead Generators</span>
            <div style={{ backgroundColor: "#334155", color: "#fff", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LuUsers size={24} />
            </div>
          </div>
          <div style={{ marginTop: "16px" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: "700", color: "#0f172a", lineHeight: "1" }}>{activeLeadGenerators || 0}</span>
          </div>
        </div>

        {/* Total Assigned Card */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px", position: "relative", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Assigned</span>
            <div style={{ backgroundColor: "#16a34a", color: "#fff", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LuCircleCheck size={24} />
            </div>
          </div>
          <div style={{ marginTop: "16px" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: "700", color: "#16a34a", lineHeight: "1" }}>{totalAssigned}</span>
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div style={{ 
          background: "linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)", 
          border: "none", 
          borderRadius: "16px", 
          padding: "24px", 
          position: "relative", 
          boxShadow: "0 10px 15px -3px rgba(147, 51, 234, 0.2)",
          color: "#fff"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Conversion Rate</span>
            <div style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LuTrendingUp size={24} />
            </div>
          </div>
          <div style={{ marginTop: "16px", display: "flex", alignItems: "baseline", gap: "12px" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: "700", lineHeight: "1" }}>{conversionRate}</span>
            <span style={{ fontSize: "1rem", fontWeight: "700", color: "#4ade80" }}>{conversionGrowth}</span>
          </div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px" }}>

        {/* Team Overview Section */}
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1e3a8a", margin: 0 }}>FSE Team Overview</h2>
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(true)}
              disabled={!allTeamOverview.length}
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                color: allTeamOverview.length ? "#1e3a8a" : "#94a3b8",
                background: "transparent",
                border: 0,
                cursor: allTeamOverview.length ? "pointer" : "not-allowed",
                padding: 0,
              }}
            >
              View All
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ backgroundColor: "#f8fafc", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
                <tr>
                  <th style={{ padding: "16px 24px", fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>FSE Name</th>
                  <th style={{ padding: "16px 24px", fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Location</th>
                  <th style={{ padding: "16px 24px", fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Active Leads</th>
                  <th style={{ padding: "16px 24px", fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {previewTeamOverview.length ? previewTeamOverview.map((fse, index) => (
                  <tr key={fse.id} style={{ borderBottom: index < previewTeamOverview.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {fse.profileImage ? (
                          <img
                            src={fse.profileImage}
                            alt={fse.name}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "1px solid #cbd5e1",
                            }}
                          />
                        ) : (
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: "600", color: "#475569" }}>
                            {fse.initials}
                          </div>
                        )}
                        <span style={{ fontWeight: "500", color: "#334155" }}>{fse.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", color: "#64748b" }}>{fse.location}</td>
                    <td style={{ padding: "16px 24px", color: "#334155", fontWeight: "500" }}>{fse.activeLeads}</td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: fse.status === "Active" ? "#ecfdf5" : "#f1f5f9", color: fse.status === "Active" ? "#10b981" : "#64748b", padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "600" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: fse.status === "Active" ? "#10b981" : "#94a3b8" }}></div>
                        {fse.status}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ padding: "16px 24px", color: "#94a3b8", textAlign: "center" }}>
                      No active FSEs found in this zone.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "24px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1e3a8a", margin: 0 }}>Recent Activity</h2>
          </div>
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "24px", flex: 1 }}>
            {previewNotifications.length ? (
              previewNotifications.map((activity) => renderNotificationItem(activity))
            ) : (
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>No notifications available.</p>
            )}
          </div>
          <div style={{ padding: "16px 24px", marginTop: "auto", textAlign: "center", borderTop: "1px solid #f1f5f9" }}>
            <button
              type="button"
              onClick={() => setIsNotificationsModalOpen(true)}
              disabled={!allNotifications.length}
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                color: allNotifications.length ? "#1e3a8a" : "#94a3b8",
                background: "transparent",
                border: 0,
                cursor: allNotifications.length ? "pointer" : "not-allowed",
                padding: 0,
              }}
            >
              View All Notifications
            </button>
          </div>
        </div>

      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: "24px",
          marginTop: "24px",
        }}
      >
        <section
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1e3a8a", margin: 0 }}>
              FSE performance
            </h2>
            <p style={{ margin: "8px 0 0", fontSize: "0.9rem", color: "#64748b" }}>
              Track assignment load and conversion output across your FSE team.
            </p>
            <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ background: "#e0ecff", color: "#1e3a8a", borderRadius: "999px", padding: "6px 10px", fontSize: "0.75rem", fontWeight: 700 }}>
                {fseSummary.totalMembers ?? 0} total
              </span>
              <span style={{ background: "#ecfdf5", color: "#047857", borderRadius: "999px", padding: "6px 10px", fontSize: "0.75rem", fontWeight: 700 }}>
                {fseSummary.activePerformers ?? 0} active performers
              </span>
              <span style={{ background: "#f5f3ff", color: "#6d28d9", borderRadius: "999px", padding: "6px 10px", fontSize: "0.75rem", fontWeight: 700 }}>
                Conversion: {fseSummary.conversionRate || "0%"}
              </span>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                <tr>
                  <th style={{ padding: "14px 20px", fontSize: "0.72rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>FSE</th>
                  <th style={{ padding: "14px 20px", fontSize: "0.72rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>Active</th>
                  <th style={{ padding: "14px 20px", fontSize: "0.72rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>Converted</th>
                  <th style={{ padding: "14px 20px", fontSize: "0.72rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>Assigned</th>
                  <th style={{ padding: "14px 20px", fontSize: "0.72rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>CVR</th>
                  <th style={{ padding: "14px 20px", fontSize: "0.72rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>Report</th>
                </tr>
              </thead>
              <tbody>
                {previewFsePerformers.length ? (
                  previewFsePerformers.map((member, index) => (
                    <tr key={`fse-performance-${member.id}`} style={{ borderBottom: index < previewFsePerformers.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <td style={{ padding: "14px 20px", color: "#1e293b", fontWeight: "600" }}>{member.name}</td>
                      <td style={{ padding: "14px 20px", color: "#334155" }}>{member.activeLeads ?? 0}</td>
                      <td style={{ padding: "14px 20px", color: "#334155" }}>{member.convertedLeads ?? 0}</td>
                      <td style={{ padding: "14px 20px", color: "#334155" }}>{member.totalAssignedLeads ?? 0}</td>
                      <td style={{ padding: "14px 20px", color: "#1e3a8a", fontWeight: "700" }}>{member.conversionRate || "0%"}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <button 
                          onClick={() => handleViewReport(member)}
                          style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}
                          title="Full Work Report"
                        >
                          <LuFileText size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: "20px", color: "#94a3b8", textAlign: "center" }}>
                      No FSE performance records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1e3a8a", margin: 0 }}>
              Lead Generator performance
            </h2>
            <p style={{ margin: "8px 0 0", fontSize: "0.9rem", color: "#64748b" }}>
              Review lead production, forwarding velocity, and conversion contribution.
            </p>
            <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ background: "#e0ecff", color: "#1e3a8a", borderRadius: "999px", padding: "6px 10px", fontSize: "0.75rem", fontWeight: 700 }}>
                {leadGeneratorSummary.totalMembers ?? 0} total
              </span>
              <span style={{ background: "#fff7ed", color: "#c2410c", borderRadius: "999px", padding: "6px 10px", fontSize: "0.75rem", fontWeight: 700 }}>
                {leadGeneratorSummary.totalGeneratedLeads ?? 0} generated
              </span>
              <span style={{ background: "#ecfdf5", color: "#047857", borderRadius: "999px", padding: "6px 10px", fontSize: "0.75rem", fontWeight: 700 }}>
                Forwarded: {leadGeneratorSummary.forwardedLeads ?? 0}
              </span>
              <span style={{ background: "#f5f3ff", color: "#6d28d9", borderRadius: "999px", padding: "6px 10px", fontSize: "0.75rem", fontWeight: 700 }}>
                Conversion: {leadGeneratorSummary.conversionRate || "0%"}
              </span>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                <tr>
                  <th style={{ padding: "14px 20px", fontSize: "0.72rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>Lead Generator</th>
                  <th style={{ padding: "14px 20px", fontSize: "0.72rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>Generated</th>
                  <th style={{ padding: "14px 20px", fontSize: "0.72rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>Forwarded</th>
                  <th style={{ padding: "14px 20px", fontSize: "0.72rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>Converted</th>
                  <th style={{ padding: "14px 20px", fontSize: "0.72rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>CVR</th>
                  <th style={{ padding: "14px 20px", fontSize: "0.72rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>Report</th>
                </tr>
              </thead>
              <tbody>
                {previewLeadGeneratorPerformers.length ? (
                  previewLeadGeneratorPerformers.map((member, index) => (
                    <tr key={`lg-performance-${member.id}`} style={{ borderBottom: index < previewLeadGeneratorPerformers.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <td style={{ padding: "14px 20px", color: "#1e293b", fontWeight: "600" }}>{member.name}</td>
                      <td style={{ padding: "14px 20px", color: "#334155" }}>{member.totalGeneratedLeads ?? 0}</td>
                      <td style={{ padding: "14px 20px", color: "#334155" }}>{member.forwardedLeads ?? 0}</td>
                      <td style={{ padding: "14px 20px", color: "#334155" }}>{member.convertedLeads ?? 0}</td>
                      <td style={{ padding: "14px 20px", color: "#1e3a8a", fontWeight: "700" }}>{member.conversionRate || "0%"}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <button 
                          onClick={() => handleViewReport(member)}
                          style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}
                          title="Full Work Report"
                        >
                          <LuFileText size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: "20px", color: "#94a3b8", textAlign: "center" }}>
                      No Lead Generator performance records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {isNotificationsModalOpen ? (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => setIsNotificationsModalOpen(false)}
        >
          <section
            className="modal-content dashboard-notifications-modal"
            role="dialog"
            aria-modal="true"
            aria-label="All notifications"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="dashboard-notifications-header">
              <div>
                <h2 className="dashboard-notifications-title">All Notifications</h2>
                <p className="dashboard-notifications-subtitle">
                  Showing {allNotifications.length} recent updates.
                </p>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setIsNotificationsModalOpen(false)}
                aria-label="Close notifications modal"
              >
                &times;
              </button>
            </header>

            <div className="dashboard-notification-scroll">
              {allNotifications.length ? (
                allNotifications.map((activity) => renderNotificationItem(activity))
              ) : (
                <p className="dashboard-notification-empty">No notifications available.</p>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {isTeamModalOpen ? (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => setIsTeamModalOpen(false)}
        >
          <section
            className="modal-content dashboard-team-modal"
            role="dialog"
            aria-modal="true"
            aria-label="All team members"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="dashboard-notifications-header">
              <div>
                <h2 className="dashboard-notifications-title">All Team Members</h2>
                <p className="dashboard-notifications-subtitle">
                  Showing {allTeamOverview.length} FSEs from your zone.
                </p>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setIsTeamModalOpen(false)}
                aria-label="Close team modal"
              >
                &times;
              </button>
            </header>

            <div className="dashboard-team-scroll">
              <table className="dashboard-team-table">
                <thead>
                  <tr>
                    <th>FSE Name</th>
                    <th>Location</th>
                    <th>Active Leads</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allTeamOverview.length ? allTeamOverview.map((fse, index) => (
                    <tr key={`modal-${fse.id}`} className={index === allTeamOverview.length - 1 ? "is-last" : ""}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {fse.profileImage ? (
                            <img
                              src={fse.profileImage}
                              alt={fse.name}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "1px solid #cbd5e1",
                              }}
                            />
                          ) : (
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: "600", color: "#475569" }}>
                              {fse.initials}
                            </div>
                          )}
                          <span style={{ fontWeight: "500", color: "#334155" }}>{fse.name}</span>
                        </div>
                      </td>
                      <td>{fse.location}</td>
                      <td style={{ color: "#334155", fontWeight: "500" }}>{fse.activeLeads}</td>
                      <td>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: fse.status === "Active" ? "#ecfdf5" : "#f1f5f9", color: fse.status === "Active" ? "#10b981" : "#64748b", padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "600" }}>
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: fse.status === "Active" ? "#10b981" : "#94a3b8" }} />
                          {fse.status}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="dashboard-team-empty">No active FSEs found in this zone.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      <MemberReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        member={reportMember}
      />
    </div>
  );
}
