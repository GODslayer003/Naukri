import { useEffect, useState } from "react";
import {
  LuBuilding2,
  LuLoaderCircle,
  LuListFilter,
  LuMapPin,
  LuSearch,
  LuUserRound,
} from "react-icons/lu";
import { fetchLeads } from "../api/leadApi";

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
          id: lead.id,
          companyName: lead.companyName || "Unknown company",
          location: formatLocation(lead),
          contactName: lead.contactName || "Unknown contact",
          contactEmail: lead.email || "-",
          status: formatStatus(lead.status),
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
                  <tr key={lead.id}>
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
                      <span className={`status-pill ${statusClassMap[lead.status]}`}>
                        <span className="status-dot" />
                        {lead.status}
                      </span>
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
    </div>
  );
}
