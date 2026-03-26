import {
  LuBuilding2,
  LuCalendar,
  LuCircleCheck,
  LuMail,
  LuMapPin,
  LuPencil,
  LuPhone,
  LuTrash2,
  LuUserRound,
  LuX,
} from "react-icons/lu";

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

export default function LeadDetailModal({
  lead,
  activities = [],
  onClose,
  onLogActivity,
  onEditActivity,
  onDeleteActivity,
}) {
  if (!lead) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content lead-detail-modal" onClick={(event) => event.stopPropagation()}>
        <header className="modal-header header-approved">
          <div className="header-info">
            <div className="header-icon-circle">
              <LuBuilding2 />
            </div>
            <div>
              <h2>Lead Details</h2>
              <p>{lead.leadCode || lead.id} | Status: {lead.status}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <LuX />
          </button>
        </header>

        <div className="modal-body">
          <section className="detail-section">
            <h3>Company Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label"><LuBuilding2 /> COMPANY</span>
                <p className="detail-value">{lead.companyName || "-"}</p>
              </div>
              <div className="detail-item">
                <span className="detail-label"><LuBuilding2 /> CATEGORY</span>
                <p className="detail-value">{lead.businessCategory || "-"}</p>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label"><LuMapPin /> ADDRESS</span>
                <p className="detail-value">{lead.address || `${lead.city || "-"}, ${lead.state || "-"}`}</p>
              </div>
            </div>
          </section>

          <section className="detail-section">
            <h3>Contact Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label"><LuUserRound /> CONTACT PERSON</span>
                <p className="detail-value">{lead.contactName || "-"}</p>
              </div>
              <div className="detail-item">
                <span className="detail-label"><LuPhone /> PHONE</span>
                <p className="detail-value">{lead.phone || "-"}</p>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label"><LuMail /> EMAIL</span>
                <p className="detail-value">{lead.email || "-"}</p>
              </div>
            </div>
          </section>

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
                      <span className="activity-outcome">{activity.outcome || "Follow-up"}</span>
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
                    <p className="activity-notes">{activity.notes || "-"}</p>
                    {activity.nextFollowUpAt ? (
                      <p className="next-follow-up">
                        <LuCalendar className="calendar-icon" /> Next Follow-up: {formatDate(activity.nextFollowUpAt)}
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
