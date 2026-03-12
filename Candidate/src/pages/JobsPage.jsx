import { useEffect, useState } from "react";
import { LuArrowRight, LuSearch, LuSparkles } from "react-icons/lu";
import { useSearchParams } from "react-router-dom";
import {
  Badge,
  EmptyState,
  PageState,
  PanelCard,
  SectionHeading,
  ToolbarInput,
} from "../components/Ui";
import { formatDate, titleCase } from "../utils/formatters";
import {
  createApplication,
  getJobDetail,
  getJobs,
} from "../services/candidateApi";

export default function JobsPage() {
  const [searchParams] = useSearchParams();
  const mappedToken = searchParams.get("token") || "";
  const [search, setSearch] = useState("");
  const [state, setState] = useState({
    loading: true,
    error: "",
    data: null,
  });
  const [feedback, setFeedback] = useState("");
  const [expandedJob, setExpandedJob] = useState("");
  const [similarJobs, setSimilarJobs] = useState({});
  const [activeApplyId, setActiveApplyId] = useState("");

  const loadJobs = async (nextSearch = search) => {
    try {
      setState((current) => ({ ...current, loading: true, error: "" }));
      const response = await getJobs({ token: mappedToken, search: nextSearch });
      setState({
        loading: false,
        error: "",
        data: response.data,
      });
    } catch (error) {
      setState({
        loading: false,
        error: error.message || "Unable to load jobs.",
        data: null,
      });
    }
  };

  useEffect(() => {
    loadJobs("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappedToken]);

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    await loadJobs(search);
  };

  const handleApply = async (jobId, sourceJobId = "") => {
    try {
      setActiveApplyId(jobId);
      setFeedback("");
      await createApplication({
        jobId,
        qrToken: mappedToken,
        sourceJobId,
      });
      setFeedback("Application submitted successfully.");
      await loadJobs(search);
    } catch (error) {
      setFeedback(error.message || "Unable to submit application.");
    } finally {
      setActiveApplyId("");
    }
  };

  const handleLoadSimilar = async (jobId) => {
    if (expandedJob === jobId) {
      setExpandedJob("");
      return;
    }

    setExpandedJob(jobId);

    if (similarJobs[jobId]) {
      return;
    }

    try {
      const response = await getJobDetail(jobId);
      setSimilarJobs((current) => ({
        ...current,
        [jobId]: response.data.similarJobs || [],
      }));
    } catch {
      setSimilarJobs((current) => ({
        ...current,
        [jobId]: [],
      }));
    }
  };

  if (state.loading && !state.data) {
    return (
      <PageState
        title="Loading jobs"
        description="Fetching mapped openings and application context."
      />
    );
  }

  if (state.error && !state.data) {
    return (
      <PageState
        title="Jobs unavailable"
        description={state.error}
        error
      />
    );
  }

  const jobs = state.data?.jobs || [];
  const company = state.data?.company;

  return (
    <div className="space-y-6">
      <PanelCard>
        <SectionHeading
          eyebrow="Job Discovery"
          title={
            company
              ? `Mapped openings from ${company.name}`
              : "Browse active openings"
          }
          description={
            company
              ? `This view is scoped to the active QR mapping for ${company.name}.`
              : "Search all currently approved jobs available to candidate accounts."
          }
          action={
            company ? <Badge tone="lime">{company.industry || "Active company"}</Badge> : null
          }
        />

        <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col gap-3 md:flex-row">
          <div className="flex-1">
            <ToolbarInput
              icon={LuSearch}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, department, or location"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-[#163060] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d3f7f]"
          >
            Search jobs
          </button>
        </form>

        {feedback ? (
          <div className="mt-5 rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm font-medium text-lime-800">
            {feedback}
          </div>
        ) : null}
      </PanelCard>

      {jobs.length ? (
        <div className="grid gap-5">
          {jobs.map((job) => (
            <PanelCard key={job.id} className="overflow-hidden">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900">{job.title}</h2>
                    <Badge tone={job.hasApplied ? "emerald" : "blue"}>
                      {job.hasApplied ? titleCase(job.applicationStatus) : "Open"}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {job.companyName} • {job.department} • {job.location || "Location shared later"}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {job.description || "Role details are available in the application workflow."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span
                        key={`${job.id}-${skill}`}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-slate-400">
                    {job.deadline ? `Apply by ${formatDate(job.deadline)}` : "No published deadline"}
                  </p>
                </div>

                <div className="flex min-w-[240px] flex-col gap-3">
                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={job.hasApplied || activeApplyId === job.id}
                    className="rounded-2xl bg-[#163060] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d3f7f] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {job.hasApplied
                      ? titleCase(job.applicationStatus)
                      : activeApplyId === job.id
                        ? "Submitting..."
                        : "Apply now"}
                  </button>
                  <button
                    onClick={() => handleLoadSimilar(job.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-lime-300 hover:bg-lime-50 hover:text-[#163060]"
                  >
                    <LuSparkles size={16} />
                    Similar roles
                  </button>
                </div>
              </div>

              {expandedJob === job.id ? (
                <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-2">
                    <LuSparkles size={16} className="text-lime-600" />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Similar job openings
                    </h3>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {(similarJobs[job.id] || []).length ? (
                      (similarJobs[job.id] || []).map((similarJob) => (
                        <div
                          key={similarJob.id}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {similarJob.title}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {similarJob.companyName}
                              </p>
                            </div>
                            <Badge tone={similarJob.hasApplied ? "emerald" : "lime"}>
                              {similarJob.hasApplied
                                ? titleCase(similarJob.applicationStatus)
                                : "Available"}
                            </Badge>
                          </div>
                          <button
                            onClick={() => handleApply(similarJob.id, job.id)}
                            disabled={similarJob.hasApplied || activeApplyId === similarJob.id}
                            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#163060] transition hover:text-lime-600 disabled:cursor-not-allowed disabled:text-slate-400"
                          >
                            {activeApplyId === similarJob.id ? "Submitting..." : "Apply to similar job"}
                            <LuArrowRight size={15} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        title="No similar jobs found"
                        description="There are no additional related openings available right now."
                      />
                    )}
                  </div>
                </div>
              ) : null}
            </PanelCard>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No jobs available"
          description="There are no active openings matching the current search or QR context."
        />
      )}
    </div>
  );
}
