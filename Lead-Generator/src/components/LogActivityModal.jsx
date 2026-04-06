import React, { useState } from "react";
import { LuCircleCheck, LuChevronDown, LuMail, LuPhone, LuUserRound, LuX } from "react-icons/lu";

const normalizeContact = (contact = {}) => ({
  fullName: String(contact?.fullName || contact?.contactName || "").trim(),
  phone: String(contact?.phone || "").trim(),
  email: String(contact?.email || "").trim(),
});

const LogActivityModal = ({ lead, initialData, activityContact, onClose, onSubmit }) => {
  const [outcome, setOutcome] = useState(initialData?.outcome || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [nextFollowUp, setNextFollowUp] = useState(initialData?.nextFollowUpAt || initialData?.nextFollowUp || "");

  const resolvedContact = normalizeContact(activityContact || initialData?.contact || {});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ outcome, notes, nextFollowUp, contact: resolvedContact });
  };

  return (
    <div className="modal-overlay log-activity-overlay" onClick={onClose}>
      <div className="modal-content log-activity-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
           <div className="header-info">
              <h2>{initialData ? 'Edit Activity' : 'Log Activity'}</h2>
              <p>{lead?.companyName || 'Lead Company'}</p>
           </div>
           <button className="close-btn" onClick={onClose}>
             <LuX />
           </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="activity-contact-banner">
            <p className="activity-contact-title">Logging for contact</p>
            <div className="activity-contact-grid">
              <span><LuUserRound /> {resolvedContact.fullName || "Unknown Contact"}</span>
              <span><LuPhone /> {resolvedContact.phone || "Phone not available"}</span>
              <span><LuMail /> {resolvedContact.email || "Email not available"}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">OUTCOME</label>
            <div className="select-container">
              <select 
                value={outcome} 
                onChange={(e) => setOutcome(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Select Outcome...</option>
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Follow Up Required">Follow Up Required</option>
                <option value="Busy">Busy</option>
                <option value="Wrong Number">Wrong Number</option>
              </select>
              <LuChevronDown className="select-icon" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">MEETING NOTES</label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              className="form-textarea"
              placeholder="Key takeaways, client feedback, next steps..."
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">NEXT FOLLOW-UP</label>
            <div className="input-icon-container">
              <input 
                type="date" 
                value={nextFollowUp} 
                onChange={(e) => setNextFollowUp(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <footer className="modal-footer">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn submit-log-btn">
              <LuCircleCheck /> {initialData ? 'Update Log' : 'Submit Log'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default LogActivityModal;
