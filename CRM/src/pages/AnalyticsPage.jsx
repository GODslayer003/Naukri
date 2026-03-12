import { useEffect, useState } from "react";
import { LuChartColumnIncreasing, LuMapPinned } from "react-icons/lu";
import { Badge, PageState, PanelCard, SectionHeading } from "../components/Ui";
import { getAnalytics } from "../services/crmApi";
import { formatNumber, titleCase } from "../utils/formatters";

function AnalyticsTable({ title, rows }) {
  return (
    <PanelCard>
      <SectionHeading
        eyebrow="Geography"
        title={title}
        description="CRM area-wise visibility across client distribution and active hiring volume."
      />
      <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
        <div className="grid grid-cols-[1.1fr_0.7fr_0.7fr] gap-3 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          <span>Area</span>
          <span>Clients</span>
          <span>Open roles</span>
        </div>
        {rows.map((row) => (
          <div
            key={row.location}
            className="grid grid-cols-[1.1fr_0.7fr_0.7fr] gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 transition hover:bg-lime-50/30"
          >
            <span className="font-semibold text-slate-900">{row.location}</span>
            <span>{formatNumber(row.clients)}</span>
            <span>{formatNumber(row.openRoles)}</span>
          </div>
        ))}
      </div>
    </PanelCard>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      setIsLoading(true);
      setPageError("");

      try {
        const response = await getAnalytics();
        if (isMounted) {
          setAnalytics(response.data);
        }
      } catch (requestError) {
        if (isMounted) {
          setPageError(requestError.message || "Unable to load analytics.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <PageState title="Loading analytics..." />;
  }

  if (pageError) {
    return <PageState title={pageError} error />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <PanelCard>
          <SectionHeading
            eyebrow="Area-wise reporting"
            title="Region, city, and zone analytics"
            description="CRM can monitor client distribution and live role demand across every major geographical segment."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#163060] to-[#2856a6] text-white">
                  <LuChartColumnIncreasing size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Regions tracked</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {formatNumber(analytics.regions.length)}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7fd000] to-[#b2f114] text-slate-900">
                  <LuMapPinned size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Cities tracked</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {formatNumber(analytics.cities.length)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PanelCard>

        <PanelCard>
          <SectionHeading
            eyebrow="Package mix"
            title="Current plan configuration"
            description="Operational summary of active package templates currently available to CRM."
          />

          <div className="mt-6 space-y-4">
            {analytics.packageMix.map((pkg) => (
              <div
                key={pkg._id || pkg.id || pkg.name}
                className="rounded-[24px] border border-slate-200 p-5 transition hover:border-lime-300 hover:bg-lime-50/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {titleCase(pkg.name)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {pkg.description}
                    </p>
                  </div>
                  <Badge tone="lime">{pkg.jobLimit} posts</Badge>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <AnalyticsTable title="Region performance" rows={analytics.regions} />
        <AnalyticsTable title="City performance" rows={analytics.cities} />
        <AnalyticsTable title="Zone performance" rows={analytics.zones} />
      </section>
    </div>
  );
}
