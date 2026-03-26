import { useEffect, useState } from "react";
import { LuCircleCheck, LuChevronDown, LuX } from "react-icons/lu";

const OUTCOME_OPTIONS = [
  "Interested",
  "Not Interested",
  "Follow Up Required",
  "Busy",
  "Wrong Number",
  "Meeting Done",
];

const toDateTimeLocalInput = (value) => {
  if (!value) {
    return "";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  const timezoneOffsetMs = parsed.getTimezoneOffset() * 60000;
  return new Date(parsed.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
};

export default function LogActivityModal({ lead, initialData, onClose, onSubmit, isSubmitting }) {
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");

  useEffect(() => {
    if (initialData) {
      setOutcome(initialData.outcome || "");
      setNotes(initialData.notes || "");
      setNextFollowUpAt(toDateTimeLocalInput(initialData.nextFollowUpAt));
      return;
    }

    setOutcome("");
    setNotes("");
    setNextFollowUpAt("");
  }, [initialData]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      outcome,
      notes,
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
            <label className="form-label" htmlFor="activity-outcome">OUTCOME</label>
            <div className="select-container">
              <select
                id="activity-outcome"
                value={outcome}
                onChange={(event) => setOutcome(event.target.value)}
                className="form-select"
                required
              >
                <option value="">Select Outcome...</option>
                {OUTCOME_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <LuChevronDown className="select-icon" />
            </div>
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
              type="datetime-local"
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
