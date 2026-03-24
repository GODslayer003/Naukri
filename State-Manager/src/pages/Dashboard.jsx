import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuCircleAlert,
  LuUsers,
  LuCircleCheck,
  LuTrendingUp,
  LuArrowRight,
} from "react-icons/lu";
import { fetchLeadDashboard } from "../api/leadApi";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

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
    totalAssigned,
    conversionRate,
    conversionGrowth,
    teamOverview,
    recentActivity,
  } = dashboard || {};

  return (
    <div className="page-section" style={{ padding: "24px 32px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1e3a8a", margin: 0, letterSpacing: "-0.5px" }}>
            Dashboard Overview
          </h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "1rem" }}>
            State Level Control Center
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
        <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px", position: "relative", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Conversion Rate</span>
            <div style={{ backgroundColor: "#9333ea", color: "#fff", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LuTrendingUp size={24} />
            </div>
          </div>
          <div style={{ marginTop: "16px", display: "flex", alignItems: "baseline", gap: "12px" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: "700", color: "#9333ea", lineHeight: "1" }}>{conversionRate}</span>
            <span style={{ fontSize: "1rem", fontWeight: "700", color: "#16a34a" }}>{conversionGrowth}</span>
          </div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px" }}>

        {/* Team Overview Section */}
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1e3a8a", margin: 0 }}>Team Overview</h2>
            <Link to="#" style={{ fontSize: "0.875rem", fontWeight: "600", color: "#1e3a8a", textDecoration: "none" }}>View All</Link>
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
                {teamOverview?.map((fse, index) => (
                  <tr key={fse.id} style={{ borderBottom: index < teamOverview.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: "600", color: "#475569" }}>
                          {fse.initials}
                        </div>
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
                ))}
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
            {recentActivity?.map((activity) => {
              // Map type to colors
              const colorMap = {
                success: "#10b981",
                danger: "#ef4444",
                primary: "#1e3a8a",
                default: "#64748b"
              };
              const dotColor = colorMap[activity.type] || colorMap.default;

              return (
                <div key={activity.id} style={{ display: "flex", gap: "16px", position: "relative" }}>
                  <div style={{ marginTop: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: dotColor }}></div>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "0.875rem", color: "#334155", fontWeight: "500", lineHeight: "1.4" }}>
                      {activity.text}
                    </p>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{activity.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ padding: "16px 24px", marginTop: "auto", textAlign: "center", borderTop: "1px solid #f1f5f9" }}>
            <Link to="#" style={{ fontSize: "0.875rem", fontWeight: "600", color: "#1e3a8a", textDecoration: "none" }}>View All Notifications</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
