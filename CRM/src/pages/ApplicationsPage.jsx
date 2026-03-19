import { useEffect, useMemo, useState } from "react";
import { LuDownload, LuFileCheck2, LuSearch, LuUsers } from "react-icons/lu";
import {
  Badge,
  EmptyState,
  MetricCard,
  ModalShell,
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
  const [selectedApplication, setSelectedApplication] = useState(null);

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const haystack = [
        application.candidateName,
        application.candidateEmail,
        application.candidatePhone,
        application.candidateDesignation,
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

  const openCandidateModal = (application) => {
    setSelectedApplication(application);
  };

  const closeCandidateModal = () => {
    setSelectedApplication(null);
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
                  <button
                    type="button"
                    onClick={() => openCandidateModal(application)}
                    className="font-semibold text-slate-900 underline-offset-2 transition hover:text-[#163060] hover:underline"
                  >
                    {application.candidateName}
                  </button>
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

      <ModalShell
        open={Boolean(selectedApplication)}
        onClose={closeCandidateModal}
        title={selectedApplication?.candidateName || "Candidate Details"}
        description="Candidate profile and application details from the central system record."
      >
        {selectedApplication ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Email
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {selectedApplication.candidateEmail || "Unavailable"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Phone
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {selectedApplication.candidatePhone || "Unavailable"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Alternate phone
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {selectedApplication.candidateAltPhone || "Unavailable"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Designation
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {selectedApplication.candidateDesignation || "Unavailable"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Current company
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {selectedApplication.candidateCurrentCompany || "Unavailable"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Experience
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {selectedApplication.candidateExperience || "Unavailable"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Location
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {[
                    selectedApplication.candidateCity,
                    selectedApplication.candidateState,
                    selectedApplication.candidateCountry,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Unavailable"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Application status
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {titleCase(selectedApplication.status)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Job
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {selectedApplication.jobTitle || "Unavailable"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Company
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {selectedApplication.companyName || "Unavailable"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Applied at
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {formatDateTime(selectedApplication.appliedAt)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Last updated
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {formatDateTime(selectedApplication.updatedAt)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Source QR token
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {selectedApplication.sourceQrToken || "Unavailable"}
                </p>
              </div>
            </div>

            {selectedApplication.candidateHeadline ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Headline
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedApplication.candidateHeadline}
                </p>
              </div>
            ) : null}

            {selectedApplication.candidateSummary ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Profile summary
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedApplication.candidateSummary}
                </p>
              </div>
            ) : null}

            {selectedApplication.candidateSkills?.length ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Skills
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedApplication.candidateSkills.join(", ")}
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={selectedApplication.resumeUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!selectedApplication.resumeUrl}
                onClick={(event) => {
                  if (!selectedApplication.resumeUrl) {
                    event.preventDefault();
                  }
                }}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  selectedApplication.resumeUrl
                    ? "bg-[#163060] text-white hover:bg-[#1d3f7f]"
                    : "cursor-not-allowed bg-slate-200 text-slate-500"
                }`}
              >
                <LuDownload size={16} />
                {selectedApplication.resumeUrl
                  ? "Download Candidate CV"
                  : "CV not available"}
              </a>
              {selectedApplication.resumeFileName ? (
                <p className="text-xs text-slate-500">
                  File: {selectedApplication.resumeFileName}
                </p>
              ) : null}
              {selectedApplication.resumeUploadedAt ? (
                <p className="text-xs text-slate-500">
                  Uploaded: {formatDateTime(selectedApplication.resumeUploadedAt)}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </ModalShell>
    </div>
  );
}
