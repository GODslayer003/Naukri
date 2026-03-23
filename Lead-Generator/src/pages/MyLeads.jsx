import { useEffect, useState } from "react";
import {
  LuBuilding2,
  LuLoaderCircle,
  LuListFilter,
  LuMapPin,
  LuSearch,
  LuUserRound,
  LuRefreshCw,
  LuSend
} from "react-icons/lu";
import { fetchLeads, updateLeadStatus } from "../api/leadApi";
import LeadDetailModal from "../components/LeadDetailModal";
import LogActivityModal from "../components/LogActivityModal";

const STATUS_FILTERS = ["All", "Pending", "Approved", "Rejected"];

const statusClassMap = {
  Approved: "status-pill-approved",
  Pending: "status-pill-pending",
  Rejected: "status-pill-rejected",
};

const formatStatus = (status = "") => {
  if (["QUALIFIED", "WON"].includes(status)) {
    return "Approved";
  }

  if (status === "LOST") {
    return "Rejected";
  }

  if (status === "CONVERTED") {
    return "Converted";
  }

  if (status === "FORWARDED") {
    return "Forwarded";
  }

  return "Pending";
};

const formatLocation = (lead) => {
  if (lead.address && String(lead.address).trim().toLowerCase() !== "unknown") {
    return lead.address;
  }

  const parts = [lead.city, lead.state]
    .map((item) => String(item || "").trim())
    .filter((item) => item && item.toLowerCase() !== "unknown");

  return parts.length ? parts.join(", ") : "Location not available";
};

