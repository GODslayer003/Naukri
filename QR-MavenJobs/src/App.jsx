import { useEffect, useMemo, useState } from "react";
import logo from "./assets/maven-logo.svg";

const MAX_RESUME_SIZE = 8 * 1024 * 1024;
const PHONE_DIGITS_MIN = 10;

const normalizeApiV1BaseUrl = (value = "") => {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return "";
  }

  const trimmedValue = rawValue.replace(/\/+$/, "");
  const match = trimmedValue.match(/^(.*\/api\/v1)(?:\/.*)?$/i);
  return (match ? match[1] : trimmedValue).replace(/\/+$/, "");
};

const resolveCandidateRegisterUrl = () => {
  const normalizedApiV1 = normalizeApiV1BaseUrl(import.meta.env.VITE_API_BASE_URL);
  if (normalizedApiV1) {
    return `${normalizedApiV1}/candidate/auth/register`;
  }

  const candidateModuleBaseUrl = String(import.meta.env.VITE_CANDIDATE_API_URL || "").trim();
  if (candidateModuleBaseUrl) {
    return `${candidateModuleBaseUrl.replace(/\/+$/, "")}/auth/register`;
  }

  return "http://localhost:3000/api/v1/candidate/auth/register";
};

const parseResponseSafely = async (response) => {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

const isValidPhoneNumber = (value = "") => {
  const digits = String(value).replace(/\D/g, "");
  return digits.length === PHONE_DIGITS_MIN;
};

const toIndianPhoneDigits = (value = "") => {
  const digitsOnly = String(value || "").replace(/\D/g, "");
  if (digitsOnly.startsWith("91") && digitsOnly.length > 10) {
    return digitsOnly.slice(2, 12);
  }

  return digitsOnly.slice(0, 10);
};

const resolveQrTokenFromLocation = () => {
  const query = new URLSearchParams(window.location.search);
  const queryToken = String(query.get("token") || "").trim();
  if (queryToken) {
    return queryToken;
  }

  const segments = String(window.location.pathname || "")
    .split("/")
    .filter(Boolean);
  const landingTokenIndex = segments.findIndex((part) => part.toLowerCase() === "landing");

  if (landingTokenIndex >= 0 && segments[landingTokenIndex + 1]) {
    return decodeURIComponent(segments[landingTokenIndex + 1]);
  }

  return "";
};

export default function App() {
  const [view, setView] = useState("role");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [candidateName, setCandidateName] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    preferredPosition: "",
    email: "",
    phone: "",
  });
  const [resumeFile, setResumeFile] = useState(null);

  const registerUrl = useMemo(resolveCandidateRegisterUrl, []);
  const appDownloadUrl = String(import.meta.env.VITE_CANDIDATE_APP_URL || "").trim() || "https://play.google.com/store/apps";
  const qrToken = resolveQrTokenFromLocation();

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const resetCandidateFlow = () => {
    setForm({
      name: "",
      preferredPosition: "",
      email: "",
      phone: "",
    });
    setResumeFile(null);
    setCandidateName("");
    setReferenceId("");
    setShowDownloadModal(false);
    setFeedback({ type: "", message: "" });
    setView("role");
  };

  const validateCandidateForm = () => {
    if (
      !form.name.trim() ||
      !form.preferredPosition.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      return "All fields are mandatory.";
    }

    if (!isValidPhoneNumber(form.phone)) {
      return "Phone number must contain exactly 10 digits.";
    }

    if (!resumeFile) {
      return "CV upload is mandatory.";
    }

    if (resumeFile.size > MAX_RESUME_SIZE) {
      return "CV size must be 8MB or less.";
    }

    return "";
  };

  const submitCandidate = async (event) => {
    event.preventDefault();
    setFeedback({ type: "", message: "" });

    const validationMessage = validateCandidateForm();
    if (validationMessage) {
      setFeedback({ type: "error", message: validationMessage });
      return;
    }

    const payload = new FormData();
    payload.append("name", form.name.trim());
    payload.append("designation", form.preferredPosition.trim());
    payload.append("phone", `+91${toIndianPhoneDigits(form.phone)}`);
    payload.append("email", form.email.trim());
    if (qrToken) {
      payload.append("qrToken", qrToken);
    }
    payload.append("resume", resumeFile);

    setIsSubmitting(true);

    try {
      const response = await fetch(registerUrl, {
        method: "POST",
        body: payload,
      });
      const parsed = await parseResponseSafely(response);

      if (!response.ok) {
        throw new Error(parsed.message || "Unable to submit candidate registration.");
      }

      setCandidateName(form.name.trim());
      setReferenceId(String(parsed.referenceId || "").trim());
      setView("thanks");
      setShowDownloadModal(true);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Unable to submit candidate registration.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!showDownloadModal) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowDownloadModal(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showDownloadModal]);

  return (
    <main className="landing-shell">
      <section className="landing-card">
        <header className="landing-head">
          <img src={logo} alt="Maven Jobs" className="brand-logo" />
          <p className="brand-copy">QR Smart Hiring Entry</p>
        </header>

        {view === "role" ? (
          <>
            <h1 className="headline">SELECT YOUR ROLE</h1>
            <p className="sub-copy">
              Choose how you want to continue in the Maven Jobs hiring flow.
            </p>

            <div className="role-grid">
              <button
                type="button"
                className="role-card"
                onClick={() => {
                  setFeedback({ type: "", message: "" });
                  setView("candidate");
                }}
              >
                <span className="role-chip">Candidate</span>
                <h2>Apply for opportunities</h2>
                <p>Share your personal details and continue with application tracking.</p>
              </button>

              <button
                type="button"
                className="role-card role-card-disabled"
                onClick={() => {
                  setView("client");
                }}
              >
                <span className="role-chip role-chip-muted">Client</span>
                <h2>Hire with Maven Jobs</h2>
                <p>Post openings and manage candidate responses from your hiring workspace.</p>
              </button>
            </div>
          </>
        ) : null}

        {view === "candidate" ? (
          <>
            <h1 className="headline">Candidate Registration</h1>
            <p className="sub-copy">
              Step 1: Personal details. Step 2: Upload CV (mandatory).
            </p>

            {feedback.message ? (
              <div className={`feedback ${feedback.type === "error" ? "feedback-error" : "feedback-info"}`}>
                {feedback.message}
              </div>
            ) : null}

            <form className="candidate-form" onSubmit={submitCandidate} noValidate>
              <label className="form-field">
                <span className="field-label">
                  Full Name <span className="required-asterisk">*</span>
                </span>
                <input type="text" value={form.name} onChange={updateField("name")} placeholder="Your full name" />
              </label>

              <label className="form-field">
                <span className="field-label">
                  Preferred Position <span className="required-asterisk">*</span>
                </span>
                <input
                  type="text"
                  value={form.preferredPosition}
                  onChange={updateField("preferredPosition")}
                  placeholder="e.g. Software Engineer"
                />
              </label>

              <label className="form-field">
                <span className="field-label">
                  Email <span className="required-asterisk">*</span>
                </span>
                <input type="email" value={form.email} onChange={updateField("email")} placeholder="you@example.com" />
              </label>

              <label className="form-field">
                <span className="field-label">
                  Phone Number <span className="required-asterisk">*</span>
                </span>
                <div className="phone-input-row">
                  <span className="country-code-pill">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={form.phone}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, phone: toIndianPhoneDigits(event.target.value) }))
                    }
                    placeholder="9876543210"
                  />
                </div>
              </label>

              <label className="form-field">
                <span className="field-label">
                  Upload CV <span className="required-asterisk">*</span>
                </span>
                <input
                  type="file"
                  accept="*/*"
                  onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
                />
              </label>

              <div className="form-actions">
                <button type="button" className="button button-secondary" onClick={resetCandidateFlow}>
                  Back
                </button>
                <button type="submit" className="button button-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </>
        ) : null}

        {view === "client" ? (
          <section className="placeholder-card">
            <h1 className="headline">Client Flow Coming Soon</h1>
            <p className="sub-copy">
              We are currently enabling the client journey. Candidate flow is fully available now.
            </p>
            <button type="button" className="button button-secondary" onClick={() => setView("role")}>
              Back to Role Selection
            </button>
          </section>
        ) : null}

        {view === "thanks" ? (
          <section className="thanks-card">
            <h1 className="headline">THANK YOU{candidateName ? `, ${candidateName}` : ""}</h1>
            <p className="sub-copy">
              Your application has been submitted successfully.
            </p>
            {referenceId ? (
              <p className="reference-copy">
                Reference ID: <strong>{referenceId}</strong>
              </p>
            ) : null}
            <div className="thanks-actions">
              <button
                type="button"
                className="button button-primary"
                onClick={() => setShowDownloadModal(true)}
              >
                Download MavenJobs App
              </button>
              <button type="button" className="button button-secondary" onClick={resetCandidateFlow}>
                Submit Another Candidate
              </button>
            </div>
          </section>
        ) : null}

        {showDownloadModal ? (
          <div className="download-modal-backdrop" role="presentation" onClick={() => setShowDownloadModal(false)}>
            <section
              className="download-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Download MavenJobs App"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="download-modal-head">
                <img src={logo} alt="Maven Jobs" className="download-modal-logo" />
                <h2>Download MavenJobs App</h2>
                <p>Track your application status and updates live from the app.</p>
              </div>
              <div className="download-modal-actions">
                <a className="button button-primary" href={appDownloadUrl} target="_blank" rel="noreferrer">
                  Download Now
                </a>
                <button type="button" className="button button-secondary" onClick={() => setShowDownloadModal(false)}>
                  Continue on Web
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
