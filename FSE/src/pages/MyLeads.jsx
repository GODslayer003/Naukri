import { useEffect, useMemo, useState } from "react";
import { LuBuilding2, LuListFilter, LuMapPin, LuSearch } from "react-icons/lu";
import {
  deleteFseLeadActivity,
  fetchFseLeads,
  logFseLeadActivity,
  updateFseLeadStatus,
} from "../api/fseApi";
import LeadDetailModal from "../components/LeadDetailModal";
import LogActivityModal from "../components/LogActivityModal";

const STATUS_OPTIONS = ["ASSIGNED", "CONTACTED", "FOLLOW_UP", "QUALIFIED", "CONVERTED", "LOST", "REJECTED"];

const STATUS_FILTERS = [
  { key: "", label: "All" },
  { key: "ASSIGNED", label: "Assigned" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "FOLLOW_UP", label: "Follow Up" },
  { key: "QUALIFIED", label: "Qualified" },
  { key: "CONVERTED", label: "Converted" },
];

const statusClassMap = {
  CONVERTED: "status-pill status-pill-approved",
  LOST: "status-pill status-pill-rejected",
  REJECTED: "status-pill status-pill-rejected",
  default: "status-pill status-pill-pending",
};

const formatLocation = (lead) => {
  if (lead.address && String(lead.address).trim().toLowerCase() !== "unknown") {
    return lead.address;
  }
  return [lead.city, lead.state].filter(Boolean).join(", ") || "-";
};

export default function MyLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [statusDraft, setStatusDraft] = useState({});

  const [selectedLead, setSelectedLead] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivityIndex, setEditingActivityIndex] = useState(null);
  const [activitySubmitting, setActivitySubmitting] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const loadLeads = async (preserveLeadId = "") => {
    try {
      setLoading(true);
      const data = await fetchFseLeads({ search: debouncedSearch, status, date, page: 1, limit: 100 });
      const items = data?.items || [];
      setLeads(items);
      setStatusDraft((current) => {
        const next = { ...current };
        items.forEach((lead) => {
          next[lead.id] = next[lead.id] || lead.status;
        });
        return next;
      });
      setError("");

      if (preserveLeadId) {
        const refreshed = items.find((lead) => lead.id === preserveLeadId);
        setSelectedLead(refreshed || null);
      }

      return items;
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to load assigned leads.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, status, date]);

  const activeActivity = useMemo(() => {
    if (!selectedLead || editingActivityIndex === null) {
      return null;
    }
    return selectedLead.activities?.[editingActivityIndex] || null;
  }, [selectedLead, editingActivityIndex]);

  const getStatusClass = (leadStatus) => statusClassMap[leadStatus] || statusClassMap.default;

  const openLeadDetail = (lead) => {
    setSelectedLead(lead);
    setShowActivityModal(false);
    setEditingActivityIndex(null);
  };

  const openNewActivityModal = (lead) => {
    setSelectedLead(lead);
    setEditingActivityIndex(null);
    setShowActivityModal(true);
  };

  const handleStatusUpdate = async (leadId) => {
    const nextStatus = statusDraft[leadId];
    if (!nextStatus) {
      return;
    }

    try {
      await updateFseLeadStatus(leadId, nextStatus);
      await loadLeads(selectedLead?.id || leadId);
    } catch (requestError) {
      alert(requestError?.response?.data?.message || "Failed to update lead status.");
    }
  };

  const handleActivitySubmit = async ({ outcome, notes, nextFollowUpAt }) => {
    if (!selectedLead) {
      return;
    }

    try {
      setActivitySubmitting(true);
      await logFseLeadActivity(selectedLead.id, {
        outcome,
        notes,
        nextFollowUpAt,
        activityIndex: editingActivityIndex === null ? undefined : editingActivityIndex,
      });
      setShowActivityModal(false);
      setEditingActivityIndex(null);
      await loadLeads(selectedLead.id);
    } catch (requestError) {
      alert(requestError?.response?.data?.message || "Failed to log activity.");
    } finally {
      setActivitySubmitting(false);
    }
  };

  const handleDeleteActivity = async (index) => {
    if (!selectedLead) {
      return;
    }

    const confirmed = window.confirm("Delete this activity entry?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteFseLeadActivity(selectedLead.id, index);
      await loadLeads(selectedLead.id);
    } catch (requestError) {
      alert(requestError?.response?.data?.message || "Failed to delete activity.");
    }
  };

  return (
    <div className="page-section my-leads-page">
      <section className="my-leads-heading">
        <h1>Assigned Leads</h1>
        <p>Click any lead row to open detailed follow-up history and activity logging.</p>
      </section>

      <section className="my-leads-toolbar-card" style={{ flexWrap: "wrap" }}>
        <div className="my-leads-search">
          <LuSearch />
          <input
            placeholder="Search company, contact, phone, lead code..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="my-leads-filter" style={{ flexWrap: "wrap" }}>
          <span className="my-leads-filter-label">
            <LuListFilter />
            Status:
          </span>
          <div className="my-leads-filter-chips">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.label}
                type="button"
                className={`filter-chip ${status === filter.key ? "is-active" : ""}`}
                onClick={() => setStatus(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <select
            className="input"
            style={{ minWidth: "170px", height: "42px" }}
            value={date}
            onChange={(event) => setDate(event.target.value)}
          >
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
          </select>
        </div>
      </section>

      <section className="my-leads-table-card">
        <div className="table-wrap">
          <table className="my-leads-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Location</th>
                <th>Current Status</th>
                <th>Update Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="empty-cell">Loading assigned leads...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="empty-cell">{error}</td>
                </tr>
              ) : leads.length ? (
                leads.map((lead) => (
                  <tr key={lead.id} className="clickable-row" onClick={() => openLeadDetail(lead)}>
                    <td>
                      <div className="company-cell">
                        <span className="row-icon">
                          <LuBuilding2 />
                        </span>
                        <div>
                          <strong>{lead.companyName || "-"}</strong>
                          <small>{lead.contactName || "-"} | {lead.phone || "-"}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="location-cell">
                        <LuMapPin />
                        {formatLocation(lead)}
                      </span>
                    </td>
                    <td>
                      <span className={getStatusClass(lead.status)}>
                        <span className="status-dot" />
                        {lead.status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="input"
                        value={statusDraft[lead.id] || lead.status}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          setStatusDraft((prev) => ({ ...prev, [lead.id]: event.target.value }))
                        }
                      >
                        {STATUS_OPTIONS.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="status-action-group" style={{ opacity: 1 }}>
                        <button
                          type="button"
                          className="button button-primary"
                          style={{ padding: "8px 10px", borderRadius: "8px" }}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleStatusUpdate(lead.id);
                          }}
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-cell">No leads assigned yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedLead && !showActivityModal ? (
        <LeadDetailModal
          lead={selectedLead}
          activities={selectedLead.activities || []}
          onClose={() => setSelectedLead(null)}
          onLogActivity={(lead) => openNewActivityModal(lead)}
          onEditActivity={(index) => {
            setEditingActivityIndex(index);
            setShowActivityModal(true);
          }}
          onDeleteActivity={handleDeleteActivity}
        />
      ) : null}

      {showActivityModal && selectedLead ? (
        <LogActivityModal
          lead={selectedLead}
          initialData={activeActivity}
          isSubmitting={activitySubmitting}
          onClose={() => {
            setShowActivityModal(false);
            setEditingActivityIndex(null);
          }}
          onSubmit={handleActivitySubmit}
        />
      ) : null}
    </div>
  );
}
