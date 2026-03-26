import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LuBuilding2,
  LuFileText,
  LuLoaderCircle,
  LuMail,
  LuMapPin,
  LuPhone,
  LuUserRound,
} from "react-icons/lu";
import { createFseLead, fetchFseMeta } from "../api/fseApi";

const DEFAULT_BUSINESS_CATEGORY_OPTIONS = [
  "IT & Technology",
  "Manufacturing",
  "Retail",
  "Healthcare",
  "Logistics",
  "Finance",
];

const DEFAULT_LEAD_SOURCE_OPTIONS = [
  "Cold Call",
  "Referral",
  "Field Visit",
  "Social Media",
  "Inbound Inquiry",
];

const initialForm = {
  fullName: "",
  companyName: "",
  phone: "",
  email: "",
  businessCategory: "",
  leadSource: "",
  address: "",
};

function Field({ label, children }) {
  return (
    <label className="form-field">
      <span className="sr-only">{label}</span>
      {children}
    </label>
  );
}

export default function AddLead() {
  const navigate = useNavigate();
  const [meta, setMeta] = useState({
    businessCategories: DEFAULT_BUSINESS_CATEGORY_OPTIONS,
    leadSources: DEFAULT_LEAD_SOURCE_OPTIONS,
  });
  const [form, setForm] = useState(initialForm);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadMeta = async () => {
      try {
        setLoadingMeta(true);
        const data = await fetchFseMeta();
        if (mounted) {
          setMeta({
            businessCategories: data?.businessCategories?.length
              ? data.businessCategories
              : DEFAULT_BUSINESS_CATEGORY_OPTIONS,
            leadSources: data?.leadSources?.length ? data.leadSources : DEFAULT_LEAD_SOURCE_OPTIONS,
          });
          setError("");
        }
      } catch (requestError) {
        if (mounted) {
          setMeta({
            businessCategories: DEFAULT_BUSINESS_CATEGORY_OPTIONS,
            leadSources: DEFAULT_LEAD_SOURCE_OPTIONS,
          });
          setError(requestError?.response?.data?.message || "Unable to load lead options.");
        }
      } finally {
        if (mounted) {
          setLoadingMeta(false);
        }
      }
    };

    loadMeta();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedPhone = form.phone.replace(/\D/g, "");
    if (normalizedPhone.length < 10) {
      setError("Phone number must contain at least 10 digits.");
      return;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        contactName: form.fullName.trim(),
        companyName: form.companyName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        businessCategory: form.businessCategory,
        leadSource: form.leadSource,
        address: form.address.trim(),
      };
      await createFseLead(payload);
      navigate("/my-leads", { replace: true });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to save lead.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-section">
      <section className="add-lead-header">
        <div>
          <h1>Add New Lead Details</h1>
          <p>FSE can add and manage leads directly from this panel.</p>
        </div>
      </section>

      <form className="add-lead-form" onSubmit={handleSubmit}>
        {loadingMeta ? (
          <div className="loading-block">
            <LuLoaderCircle className="spin" />
            Loading lead form...
          </div>
        ) : (
          <>
            {error ? <div className="status-banner">{error}</div> : null}

            <section className="lead-block company-block">
              <div className="lead-block-header">
                <span className="lead-block-icon">
                  <LuBuilding2 />
                </span>
                <h2>Company Information</h2>
              </div>

              <div className="lead-block-grid two-col">
                <Field label="Company Name">
                  <input
                    className="input add-lead-input"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="Company Name"
                    required
                  />
                </Field>

                <Field label="Business Category">
                  <select
                    className="input add-lead-input add-lead-select"
                    name="businessCategory"
                    value={form.businessCategory}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Select Category...
                    </option>
                    {(meta?.businessCategories || []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="lead-block-grid one-col">
                <Field label="Location or Address">
                  <div className="input-shell">
                    <input
                      className="input add-lead-input"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Location / Address"
                      required
                    />
                    <LuMapPin className="input-icon" />
                  </div>
                </Field>
              </div>
            </section>

            <section className="lead-block">
              <div className="lead-block-header">
                <span className="lead-block-icon">
                  <LuUserRound />
                </span>
                <h2>Contact Person</h2>
              </div>

              <div className="lead-block-grid two-col">
                <Field label="Full Name">
                  <input
                    className="input add-lead-input"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                  />
                </Field>

                <Field label="Phone Number">
                  <div className="input-shell">
                    <input
                      className="input add-lead-input"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      required
                    />
                    <LuPhone className="input-icon" />
                  </div>
                </Field>
              </div>

              <div className="lead-block-grid one-col">
                <Field label="Email Address">
                  <div className="input-shell">
                    <input
                      className="input add-lead-input"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                    />
                    <LuMail className="input-icon" />
                  </div>
                </Field>
              </div>
            </section>

            <section className="lead-block">
              <div className="lead-block-header">
                <span className="lead-block-icon">
                  <LuFileText />
                </span>
                <h2>Lead Source</h2>
              </div>

              <div className="lead-block-grid one-col lead-source-grid">
                <Field label="Source">
                  <select
                    className="input add-lead-input add-lead-select"
                    name="leadSource"
                    value={form.leadSource}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Select Source...
                    </option>
                    {(meta?.leadSources || []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>

            <div className="add-lead-actions">
              <Link to="/my-leads" className="cancel-inline">
                Cancel
              </Link>
              <button type="submit" className="button button-primary" disabled={saving}>
                {saving ? <LuLoaderCircle className="spin" /> : null}
                {saving ? "Submitting..." : "Submit Lead"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
