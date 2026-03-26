import { useEffect, useState } from "react";
import { 
  LuSearch, 
  LuFilter, 
  LuMapPin, 
  LuCalendar,
  LuDownload,
  LuBuilding2,
  LuUser,
  LuLoaderCircle
} from "react-icons/lu";
import { fetchAllLeads } from "../api/nshApi";

export default function AllLeads() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const result = await fetchAllLeads({ search, zone, status, date, page });
      setLeads(result.data);
      setTotal(result.total);
    } catch (err) {
      setError("Failed to load national lead database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [zone, status, date, page]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
      loadLeads();
    }
  };

  return (
    <div style={{ padding: "24px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#1e3a8a", margin: "0 0 8px 0" }}>National Lead Database</h1>
          <p style={{ color: "#64748b", margin: 0 }}>View and manage all {total} leads across the country.</p>
        </div>
        <button style={{ 
          padding: "10px 20px", 
          borderRadius: "10px", 
          backgroundColor: "#fff", 
          border: "1px solid #e2e8f0", 
          color: "#1e293b", 
          fontWeight: 600, 
          display: "flex", 
          alignItems: "center", 
          gap: "8px",
          cursor: "pointer"
        }}>
          <LuDownload size={18} /> Export Data
        </button>
      </div>

      {/* Filter Toolbar */}
      <section className="my-leads-toolbar-card" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "24px", marginBottom: "24px" }}>
        <div className="my-leads-search" style={{ margin: 0 }}>
          <LuSearch />
          <input 
            type="text" 
            placeholder="Search by Company, Contact, or Phone (Press Enter)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <select value={zone} onChange={(e) => setZone(e.target.value)} className="filter-chip" style={{ appearance: "auto", paddingRight: "30px" }}>
            <option value="">All Zones</option>
            <option value="North">North Zone</option>
            <option value="South">South Zone</option>
            <option value="East">East Zone</option>
            <option value="West">West Zone</option>
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)} className="filter-chip" style={{ appearance: "auto", paddingRight: "30px" }}>
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="FORWARDED">Forwarded</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="CONVERTED">Converted</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select value={date} onChange={(e) => setDate(e.target.value)} className="filter-chip" style={{ appearance: "auto", paddingRight: "30px" }}>
            <option value="">All Timeline</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
          </select>
        </div>
      </section>

      {/* Table Card */}
      <section className="my-leads-table-card">
        <div className="table-wrap">
          <table className="my-leads-table">
            <thead>
              <tr>
                <th>COMPANY & CODE</th>
                <th>ZONE & LOCATION</th>
                <th>CONTACT PERSON</th>
                <th>STATUS</th>
                <th>GENERATOR</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: "100px 0", textAlign: "center", color: "#64748b" }}>
                    <LuLoaderCircle className="animate-spin" size={24} style={{ marginBottom: "12px" }} />
                    <p>Fetching leads from database...</p>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: "100px 0", textAlign: "center", color: "#64748b" }}>
                    No leads found matching your filters.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div className="company-cell">
                        <span className="row-icon"><LuBuilding2 /></span>
                        <div>
                          <strong>{lead.companyName}</strong>
                          <small style={{ display: "block", color: "#94a3b8", fontSize: "0.7rem" }}>{lead.leadCode}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1e40af" }}>{lead.zone} Zone</span>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{lead.city}, {lead.state}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <span className="contact-name"><LuUser /> {lead.contactName}</span>
                        <small>{lead.phone}</small>
                      </div>
                    </td>
                    <td>
                      <StatusPill status={lead.status} />
                    </td>
                    <td>
                      <div style={{ fontSize: "0.875rem" }}>
                        <span style={{ display: "block", fontWeight: 500 }}>{lead.generatorName}</span>
                        <small style={{ color: "#94a3b8" }}>{new Date(lead.createdAt).toLocaleDateString()}</small>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatusPill({ status }) {
  const colors = {
    CONVERTED: { text: "#10b981", bg: "#ecfdf5", border: "#10b981" },
    REJECTED: { text: "#ef4444", bg: "#fef2f2", border: "#ef4444" },
    LOST: { text: "#ef4444", bg: "#fef2f2", border: "#ef4444" },
    FORWARDED: { text: "#3b82f6", bg: "#eff6ff", border: "#3b82f6" },
    ASSIGNED: { text: "#8b5cf6", bg: "#f5f3ff", border: "#8b5cf6" },
    DEFAULT: { text: "#f59e0b", bg: "#fffbeb", border: "#f59e0b" }
  };

  const style = colors[status] || colors.DEFAULT;

  return (
    <span style={{ 
      fontSize: "0.75rem", 
      fontWeight: 700, 
      color: style.text, 
      background: style.bg, 
      padding: "3px 10px", 
      borderRadius: "12px", 
      border: `1px solid ${style.border}`,
      textTransform: "capitalize"
    }}>
      {status.toLowerCase()}
    </span>
  );
}
