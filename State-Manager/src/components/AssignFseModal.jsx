import { useState, useEffect } from "react";
import { LuX, LuUserPlus } from "react-icons/lu";

// Mock FSE list
const MOCK_FSES = [
  { id: "mock_fse_001", name: "Mock FSE Alpha", zone: "North" },
  { id: "mock_fse_002", name: "Mock FSE Beta", zone: "South" },
  { id: "mock_fse_003", name: "Mock FSE Gamma", zone: "East" },
  { id: "mock_fse_004", name: "Mock FSE Delta", zone: "West" },
];

export default function AssignFseModal({ lead, onClose, onSubmit }) {
  const [selectedFse, setSelectedFse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [myZone, setMyZone] = useState("");

  useEffect(() => {
    try {
      const crmSession = sessionStorage.getItem("crm_panel_session");
      if (crmSession) {
        const parsed = JSON.parse(crmSession);
        if (parsed?.user?.zone) {
          setMyZone(parsed.user.zone);
        }
      }
    } catch (e) {
      console.error("Failed to parse session", e);
    }
  }, []);

  const availableFses = myZone 
    ? MOCK_FSES.filter(fse => fse.zone === myZone) 
    : MOCK_FSES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFse) {
      setError("Please select an FSE.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onSubmit(lead.id, selectedFse);
    } catch (err) {
      setError(err.message || "Failed to assign FSE.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "400px" }}>
        <header className="modal-header">
          <h2>Assign Lead to FSE</h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            <LuX />
          </button>
        </header>

        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
          <p style={{ marginBottom: "16px", color: "#475569", fontSize: "0.9rem" }}>
            Select an available Field Sales Executive to assign <strong>{lead.companyName}</strong>.
          </p>
          
          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label className="form-label" htmlFor="fse-select">Select FSE</label>
            <select
              id="fse-select"
              value={selectedFse}
              onChange={(e) => setSelectedFse(e.target.value)}
              className="form-input"
              style={{ appearance: "auto" }}
            >
              <option value="" disabled>-- Select FSE --</option>
              {availableFses.length > 0 ? (
                availableFses.map((fse) => (
                  <option key={fse.id} value={fse.id}>
                    {fse.name} ({fse.zone} Zone)
                  </option>
                ))
              ) : (
                <option value="" disabled>No FSEs found in your zone ({myZone})</option>
              )}
            </select>
          </div>

          {error && <div className="error-message" style={{ marginBottom: "16px", color: "red", fontSize: "0.85rem" }}>{error}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <LuUserPlus size={16} />
              {isSubmitting ? "Assigning..." : "Assign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
