import { useEffect, useState } from "react";
import { LuSettings2, LuUserCog } from "react-icons/lu";
import {
  Badge,
  MetricCard,
  PageState,
  PanelCard,
  SectionHeading,
  TextField,
} from "../components/Ui";
import { getSettings, updateSettings } from "../services/crmApi";
import { titleCase } from "../utils/formatters";

const defaultForm = {
  fullName: "",
  phone: "",
  department: "",
  scope: "",
  territory: "",
  state: "",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [formState, setFormState] = useState(defaultForm);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successNote, setSuccessNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setIsLoading(true);
    setPageError("");

    try {
      const response = await getSettings();
      setSettings(response.data);
      setFormState({
        fullName: response.data.profile.fullName || "",
        phone: response.data.profile.phone || "",
        department: response.data.profile.department || "",
        scope: response.data.profile.scope || "",
        territory: response.data.profile.territory || "",
        state: response.data.profile.state || "",
      });
    } catch (requestError) {
      setPageError(requestError.message || "Unable to load CRM settings.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setActionError("");
    setSuccessNote("");

    try {
      await updateSettings(formState);
      await loadSettings();
      setSuccessNote("CRM profile updated successfully.");
    } catch (requestError) {
      setActionError(requestError.message || "Unable to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageState title="Loading settings..." />;
  }

  if (pageError) {
    return <PageState title={pageError} error />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="grid gap-4 md:grid-cols-2">
        <MetricCard
          label="CRM role"
          value={titleCase(settings.profile.role)}
          detail="Current operational role attached to this CRM account."
          icon={LuUserCog}
          tone="blue"
        />
        <MetricCard
          label="Available channels"
          value={settings.channels.join(" / ")}
          detail="Delivery channels enabled for CRM-driven promotions and alerts."
          icon={LuSettings2}
          tone="lime"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <PanelCard>
          <SectionHeading
            eyebrow="CRM profile"
            title="Update operational account settings"
            description="Maintain CRM contact, territory, state, scope, and organizational metadata used by the backend."
          />

          {actionError ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {actionError}
            </div>
          ) : null}

          {successNote ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {successNote}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <TextField
              label="Full name"
              value={formState.fullName}
              onChange={(event) =>
                setFormState((current) => ({ ...current, fullName: event.target.value }))
              }
            />
            <TextField
              label="Phone"
              value={formState.phone}
              onChange={(event) =>
                setFormState((current) => ({ ...current, phone: event.target.value }))
              }
            />
            <TextField
              label="Department"
              value={formState.department}
              onChange={(event) =>
                setFormState((current) => ({ ...current, department: event.target.value }))
              }
            />
            <TextField
              label="Scope"
              value={formState.scope}
              onChange={(event) =>
                setFormState((current) => ({ ...current, scope: event.target.value }))
              }
            />
            <TextField
              label="Territory"
              value={formState.territory}
              onChange={(event) =>
                setFormState((current) => ({ ...current, territory: event.target.value }))
              }
            />
            <TextField
              label="State"
              value={formState.state}
              onChange={(event) =>
                setFormState((current) => ({ ...current, state: event.target.value }))
              }
            />
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-2xl bg-[#163060] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20498f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Save settings"}
            </button>
          </form>
        </PanelCard>

        <PanelCard>
          <SectionHeading
            eyebrow="System configuration"
            title="Package and channel snapshot"
            description="Reference the current package templates and enabled outbound channels without leaving the CRM workspace."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {settings.packages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:border-lime-300 hover:bg-lime-50/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    {titleCase(pkg.name)}
                  </h3>
                  <Badge tone="lime">{pkg.jobLimit} posts</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {pkg.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Enabled channels</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {settings.channels.map((channel) => (
                <Badge key={channel} tone="blue">
                  {titleCase(channel)}
                </Badge>
              ))}
            </div>
          </div>
        </PanelCard>
      </section>
    </div>
  );
}
