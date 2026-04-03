import { useEffect, useMemo, useState } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuMail,
  LuMapPin,
  LuPhone,
  LuSearch,
  LuShield,
  LuTrash2,
  LuUserRound,
  LuUsers,
} from "react-icons/lu";
import { toast } from "sonner";
import ActionConfirmModal from "../components/ActionConfirmModal";
import {
  deleteManagedMember,
  fetchManagedMemberDetail,
  fetchManagedMembers,
} from "../api/leadApi";

const PAGE_SIZE = 10;
const ROLE_TABS = [
  { key: "LEAD_GENERATOR", label: "Lead Generators" },
  { key: "FSE", label: "FSEs" },
];

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRole = (role = "") =>
  String(role)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function TeamManagement() {
  const [activeRole, setActiveRole] = useState("LEAD_GENERATOR");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageByRole, setPageByRole] = useState({
    LEAD_GENERATOR: 1,
    FSE: 1,
  });

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const currentPage = pageByRole[activeRole] || 1;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    let mounted = true;

    const loadMembers = async () => {
      try {
        setLoading(true);
        const response = await fetchManagedMembers({
          role: activeRole,
          page: currentPage,
          limit: PAGE_SIZE,
          search: debouncedSearch,
        });

        if (!mounted) {
          return;
        }

        setItems(Array.isArray(response.items) ? response.items : []);
        setPagination(
          response.pagination || {
            page: currentPage,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 1,
          },
        );
        setError("");
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        setItems([]);
        setPagination({
          page: currentPage,
          limit: PAGE_SIZE,
          total: 0,
          totalPages: 1,
        });
        setError(requestError?.response?.data?.message || "Unable to load team members.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadMembers();

    return () => {
      mounted = false;
    };
  }, [activeRole, currentPage, debouncedSearch, refreshKey]);

  const title = useMemo(
    () => (activeRole === "LEAD_GENERATOR" ? "Lead Generators" : "Field Sales Executives"),
    [activeRole],
  );

  const handleTabChange = (roleKey) => {
    setActiveRole(roleKey);
    setSearch("");
    setDebouncedSearch("");
  };

  const handlePageChange = (nextPage) => {
    setPageByRole((prev) => ({
      ...prev,
      [activeRole]: nextPage,
    }));
  };

  const openMemberDetail = async (memberId) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);

    try {
      const detail = await fetchManagedMemberDetail(memberId);
      setSelectedMember(detail);
    } catch (requestError) {
      toast.error(requestError?.response?.data?.message || "Unable to load member details.");
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete?.id) {
      return;
    }

    try {
      setDeleteSubmitting(true);
      await deleteManagedMember(memberToDelete.id);
      toast.success(`${formatRole(memberToDelete.role)} removed successfully.`);

      if (items.length === 1 && currentPage > 1) {
        handlePageChange(currentPage - 1);
      } else {
        setRefreshKey((prev) => prev + 1);
      }

      setMemberToDelete(null);
    } catch (requestError) {
      toast.error(requestError?.response?.data?.message || "Unable to delete member.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="page-section my-leads-page">
      <section className="my-leads-heading">
        <h1>Team Control</h1>
        <p>Manage Lead Generators and FSEs from your assigned state.</p>
      </section>

      <section className="my-leads-toolbar-card">
        <div className="my-leads-filter-chips">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`filter-chip ${activeRole === tab.key ? "is-active" : ""}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="my-leads-search" style={{ maxWidth: "420px" }}>
          <LuSearch />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              handlePageChange(1);
            }}
          />
        </div>
      </section>

      <section className="my-leads-table-card">
        <div className="table-wrap">
          <table className="my-leads-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>PHONE</th>
                <th>TOTAL LEADS</th>
                <th>CONVERTED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    Loading {title.toLowerCase()}...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    {error}
                  </td>
                </tr>
              ) : items.length ? (
                items.map((member) => (
                  <tr
                    key={member.id}
                    className="clickable-row"
                    onClick={() => openMemberDetail(member.id)}
                  >
                    <td>
                      <div className="company-cell">
                        <span className="row-icon">
                          <LuUserRound />
                        </span>
                        <strong>{member.fullName}</strong>
                      </div>
                    </td>
                    <td>{member.email}</td>
                    <td>{member.phone || "-"}</td>
                    <td>{member.totalLeadsGenerated ?? 0}</td>
                    <td>{member.convertedLeads ?? 0}</td>
                    <td onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        className="status-action-btn"
                        title={`Delete ${formatRole(member.role)}`}
                        onClick={() => setMemberToDelete(member)}
                      >
                        <LuTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    No {title.toLowerCase()} found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 18px",
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
          }}
        >
          <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
            Showing {items.length} of {pagination.total || 0}
          </span>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              className="secondary-btn"
              style={{ padding: "7px 10px" }}
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              <LuChevronLeft />
            </button>
            <span style={{ color: "#334155", fontWeight: 600, minWidth: "88px", textAlign: "center" }}>
              Page {pagination.page || 1} / {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              className="secondary-btn"
              style={{ padding: "7px 10px" }}
              onClick={() => handlePageChange(Math.min(pagination.totalPages || 1, currentPage + 1))}
              disabled={currentPage >= (pagination.totalPages || 1)}
            >
              <LuChevronRight />
            </button>
          </div>
        </div>
      </section>

      {isDetailModalOpen ? (
        <div className="modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
          <section
            className="modal-content"
            style={{ maxWidth: "620px" }}
            role="dialog"
            aria-modal="true"
            aria-label="Team member details"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-header">
              <div className="header-info">
                <h2>{detailLoading ? "Loading..." : selectedMember?.fullName || "Member Details"}</h2>
                <p>{detailLoading ? "" : formatRole(selectedMember?.role || "")}</p>
              </div>
              <button type="button" className="close-btn" onClick={() => setIsDetailModalOpen(false)}>
                &times;
              </button>
            </header>

            <div className="modal-body">
              {detailLoading ? (
                <p style={{ margin: 0, color: "#64748b" }}>Loading member details...</p>
              ) : selectedMember ? (
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">
                      <LuMail />
                      Email
                    </span>
                    <p className="detail-value">{selectedMember.email || "-"}</p>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">
                      <LuPhone />
                      Phone
                    </span>
                    <p className="detail-value">{selectedMember.phone || "-"}</p>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">
                      <LuMapPin />
                      Territory
                    </span>
                    <p className="detail-value">
                      {selectedMember.state || "-"}, {selectedMember.zone || "-"} Zone
                    </p>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">
                      <LuShield />
                      Access Status
                    </span>
                    <p className="detail-value">{selectedMember.accessStatus || "-"}</p>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">
                      <LuUsers />
                      Total Leads Generated
                    </span>
                    <p className="detail-value">{selectedMember.totalLeadsGenerated ?? 0}</p>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">
                      <LuUsers />
                      Converted Leads
                    </span>
                    <p className="detail-value">{selectedMember.convertedLeads ?? 0}</p>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created At</span>
                    <p className="detail-value">{formatDateTime(selectedMember.createdAt)}</p>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Updated At</span>
                    <p className="detail-value">{formatDateTime(selectedMember.updatedAt)}</p>
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, color: "#64748b" }}>Unable to load details.</p>
              )}
            </div>
          </section>
        </div>
      ) : null}

      <ActionConfirmModal
        isOpen={Boolean(memberToDelete)}
        title={`Delete ${memberToDelete ? formatRole(memberToDelete.role) : "Member"}`}
        message={`Delete ${memberToDelete?.fullName || "this member"} from your state team? This will disable their account access immediately.`}
        confirmLabel="Yes, Delete"
        tone="danger"
        isSubmitting={deleteSubmitting}
        onClose={() => {
          if (!deleteSubmitting) {
            setMemberToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
