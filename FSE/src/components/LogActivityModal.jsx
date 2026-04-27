import { useEffect, useState } from "react";
import { LuCircleCheck, LuChevronDown, LuX } from "react-icons/lu";

const STATUS_OPTIONS = [
  "Interested",
  "Not Interested",
  "Not Picked",
  "Onboard",
  "Call Later",
  "New",
];

const toDateInput = (value) => {
  if (!value) {
    return "";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toISOString().slice(0, 10);
};

export default function LogActivityModal({ lead, initialData, onClose, onSubmit, isSubmitting }) {
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [subStatus, setSubStatus] = useState("");
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");

  useEffect(() => {
    if (initialData) {
      setOutcome(initialData.outcome || "");
      setNotes(initialData.notes || "");
      setSubStatus(initialData.subStatus || "");
      setNextFollowUpAt(toDateInput(initialData.nextFollowUpAt));
      return;
    }

    setOutcome("");
    setNotes("");
    setSubStatus("");
    setNextFollowUpAt("");
  }, [initialData]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      outcome,
      notes,
      subStatus,
      nextFollowUpAt: nextFollowUpAt || null,
    });
  };

  return (
    <div className="modal-overlay log-activity-overlay" onClick={onClose}>
      <div className="modal-content log-activity-modal" onClick={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <div className="header-info">
            <h2>{initialData ? "Edit Follow-up" : "Log Follow-up"}</h2>
            <p>{lead?.companyName || "Lead"}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <LuX />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="activity-outcome">STATUS</label>
            <div className="select-container">
              <select
                id="activity-outcome"
                value={outcome}
                onChange={(event) => setOutcome(event.target.value)}
                className="form-select"
                required
              >
                <option value="">Select Status...</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <LuChevronDown className="select-icon" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="activity-substatus">SUB STATUS</label>
            <input
              id="activity-substatus"
              className="form-input"
              value={subStatus}
              onChange={(event) => setSubStatus(event.target.value)}
              placeholder="e.g. Call Picked, Switch Off"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="activity-notes">MEETING NOTES</label>
            <textarea
              id="activity-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="form-textarea"
              placeholder="Key takeaways, client response, and next steps..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="activity-next-followup">NEXT FOLLOW-UP</label>
            <input
              id="activity-next-followup"
              type="date"
              value={nextFollowUpAt}
              onChange={(event) => setNextFollowUpAt(event.target.value)}
              className="form-input"
            />
          </div>

          <footer className="modal-footer">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn submit-log-btn" disabled={isSubmitting}>
              <LuCircleCheck /> {isSubmitting ? "Saving..." : initialData ? "Update Log" : "Submit Log"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
