import { LuCircleAlert, LuSend, LuX, LuUserRound } from "react-icons/lu";
import { useState } from "react";

export default function TransferLeadModal({
  isOpen,
  lead,
  candidate,
  isSubmitting,
  onClose,
  onConfirm
}) {
  const [tnc, setTnc] = useState("");

  if (!isOpen || !lead || !candidate) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content transfer-modal" 
        style={{ maxWidth: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header header-forward">
          <div className="header-info">
            <div className="header-icon-circle"><LuSend /></div>
            <div>
              <h2>Transfer Lead</h2>
              <p>Onboard client to State Manager</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} disabled={isSubmitting}><LuX /></button>
        </header>

        <div className="modal-body">
          <div className="transfer-candidate-info">
            <div className="sm-badge">
              <LuUserRound size={40} />
              <div className="sm-details">
                <span className="sm-label">RECEIVING MANAGER</span>
                <strong className="sm-name">{candidate.fullName}</strong>
                <span className="sm-region">{candidate.territory} Zone | {candidate.state}</span>
              </div>
            </div>
          </div>

          <div className="transfer-warning">
            <LuCircleAlert />
            <p>You are about to transfer <strong>{lead.companyName}</strong>. This action will move the lead to the State Manager for final approval and onboarding.</p>
          </div>

          <div className="form-field">
            <label>Onboarding Terms & Conditions (TNC)</label>
            <textarea 
              className="textarea tnc-textarea"
              placeholder="Specify the terms, package details, or any special conditions for this onboarding..."
              value={tnc}
              onChange={(e) => setTnc(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="field-hint">These terms will be visible to the State Manager during approval.</p>
          </div>
        </div>

        <footer className="modal-footer">
          <button className="secondary-btn" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button 
            className="primary-btn transfer-btn"
            onClick={() => onConfirm(tnc)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Transferring..." : "Confirm & Transfer"}
          </button>
        </footer>
      </div>
    </div>
  );
}
