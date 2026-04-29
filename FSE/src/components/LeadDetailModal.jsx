import {
  LuBuilding2,
  LuCalendar,
  LuCalendarDays,
  LuChartNoAxesCombined,
  LuCircleCheck,
  LuMail,
  LuMapPin,
  LuPencil,
  LuPhone,
  LuSend,
  LuTrash2,
  LuUserRound,
  LuX,
} from "react-icons/lu";

const formatDate = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateOnly = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const PROJECTION_COLOR = {
  "WP > 50": { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  "WP < 50": { bg: "#fefce8", color: "#854d0e", border: "#fde68a" },
  "MP < 50": { bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" },
  "MP > 50": { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
};

export default function LeadDetailModal({
  lead,
  activities = [],
  onClose,
  onLogActivity,
  onEditActivity,
  onDeleteActivity,
  onEditLead,
  onTransferToSM,
}) {
  if (!lead) return null;

  const contactList = Array.isArray(lead.contacts) && lead.contacts.length
    ? lead.contacts
    : [{ fullName: lead.contactName, phone: lead.phone, email: lead.email, designation: "", isPrimary: true }];

  const projStyle = lead.projection ? PROJECTION_COLOR[lead.projection] : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content lead-detail-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="modal-header header-approved">
          <div className="header-info">
            <div className="header-icon-circle"><LuBuilding2 /></div>
            <div>
              <h2>Lead Details</h2>
              <p>{lead.leadCode || lead.id} | Status: {lead.status}</p>
            </div>
          </div>
          <div className="header-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {lead.status === "CONVERTED" && (
              <button 
                className="button button-primary" 
                style={{ background: "#1e40af", color: "#fff", padding: "8px 12px", fontSize: "0.85rem" }}
                onClick={() => onTransferToSM(lead)}
              >
                <LuSend /> Transfer to SM
              </button>
            )}
            <button 
              className="button button-secondary" 
              style={{ padding: "8px 12px", fontSize: "0.85rem" }}
              onClick={() => onEditLead(lead)}
            >
              <LuPencil /> Edit Details
            </button>
            <button className="close-btn" onClick={onClose}><LuX /></button>
          </div>
        </header>

        <div className="modal-body">

          {/* ── Company Information ────────────────────────────────────── */}
          <section className="detail-section">
            <h3>Company Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label"><LuBuilding2 /> COMPANY</span>
                <p className="detail-value">{lead.companyName || "—"}</p>
              </div>
              <div className="detail-item">
                <span className="detail-label"><LuBuilding2 /> CATEGORY</span>
                <p className="detail-value">{lead.businessCategory || "—"}</p>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label"><LuMapPin /> ADDRESS</span>
                <p className="detail-value">{lead.address || `${lead.city || "—"}, ${lead.state || "—"}`}</p>
              </div>

              {/* Sourcing Date */}
              {lead.sourcingDate ? (
                <div className="detail-item">
                  <span className="detail-label"><LuCalendarDays /> SOURCING DATE</span>
                  <p className="detail-value">{formatDateOnly(lead.sourcingDate)}</p>
                </div>
              ) : null}

              {/* Projection */}
              {lead.projection ? (
                <div className="detail-item">
                  <span className="detail-label"><LuChartNoAxesCombined /> PROJECTION</span>
                  <p className="detail-value">
                    <span
                      className="ldm-projection-badge"
                      style={projStyle ? {
                        background: projStyle.bg,
                        color: projStyle.color,
                        border: `1px solid ${projStyle.border}`,
                      } : undefined}
                    >
                      {lead.projection}
                    </span>
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          {/* ── Contact Persons ────────────────────────────────────────── */}
          <section className="detail-section">
            <h3>Contact Person{contactList.length > 1 ? "s" : ""}</h3>
            <div className="ldm-contacts-list">
              {contactList.map((c, idx) => (
                <div key={idx} className="ldm-contact-card">
                  <div className="ldm-contact-top">
                    <span className="ldm-contact-name">
                      <LuUserRound />
                      {c.fullName || "—"}
                    </span>
                    {c.isPrimary || idx === 0 ? (
                      <span className="ldm-primary-badge">Primary</span>
                    ) : null}
                  </div>
                  <div className="ldm-contact-details">
                    {c.phone ? (
                      <a href={`tel:${c.phone}`} className="ldm-contact-link">
                        <LuPhone /> {c.phone}
                      </a>
                    ) : null}
                    {c.email ? (
                      <a href={`mailto:${c.email}`} className="ldm-contact-link">
                        <LuMail /> {c.email}
                      </a>
                    ) : null}
                    {c.designation ? (
                      <span className="ldm-contact-designation">{c.designation}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Follow Ups ─────────────────────────────────────────────── */}
          <section className="detail-section">
            <div className="section-header">
              <h3>Follow Ups</h3>
              <button className="log-activity-btn" onClick={() => onLogActivity(lead)}>
                <LuCircleCheck /> Log Activity
              </button>
            </div>

            {activities.length ? (
              <div className="activities-list">
                {activities.map((activity, index) => (
                  <div key={`${activity.date || "activity"}-${index}`} className="activity-card">
                    <div className="activity-header">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="activity-outcome">{activity.outcome || "Follow-up"}</span>
                        {activity.interactionMode && (
                          <span 
                            className="activity-mode-badge" 
                            style={{ 
                              fontSize: "0.7rem", 
                              padding: "2px 6px", 
                              background: "#f1f5f9", 
                              borderRadius: "4px", 
                              color: "#475569",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            {activity.interactionMode === "Call" ? <LuPhone size={10} /> : <LuMapPin size={10} />}
                            {activity.interactionMode}
                          </span>
                        )}
                      </div>
                      <div className="activity-header-right">
                        <span className="activity-date">{formatDate(activity.date)}</span>
                        <div className="activity-actions">
                          <button className="action-btn edit-btn" title="Edit" onClick={() => onEditActivity(index)}>
                            <LuPencil />
                          </button>
                          <button className="action-btn delete-btn" title="Delete" onClick={() => onDeleteActivity(index)}>
                            <LuTrash2 />
                          </button>
                        </div>
                      </div>
                    </div>
                    {activity.subStatus ? (
                      <p className="activity-substatus" style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600", marginTop: "4px" }}>
                        SubStatus: {activity.subStatus}
                      </p>
                    ) : null}
                    <p className="activity-notes">{activity.notes || "—"}</p>
                    {activity.nextFollowUpAt ? (
                      <p className="next-follow-up">
                        <LuCalendar className="calendar-icon" />
                        Next Follow-up: {formatDate(activity.nextFollowUpAt)}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="follow-up-history">
                <p className="empty-history">No follow-up activities logged yet.</p>
              </div>
            )}
          </section>
        </div>

        <footer className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>Close</button>
        </footer>
      </div>
    </div>
  );
}
