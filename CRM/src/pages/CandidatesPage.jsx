import { useEffect, useMemo, useState } from "react";
import {
  LuDownload,
  LuSearch,
  LuShieldCheck,
  LuUsers,
} from "react-icons/lu";
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
import { downloadResume, getCandidates } from "../services/crmApi";
import { formatDateTime, formatNumber, titleCase } from "../utils/formatters";

const statusOptions = [
  { label: "All statuses", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Pending Invite", value: "PENDING_INVITE" },
  { label: "Restricted", value: "RESTRICTED" },
];

const getStatusTone = (status = "") => {
  if (status === "ACTIVE") {
    return "emerald";
  }

  if (status === "PENDING_INVITE") {
    return "amber";
  }

  return "rose";
};

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [data, setData] = useState({
    summary: {
      candidateProfiles: 0,
      verifiedAccess: 0,
      pendingInvite: 0,
    },
    focusAreas: {
      activeTalentPool: 0,
      networkCoverageChannels: 0,
      restrictedProfiles: 0,
    },
    totalCandidates: 0,
    filteredCount: 0,
    items: [],
  });
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDownloadingResume, setIsDownloadingResume] = useState(false);
  const [resumeDownloadError, setResumeDownloadError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 320);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    let mounted = true;

    const loadCandidates = async () => {
      setIsLoading(true);
      setPageError("");

      try {
        const response = await getCandidates({
          search: debouncedSearchQuery || undefined,
          status: statusFilter === "ALL" ? undefined : statusFilter,
        });

        if (mounted) {
          setData(response.data);
        }
      } catch (requestError) {
        if (mounted) {
          setPageError(requestError.message || "Unable to load candidate records.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadCandidates();

    return () => {
      mounted = false;
    };
  }, [debouncedSearchQuery, statusFilter]);

  const metrics = useMemo(
    () => [
      {
        label: "Candidate profiles",
        value: formatNumber(data.summary?.candidateProfiles || 0),
        icon: LuUsers,
        tone: "blue",
      },
      {
        label: "Verified access",
        value: formatNumber(data.summary?.verifiedAccess || 0),
        icon: LuUsers,
        tone: "emerald",
      },
      {
        label: "Pending invite",
        value: formatNumber(data.summary?.pendingInvite || 0),
        icon: LuShieldCheck,
        tone: "amber",
      },
    ],
    [data.summary],
  );

  const handleDownloadResume = async (candidateId) => {
    if (!candidateId) {
      return;
    }

    setResumeDownloadError("");
    setIsDownloadingResume(true);
    try {
      const blob = await downloadResume(candidateId);
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch {
      setResumeDownloadError("Unable to load resume right now. Please try again.");
    } finally {
      setIsDownloadingResume(false);
    }
  };

  if (isLoading) {
    return <PageState title="Loading candidate panel..." />;
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

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-lg font-semibold text-slate-600">Active talent pool</p>
          <p className="mt-4 text-4xl font-bold text-slate-900">
            {formatNumber(data.focusAreas?.activeTalentPool || 0)}
          </p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-lg font-semibold text-slate-600">Network coverage</p>
          <p className="mt-4 text-4xl font-bold text-slate-900">
            {formatNumber(data.focusAreas?.networkCoverageChannels || 0)} channels
          </p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-lg font-semibold text-slate-600">Restricted profiles</p>
          <p className="mt-4 text-4xl font-bold text-slate-900">
            {formatNumber(data.focusAreas?.restrictedProfiles || 0)}
          </p>
        </div>
      </section>

      <PanelCard>
        <SectionHeading
          title="Candidates"
        />

        <div className="mt-6 grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
          <ToolbarInput
            icon={LuSearch}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search candidate by name or email"
          />
          <SelectField
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={statusOptions}
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <div className="grid grid-cols-[1fr_1fr_0.7fr_0.8fr] gap-3 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            <span>Candidate</span>
            <span>Email</span>
            <span>Status</span>
            <span>Last updated</span>
          </div>
          {data.items?.length ? (
            data.items.map((candidate) => (
              <button
                type="button"
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate)}
                className="grid w-full grid-cols-[1fr_1fr_0.7fr_0.8fr] gap-3 border-t border-slate-200 px-5 py-4 text-left text-sm text-slate-600 transition hover:bg-lime-50/30"
              >
                <div className="font-semibold text-slate-900">{candidate.candidateName}</div>
                <div className="truncate">{candidate.candidateEmail || "Unavailable"}</div>
                <div>
                  <Badge tone={getStatusTone(candidate.status)}>
                    {titleCase(candidate.status)}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500">
                  {candidate.lastUpdated || "Unavailable"}
                </div>
              </button>
            ))
          ) : (
            <div className="p-6">
              <EmptyState
                title="No candidate records found"
                description="Try adjusting the search or status filter."
              />
            </div>
          )}
        </div>
      </PanelCard>

      <ModalShell
        open={Boolean(selectedCandidate)}
        onClose={() => {
          setSelectedCandidate(null);
          setResumeDownloadError("");
        }}
        title={selectedCandidate?.candidateName || "Candidate details"}
        description=""
      >
        {selectedCandidate ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoTile label="Email" value={selectedCandidate.candidateEmail || "Unavailable"} />
              <InfoTile label="Status" value={titleCase(selectedCandidate.status)} />
              <InfoTile label="Phone" value={selectedCandidate.candidatePhone || "Not filled yet"} />
              <InfoTile label="Designation" value={selectedCandidate.candidateDesignation || "Not filled yet"} />
              <InfoTile label="Current Company" value={selectedCandidate.candidateCurrentCompany || "Not filled yet"} />
              <InfoTile label="Experience" value={selectedCandidate.candidateExperience || "Not filled yet"} />
              <InfoTile
                label="Location"
                value={
                  [
                    selectedCandidate.candidateCity,
                    selectedCandidate.candidateState,
                    selectedCandidate.candidateCountry,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Not filled yet"
                }
              />
              <InfoTile label="Applications" value={formatNumber(selectedCandidate.totalApplications || 0)} />
              <InfoTile
                label="Last Updated"
                value={selectedCandidate.updatedAt ? formatDateTime(selectedCandidate.updatedAt) : "Unavailable"}
              />
              <InfoTile label="Skills Count" value={formatNumber(selectedCandidate.candidateSkillsCount || 0)} />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleDownloadResume(selectedCandidate.id)}
                disabled={!selectedCandidate.resumeAvailable || isDownloadingResume}
                className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition ${selectedCandidate.resumeAvailable
                    ? "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-slate-100 disabled:opacity-60"
                    : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
                  }`}
              >
                <LuDownload size={16} />
                {isDownloadingResume ? "Opening PDF..." : selectedCandidate.resumeAvailable ? "Download Resume" : "Resume not available"}
              </button>
              {selectedCandidate.resumeFileName ? (
                <p className="text-xs text-slate-500">{selectedCandidate.resumeFileName}</p>
              ) : null}
            </div>
            {resumeDownloadError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {resumeDownloadError}
              </div>
            ) : null}
          </div>
        ) : null}
      </ModalShell>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}
