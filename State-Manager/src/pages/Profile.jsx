import {
  LuUser,
  LuMail,
  LuMapPin,
  LuShield,
} from "react-icons/lu";

const SESSION_KEY = "crm_panel_session";

function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || {};
  } catch {
    return {};
  }
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "16px 20px",
        background: "#f8fafc",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
      }}
    >
      <span
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "#eff6ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#2563eb",
          flexShrink: 0,
        }}
      >
        <Icon size={18} />
      </span>
      <div>
        <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
          {label}
        </p>
        <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1e293b", margin: "2px 0 0" }}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default function Profile() {
  const session = getSession();
  const user = session?.user || {};

  const displayName = user.fullName || user.name || user.email || "Lead Generator";
  const displayEmail = user.email || "—";
  const displayZone = user.zone || user.territory || "—";
  const displayRole = user.role || "LEAD_GENERATOR";

  return (
    <div className="page-section" style={{ maxWidth: "760px", margin: "0 auto" }}>
      {/* Header */}
      <section className="my-leads-heading">
        <h1>My Profile</h1>
        <p>View your account details.</p>
      </section>

      {/* Avatar + Name Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
          borderRadius: "14px",
          padding: "28px",
          marginBottom: "24px",
          color: "#fff",
        }}
      >
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            border: "2px solid rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>{displayName}</h2>
          <p style={{ margin: "4px 0 0", opacity: 0.8, fontSize: "0.85rem" }}>
            {displayRole.replace(/_/g, " ")} · {displayZone} Zone
          </p>
        </div>
      </div>

      {/* Account Info */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "24px",
        }}
      >
        <h3 style={{ margin: "0 0 18px", fontSize: "1rem", fontWeight: 700, color: "#1e293b" }}>
          Account Information
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <InfoCard icon={LuUser} label="Full Name" value={displayName} />
          <InfoCard icon={LuMail} label="Email Address" value={displayEmail} />
          <InfoCard icon={LuMapPin} label="Zone" value={`${displayZone} Zone`} />
          <InfoCard icon={LuShield} label="Role" value={displayRole.replace(/_/g, " ")} />
        </div>
      </div>
    </div>
  );
}
