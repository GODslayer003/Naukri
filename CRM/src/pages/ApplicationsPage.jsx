import { useEffect, useMemo, useState } from "react";
import { LuFileCheck2, LuSearch, LuUsers } from "react-icons/lu";
import {
  Badge,
  EmptyState,
  MetricCard,
  PageState,
  PanelCard,
  SectionHeading,
  SelectField,
  ToolbarInput,
} from "../components/Ui";
import { getApplications, updateApplicationStatus } from "../services/crmApi";
import { formatDateTime, formatNumber, titleCase } from "../utils/formatters";

const statusOptions = [
  "APPLIED",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFERED",
  "HIRED",
  "REJECTED",
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const haystack = [
        application.candidateName,
        application.candidateEmail,
        application.companyName,
        application.jobTitle,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchQuery.trim() || haystack.includes(searchQuery.trim().toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  const metrics = useMemo(() => {
    const inReview = applications.filter((item) =>
      ["SCREENING", "SHORTLISTED", "INTERVIEW"].includes(item.status),
    ).length;
    const offered = applications.filter((item) => item.status === "OFFERED").length;

    return [
      {
        label: "Applications",
        value: formatNumber(applications.length),
        detail: "System-wide candidate applications visible to CRM.",
        icon: LuFileCheck2,
        tone: "blue",
      },
      {
        label: "In review",
        value: formatNumber(inReview),
        detail: "Applications progressing through screening and interview flow.",
        icon: LuUsers,
        tone: "amber",
      },
      {
        label: "Offers issued",
        value: formatNumber(offered),
        detail: "Applications that have already moved to the offer stage.",
        icon: LuFileCheck2,
        tone: "lime",
      },
    ];
  }, [applications]);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setIsLoading(true);
    setPageError("");

    try {
      const response = await getApplications();
      setApplications(response.data);
    } catch (requestError) {
      setPageError(requestError.message || "Unable to load applications.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleStatusUpdate = async (applicationId, status) => {
    setUpdatingId(applicationId);
    setActionError("");

    try {
      await updateApplicationStatus(applicationId, { status });
      await loadApplications();
    } catch (requestError) {
      setActionError(requestError.message || "Unable to update application status.");
    } finally {
      setUpdatingId("");
    }
  };

  if (isLoading) {
    return <PageState title="Loading applications..." />;
  }

  if (pageError) {
    return <PageState title={pageError} error />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <PanelCard>
        <SectionHeading
          eyebrow="Application visibility"
          title="Track candidate applications end-to-end"
          description="CRM can review all applications, inspect candidate identity, and update stage movement across the full hiring funnel."
        />

        {actionError ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {actionError}
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
          <ToolbarInput
            icon={LuSearch}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search candidate, company, or job"
          />
          <SelectField
            label="Stage"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { label: "All stages", value: "ALL" },
              ...statusOptions.map((status) => ({
                label: titleCase(status),
                value: status,
              })),
            ]}
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <div className="grid grid-cols-[1.1fr_1fr_0.8fr_0.85fr_0.8fr] gap-3 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            <span>Candidate</span>
            <span>Opportunity</span>
            <span>Status</span>
            <span>Updated</span>
            <span>Stage control</span>
          </div>
          {filteredApplications.length ? (
            filteredApplications.map((application) => (
              <div
                key={application.id}
                className="grid grid-cols-[1.1fr_1fr_0.8fr_0.85fr_0.8fr] gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 transition hover:bg-lime-50/30"
              >
                <div>
                  <p className="font-semibold text-slate-900">{application.candidateName}</p>
                  <p className="mt-1 text-xs text-slate-500">{application.candidateEmail}</p>
                </div>
                <div>
                  <p>{application.companyName}</p>
                  <p className="mt-1 text-xs text-slate-400">{application.jobTitle}</p>
                </div>
                <div>
                  <Badge tone="blue">{titleCase(application.status)}</Badge>
                </div>
                <div className="text-xs text-slate-500">
                  {formatDateTime(application.updatedAt)}
                </div>
                <div>
                  <select
                    value={application.status}
                    onChange={(event) =>
                      handleStatusUpdate(application.id, event.target.value)
                    }
                    disabled={updatingId === application.id}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:bg-white"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {titleCase(status)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6">
              <EmptyState
                title="No applications match the filters"
                description="Adjust the search or stage filters to widen the application view."
              />
            </div>
          )}
        </div>
      </PanelCard>
    </div>
  );
}