export default function MyLeads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [error, setError] = useState("");

  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activities, setActivities] = useState({});
  const [editingActivityIndex, setEditingActivityIndex] = useState(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    let mounted = true;

    const loadLeads = async () => {
      try {
        setLoadingRows(true);
        const response = await fetchLeads({
          page: 1,
          limit: 50,
          search: debouncedSearch,
          statusGroup: statusFilter === "All" ? "" : statusFilter.toUpperCase(),
        });

        if (!mounted) {
          return;
        }

        const mappedRows = (response.items || []).map((lead) => ({
          ...lead, // keep all original model data
          id: lead.id,
          companyName: lead.companyName || "Unknown company",
          location: formatLocation(lead),
          contactName: lead.contactName || "Unknown contact",
          contactEmail: lead.email || "-",
          status: formatStatus(lead.status),
          phone: lead.phone || "Not provided",
          category: lead.businessCategory || "Unknown",
        }));

        setRows(mappedRows);
        setError("");
      } catch (requestError) {
        if (mounted) {
          setRows([]);
          setError(requestError.response?.data?.message || "Unable to load leads.");
        }
      } finally {
        if (mounted) {
          setLoadingRows(false);
        }
      }
    };

    loadLeads();

    return () => {
      mounted = false;
    };
  }, [debouncedSearch, statusFilter]);

  const handleRowClick = (lead) => {
    setSelectedLead(lead);
    setShowDetailModal(true);
  };

  const handleLogActivity = (lead) => {
    setEditingActivityIndex(null);
    setShowDetailModal(false);
    setShowActivityModal(true);
  };

  const handleEditActivity = (index) => {
    setEditingActivityIndex(index);
    setShowDetailModal(false);
    setShowActivityModal(true);
  };

  const handleDeleteActivity = (index) => {
    const leadId = selectedLead._id || selectedLead.id;
    setActivities(prev => {
      const updatedLeadActivities = [...(prev[leadId] || [])];
      updatedLeadActivities.splice(index, 1);
      return {
        ...prev,
        [leadId]: updatedLeadActivities
      };
    });
  };

  const handleActivitySubmit = (data) => {
    const leadId = selectedLead._id || selectedLead.id;

    setActivities(prev => {
      const currentActivities = [...(prev[leadId] || [])];

      if (editingActivityIndex !== null) {
        // Update existing activity
        currentActivities[editingActivityIndex] = {
          ...currentActivities[editingActivityIndex],
          ...data,
          // keep original date, potentially update modified date if tracked
        };
      } else {
        // Add new activity
        currentActivities.push({ ...data, date: new Date().toISOString() });
      }

      return {
        ...prev,
        [leadId]: currentActivities
      };
    });

    setShowActivityModal(false);
    setEditingActivityIndex(null);
    setShowDetailModal(true);
  };

  const handleConvert = async (e, lead) => {
    e.stopPropagation();
    try {
      await updateLeadStatus(lead.id, "CONVERTED");
      setRows((prev) =>
        prev.map((r) => (r.id === lead.id ? { ...r, status: "Converted" } : r))
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to convert lead.");
    }
  };

  const handleForward = async (e, lead) => {
    e.stopPropagation();
    try {
      await updateLeadStatus(lead.id, "FORWARDED");
      setRows((prev) =>
        prev.map((r) => (r.id === lead.id ? { ...r, status: "Forwarded" } : r))
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to forward lead.");
    }
  };

  return (
    <div className="page-section my-leads-page">
      <section className="my-leads-heading">
        <h1>My Submitted Leads</h1>
        <p>Track and manage your lead submissions.</p>
      </section>

      <section className="my-leads-toolbar-card">
        <div className="my-leads-search">
          <LuSearch />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by Company Name..."
          />
        </div>

        <div className="my-leads-filter">
          <span className="my-leads-filter-label">
            <LuListFilter />
            Filter by:
          </span>
          <div className="my-leads-filter-chips">
            {STATUS_FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                className={`filter-chip ${statusFilter === item ? "is-active" : ""}`}
                onClick={() => setStatusFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="my-leads-table-card">
        <div className="table-wrap">
          <table className="my-leads-table">
            <thead>
              <tr>
                <th>COMPANY NAME</th>
                <th>LOCATION</th>
                <th>CONTACT PERSON</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loadingRows ? (
                <tr>
                  <td colSpan="4" className="empty-cell">
                    <span className="loading-block">
                      <LuLoaderCircle className="spin" />
                      Loading leads...
                    </span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="empty-cell">
                    {error}
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => handleRowClick(lead)}
                    className="clickable-row"
                  >
                    <td>
                      <div className="company-cell">
                        <span className="row-icon">
                          <LuBuilding2 />
                        </span>
                        <strong>{lead.companyName}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="location-cell">
                        <LuMapPin />
                        {lead.location}
                      </span>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <span className="contact-name">
                          <LuUserRound />
                          {lead.contactName}
                        </span>
                        <small>{lead.contactEmail}</small>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
                        {lead.status === "Converted" && (
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", background: "#ecfdf5", padding: "2px 8px", borderRadius: "12px", border: "1px solid #10b981" }}>
                            Converted
                          </span>
                        )}
                        {lead.status === "Forwarded" && (
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: "12px", border: "1px solid #2563eb" }}>
                            Forwarded
                          </span>
                        )}
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          {lead.status !== "Forwarded" && (
                            <button
                              title="Convert Lead"
                              onClick={(e) => handleConvert(e, lead)}
                              style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #e2e8f0", background: lead.status === "Converted" ? "#ecfdf5" : "#f8fafc", color: "#10b981", fontSize: "0.75rem", fontWeight: 600, cursor: lead.status === "Converted" ? "default" : "pointer", opacity: lead.status === "Converted" ? 0.6 : 1, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
                              disabled={lead.status === "Converted"}
                            >
                              <LuRefreshCw size={14} />
                              Convert
                            </button>
                          )}
                          {lead.status !== "Converted" && (
                            <button
                              title="Forward to State Manager"
                              onClick={(e) => handleForward(e, lead)}
                              style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #e2e8f0", background: lead.status === "Forwarded" ? "#eff6ff" : "#f8fafc", color: "#2563eb", fontSize: "0.75rem", fontWeight: 600, cursor: lead.status === "Forwarded" ? "default" : "pointer", opacity: lead.status === "Forwarded" ? 0.6 : 1, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
                              disabled={lead.status === "Forwarded"}
                            >
                              <LuSend size={14} />
                              Forward
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-cell">
                    No matching leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showDetailModal && (
        <LeadDetailModal
          lead={selectedLead}
          activities={activities[selectedLead?._id || selectedLead?.id] || []}
          onClose={() => setShowDetailModal(false)}
          onLogActivity={handleLogActivity}
          onEditActivity={handleEditActivity}
          onDeleteActivity={handleDeleteActivity}
        />
      )}

      {showActivityModal && (
        <LogActivityModal
          lead={selectedLead}
          initialData={editingActivityIndex !== null ? activities[selectedLead?._id || selectedLead?.id]?.[editingActivityIndex] : null}
          onClose={() => {
            setShowActivityModal(false);
            setEditingActivityIndex(null);
            setShowDetailModal(true); // Reopen detail modal on cancel
          }}
          onSubmit={handleActivitySubmit}
        />
      )}
    </div>
  );
}
