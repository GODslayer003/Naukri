import { useEffect, useMemo, useState } from "react";
import {
  LuBellRing,
  LuBriefcaseBusiness,
  LuBuilding2,
  LuQrCode,
  LuShieldCheck,
} from "react-icons/lu";
import {
  Badge,
  EmptyState,
  MetricCard,
  PageState,
  PanelCard,
  SectionHeading,
  ModalShell,
} from "../components/Ui";
import { 
  getDashboardData, 
  getClients, 
  getJobs, 
  getJobApprovals, 
  getQRCodes 
} from "../services/crmApi";
import { formatDateTime, formatNumber, titleCase } from "../utils/formatters";

const metricConfig = [
  {
    label: "Client accounts",
    key: "totalClients",
    detail: "Managed client and company records across the CRM workspace.",
    icon: LuBuilding2,
    tone: "blue",
  },
  {
    label: "Job postings",
    key: "totalJobs",
    detail: "Published and client-submitted roles visible to CRM operations.",
    icon: LuBriefcaseBusiness,
    tone: "lime",
  },
  {
    label: "Pending approvals",
    key: "pendingApprovals",
    detail: "Client-created openings waiting for CRM review and release.",
    icon: LuShieldCheck,
    tone: "amber",
  },
  {
    label: "QR-enabled clients",
    key: "qrCodes",
    detail: "Distinct client companies with at least one active QR kit configured.",
    icon: LuQrCode,
    tone: "emerald",
  },
];

export default function CrmDashboard() {
  const dashboardVisibleRows = 5;
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => {
    if (!selectedMetric) {
      setModalData([]);
      return;
    }

    let isMounted = true;
    (async () => {
      setIsModalLoading(true);
      try {
        let reqFn;
        if (selectedMetric.key === "totalClients") {
          reqFn = getClients;
        } else if (selectedMetric.key === "totalJobs") {
          reqFn = getJobs;
        } else if (selectedMetric.key === "pendingApprovals") {
          reqFn = getJobApprovals;
        } else if (selectedMetric.key === "qrCodes") {
          reqFn = getQRCodes;
        }
        
        if (reqFn) {
           const res = await reqFn();
           if (isMounted) setModalData(Array.isArray(res?.data) ? res.data : []);
        }
      } catch (err) {
        console.error("Failed to load metric details", err);
      } finally {
        if (isMounted) setIsModalLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [selectedMetric]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getDashboardData();

        if (isMounted) {
          setDashboard(response.data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || "Unable to load CRM dashboard.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    if (!dashboard?.summary) {
      return [];
    }

    return metricConfig.map((item) => ({
      ...item,
      value: formatNumber(dashboard.summary[item.key]),
    }));
  }, [dashboard]);

  const jobApprovals = dashboard?.jobApprovals || [];
  const applicationFeed = dashboard?.applicationFeed || [];
  const hasJobApprovalsOverflow = jobApprovals.length > dashboardVisibleRows;
  const hasApplicationFeedOverflow = applicationFeed.length > dashboardVisibleRows;

  if (isLoading) {
    return <PageState title="Loading CRM dashboard..." />;
  }

  if (error) {
    return <PageState title={error} error />;
  }

  const renderModalContent = () => {
    if (!selectedMetric || !dashboard) return null;

    const key = selectedMetric.key;

    if (key === "totalClients") {
      return (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4">Company Name</th>
                <th className="px-5 py-4">Package</th>
                <th className="px-5 py-4">Jobs Used</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {isModalLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">Loading data...</td>
                </tr>
              ) : modalData.length ? (
                modalData.map((client) => (
                  <tr key={client.name || client.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm font-medium text-slate-900">{client.name}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{titleCase(client.packageType || "STANDARD")}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{client.activeJobCount || 0} / {client.jobLimit || 0}</td>
                    <td className="px-5 py-4">
                      <Badge tone={client.status === "ACTIVE" ? "emerald" : "rose"}>
                        {titleCase(client.status || "ACTIVE")}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">No client data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    if (key === "pendingApprovals" || key === "totalJobs") {
      const dataSet = key === "pendingApprovals" 
        ? modalData.filter(job => job.approvalStatus === "PENDING")
        : modalData;

      return (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4">Job Role</th>
                <th className="px-5 py-4">Company & Dept</th>
                <th className="px-5 py-4">Details</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {isModalLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">Loading data...</td>
                </tr>
              ) : dataSet.length ? (
                dataSet.map((job) => (
                  <tr key={job.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm font-medium text-slate-900">{job.title}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {job.companyName}<br/><span className="text-xs text-slate-400">{job.department || "General"}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {job.workplaceType || "Flexible"} &bull; {job.location || "Pending"}
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={job.approvalStatus === "PENDING" ? "amber" : "emerald"}>
                        {titleCase(job.approvalStatus || "ACTIVE")}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">No job data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    if (key === "qrCodes") {
      return (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4">Company</th>
                <th className="px-5 py-4">Position</th>
                <th className="px-5 py-4">Scans</th>
              </tr>
            </thead>
            <tbody>
              {isModalLoading ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-sm text-slate-500">Loading data...</td>
                </tr>
              ) : modalData.length ? (
                modalData.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm font-medium text-slate-900">{item.companyName}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{item.jobTitle || "Landing Page"}</td>
                    <td className="px-5 py-4">
                      <Badge tone="blue">{formatNumber(item.scans || 0)}</Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-sm text-slate-500">No QR data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#163060]/10 text-[#163060]">
          {selectedMetric?.icon ? <selectedMetric.icon size={28} /> : null}
        </div>
        <p className="text-3xl font-bold text-slate-900">{selectedMetric?.value}</p>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const { key: metricKey, detail, ...metricProps } = metric;
          return (
            <MetricCard 
              key={metricKey || metric.label} 
              {...metricProps} 
              onClick={() => setSelectedMetric(metric)}
            />
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <PanelCard>
          <SectionHeading
            eyebrow="Operational readiness"
            title="Package and client delivery posture"
            description="Track package commitments, live capacity, and company-level activity from one operational board."
          />



          <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
            <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.6fr] gap-3 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              <span>Client company</span>
              <span>Package</span>
              <span>Jobs</span>
              <span>Status</span>
            </div>
            {dashboard.clientOverview.length ? (
              dashboard.clientOverview.map((client) => (
                <div
                  key={client.name}
                  className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.6fr] gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 transition hover:bg-lime-50/30"
                >
                  <div className="font-semibold text-slate-900">{client.name}</div>
                  <div>{titleCase(client.packageType)}</div>
                  <div>
                    {client.activeJobCount}/{client.jobLimit} live
                  </div>
                  <div>
                    <Badge tone={client.status === "ACTIVE" ? "emerald" : "rose"}>
                      {titleCase(client.status)}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6">
                <EmptyState
                  title="No client accounts yet"
                  description="Once CRM adds company records, package coverage and job usage will show here."
                />
              </div>
            )}
          </div>
        </PanelCard>

        <PanelCard>
          <SectionHeading
            eyebrow="CRM outputs"
            title="Campaign and QR activity"
            description="Recent QR deliveries and outbound promotions issued by CRM."
          />

          <div className="mt-6 space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Campaigns sent
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {formatNumber(dashboard.summary.campaigns)}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#163060] to-[#2856a6] text-white">
                  <LuBellRing size={20} />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    QR codes generated
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {formatNumber(dashboard.summary.qrCodeRecords)}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-lime-500 text-white">
                  <LuQrCode size={20} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {dashboard.qrOverview.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="rounded-[20px] border border-slate-200 p-4 transition hover:border-lime-300 hover:bg-lime-50/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.companyName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.jobTitle}
                      </p>
                    </div>
                    <Badge tone="blue">{formatNumber(item.scans)} scans</Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {dashboard.campaignFeed.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="rounded-[20px] border border-slate-200 p-4 transition hover:border-lime-300 hover:bg-lime-50/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <Badge tone="lime">{titleCase(item.channel)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {titleCase(item.audience)} reached:{" "}
                    {formatNumber(item.sentCount)}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </PanelCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <PanelCard>
          <SectionHeading
            eyebrow="Approval queue"
            title="Client-created jobs awaiting CRM review"
            description="Review approvals, intervene quickly, and maintain package compliance before roles go live."
          />

          <div
            className={`mt-6 space-y-3 ${
              hasJobApprovalsOverflow
                ? "crm-scroll-panel max-h-[33rem] overflow-y-auto pr-2"
                : ""
            }`}
          >
            {jobApprovals.length ? (
              jobApprovals.map((job) => (
                <div
                  key={job.id}
                  className="rounded-[20px] border border-slate-200 p-4 transition hover:border-lime-300 hover:bg-lime-50/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{job.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {job.companyName} {"\u2022"} {job.department || "General"}
                      </p>
                    </div>
                    <Badge
                      tone={job.approvalStatus === "PENDING" ? "amber" : "rose"}
                    >
                      {titleCase(job.approvalStatus)}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {job.jobType || "Role"} {"\u2022"} {job.workplaceType || "Flexible"} {"\u2022"}{" "}
                    {job.location || "Location pending"}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                title="Approval queue is clear"
                description="Client-submitted openings pending review will appear here."
              />
            )}
          </div>
        </PanelCard>

        <PanelCard>
          <SectionHeading
            eyebrow="Application flow"
            title="Recent candidate activity"
            description="CRM can view end-to-end application movement across all client job pipelines."
          />

          <div
            className={`mt-6 space-y-3 ${
              hasApplicationFeedOverflow
                ? "crm-scroll-panel max-h-[33rem] overflow-y-auto pr-2"
                : ""
            }`}
          >
            {applicationFeed.length ? (
              applicationFeed.map((application) => (
                <div
                  key={application.id}
                  className="rounded-[20px] border border-slate-200 p-4 transition hover:border-lime-300 hover:bg-lime-50/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {application.candidateName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {application.companyName} {"\u2022"} {application.jobTitle}
                      </p>
                    </div>
                    <Badge tone="blue">{titleCase(application.status)}</Badge>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    Updated {formatDateTime(application.updatedAt)}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                title="No applications available"
                description="Candidate applications will appear here once the platform starts receiving submissions."
              />
            )}
          </div>
        </PanelCard>
      </section>

      <ModalShell
        open={Boolean(selectedMetric)}
        title={selectedMetric?.label || ""}
        description={selectedMetric?.detail || ""}
        onClose={() => setSelectedMetric(null)}
        width="max-w-4xl"
      >
        {renderModalContent()}
      </ModalShell>
    </div>
  );
}
