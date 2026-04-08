import { useEffect, useMemo, useState } from "react";
import logo from "./assets/maven-logo.svg";

const MAX_UPLOAD_FILE_SIZE = 8 * 1024 * 1024;
const MAX_CLIENT_JD_FILES = 5;
const PHONE_DIGITS_REQUIRED = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const resolveClientIntakeUrl = () => {
  const normalizedApiV1 = normalizeApiV1BaseUrl(import.meta.env.VITE_API_BASE_URL);
  if (normalizedApiV1) {
    return `${normalizedApiV1}/lead-generator/client-intakes`;
  }

  return "http://localhost:3000/api/v1/lead-generator/client-intakes";
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
  return digits.length === PHONE_DIGITS_REQUIRED;
};

const toIndianPhoneDigits = (value = "") => {
  const digitsOnly = String(value || "").replace(/\D/g, "");
  if (digitsOnly.startsWith("91") && digitsOnly.length > PHONE_DIGITS_REQUIRED) {
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
  const [isCandidateSubmitting, setIsCandidateSubmitting] = useState(false);
  const [isClientSubmitting, setIsClientSubmitting] = useState(false);

  const [candidateFeedback, setCandidateFeedback] = useState({ type: "", message: "" });
  const [candidateName, setCandidateName] = useState("");
  const [candidateReferenceId, setCandidateReferenceId] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const [candidateForm, setCandidateForm] = useState({
    name: "",
    preferredPosition: "",
    email: "",
    phone: "",
  });
  const [resumeFile, setResumeFile] = useState(null);

  const [clientFeedback, setClientFeedback] = useState({ type: "", message: "" });
  const [clientReferenceId, setClientReferenceId] = useState("");
  const [clientCompanyName, setClientCompanyName] = useState("");
  const [clientForm, setClientForm] = useState({
    companyName: "",
    email: "",
    phone: "",
    roleTitle: "",
    roleDescription: "",
    budget: "",
  });
  const [clientJdFiles, setClientJdFiles] = useState([]);
  const [clientStep, setClientStep] = useState(1);

  const candidateRegisterUrl = useMemo(resolveCandidateRegisterUrl, []);
  const clientIntakeUrl = useMemo(resolveClientIntakeUrl, []);
  const appDownloadUrl =
    String(import.meta.env.VITE_CANDIDATE_APP_URL || "").trim() || "https://play.google.com/store/apps";
  const qrToken = resolveQrTokenFromLocation();

  const updateCandidateField = (field) => (event) => {
    setCandidateForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const updateClientField = (field) => (event) => {
    setClientForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const resetCandidateDraft = () => {
    setCandidateForm({
      name: "",
      preferredPosition: "",
      email: "",
      phone: "",
    });
    setResumeFile(null);
    setCandidateName("");
    setCandidateReferenceId("");
    setShowDownloadModal(false);
    setCandidateFeedback({ type: "", message: "" });
  };

  const resetClientDraft = () => {
    setClientForm({
      companyName: "",
      email: "",
      phone: "",
      roleTitle: "",
      roleDescription: "",
      budget: "",
    });
    setClientJdFiles([]);
    setClientFeedback({ type: "", message: "" });
    setClientReferenceId("");
    setClientCompanyName("");
  };

  const resetCandidateFlow = () => {
    resetCandidateDraft();
    setView("role");
  };

  const resetClientFlow = () => {
    resetClientDraft();
    setClientStep(1);
    setView("role");
  };

  const validateClientStepOne = () => {
    if (!clientForm.companyName.trim() || !clientForm.email.trim() || !clientForm.phone.trim()) {
      return "Company name, email, and phone number are mandatory.";
    }

    if (!EMAIL_PATTERN.test(clientForm.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (!isValidPhoneNumber(clientForm.phone)) {
      return "Phone number must contain exactly 10 digits.";
    }

    return "";
  };

  const handleClientNext = (event) => {
    event.preventDefault();
    setClientFeedback({ type: "", message: "" });

    const validationMessage = validateClientStepOne();
    if (validationMessage) {
      setClientFeedback({ type: "error", message: validationMessage });
      return;
    }

    setClientStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateCandidateForm = () => {
    if (
      !candidateForm.name.trim() ||
      !candidateForm.preferredPosition.trim() ||
      !candidateForm.email.trim() ||
      !candidateForm.phone.trim()
    ) {
      return "All fields are mandatory.";
    }

    if (!isValidPhoneNumber(candidateForm.phone)) {
      return "Phone number must contain exactly 10 digits.";
    }

    if (!EMAIL_PATTERN.test(candidateForm.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (!resumeFile) {
      return "CV upload is mandatory.";
    }

    if (resumeFile.size > MAX_UPLOAD_FILE_SIZE) {
      return "CV size must be 8MB or less.";
    }

    return "";
  };

  const validateClientForm = () => {
    if (!clientForm.companyName.trim() || !clientForm.email.trim() || !clientForm.phone.trim()) {
      return "Company name, email, and phone number are mandatory.";
    }

    if (!EMAIL_PATTERN.test(clientForm.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (!isValidPhoneNumber(clientForm.phone)) {
      return "Phone number must contain exactly 10 digits.";
    }

    if (clientJdFiles.length > MAX_CLIENT_JD_FILES) {
      return `You can upload up to ${MAX_CLIENT_JD_FILES} JD files.`;
    }

    const oversized = clientJdFiles.find((file) => file.size > MAX_UPLOAD_FILE_SIZE);
    if (oversized) {
      return `${oversized.name} exceeds the 8MB upload limit.`;
    }

    if (!clientForm.roleTitle.trim() && !clientJdFiles.length) {
      return "Add a role title or upload at least one JD file.";
    }

    return "";
  };

  const submitCandidate = async (event) => {
    event.preventDefault();
    setCandidateFeedback({ type: "", message: "" });

    const validationMessage = validateCandidateForm();
    if (validationMessage) {
      setCandidateFeedback({ type: "error", message: validationMessage });
      return;
    }

    const payload = new FormData();
    payload.append("name", candidateForm.name.trim());
    payload.append("designation", candidateForm.preferredPosition.trim());
    payload.append("phone", `+91${toIndianPhoneDigits(candidateForm.phone)}`);
    payload.append("email", candidateForm.email.trim());
    if (qrToken) {
      payload.append("qrToken", qrToken);
    }
    payload.append("resume", resumeFile);

    setIsCandidateSubmitting(true);

    try {
      const response = await fetch(candidateRegisterUrl, {
        method: "POST",
        body: payload,
      });
      const parsed = await parseResponseSafely(response);

      if (!response.ok) {
        throw new Error(parsed.message || "Unable to submit candidate registration.");
      }

      setCandidateName(candidateForm.name.trim());
      setCandidateReferenceId(String(parsed.referenceId || "").trim());
      setView("thanks");
      setShowDownloadModal(true);
    } catch (error) {
      setCandidateFeedback({
        type: "error",
        message: error.message || "Unable to submit candidate registration.",
      });
    } finally {
      setIsCandidateSubmitting(false);
    }
  };

  const submitClient = async (event) => {
    event.preventDefault();
    setClientFeedback({ type: "", message: "" });

    const validationMessage = validateClientForm();
    if (validationMessage) {
      setClientFeedback({ type: "error", message: validationMessage });
      return;
    }

    const payload = new FormData();
    payload.append("companyName", clientForm.companyName.trim());
    payload.append("email", clientForm.email.trim());
    payload.append("phone", `+91${toIndianPhoneDigits(clientForm.phone)}`);
    payload.append("roleTitle", clientForm.roleTitle.trim());
    payload.append("roleDescription", clientForm.roleDescription.trim());
    payload.append("budget", clientForm.budget.trim());
    if (qrToken) {
      payload.append("qrToken", qrToken);
    }

    clientJdFiles.forEach((file) => {
      payload.append("jdFiles", file);
    });

    setIsClientSubmitting(true);

    try {
      const response = await fetch(clientIntakeUrl, {
        method: "POST",
        body: payload,
      });
      const parsed = await parseResponseSafely(response);

      if (!response.ok) {
        throw new Error(parsed.message || "Unable to submit client role posting.");
      }

      setClientCompanyName(clientForm.companyName.trim());
      setClientReferenceId(String(parsed.referenceId || "").trim());
      setView("client-thanks");
      setShowDownloadModal(true);
    } catch (error) {
      setClientFeedback({
        type: "error",
        message: error.message || "Unable to submit client role posting.",
      });
    } finally {
      setIsClientSubmitting(false);
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
                  setCandidateFeedback({ type: "", message: "" });
                  setView("candidate");
                }}
              >
                <span className="role-chip">Candidate</span>
                <h2>Apply for opportunities</h2>
                <p>Share your personal details and continue with application tracking.</p>
              </button>

              <button
                type="button"
                className="role-card"
                onClick={() => {
                  setClientFeedback({ type: "", message: "" });
                  setClientStep(1);
                  setView("client");
                }}
              >
                <span className="role-chip role-chip-muted">Client</span>
                <h2>Hire with Maven Jobs</h2>
                <p>Post openings by form or JD upload and track responses from your hiring workspace.</p>
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

            {candidateFeedback.message ? (
              <div className={`feedback ${candidateFeedback.type === "error" ? "feedback-error" : "feedback-info"}`}>
                {candidateFeedback.message}
              </div>
            ) : null}

            <form className="candidate-form" onSubmit={submitCandidate} noValidate>
              <label className="form-field">
                <span className="field-label">
                  Full Name <span className="required-asterisk">*</span>
                </span>
                <input
                  type="text"
                  value={candidateForm.name}
                  onChange={updateCandidateField("name")}
                  placeholder="Your full name"
                />
              </label>

              <label className="form-field">
                <span className="field-label">
                  Preferred Position <span className="required-asterisk">*</span>
                </span>
                <input
                  type="text"
                  value={candidateForm.preferredPosition}
                  onChange={updateCandidateField("preferredPosition")}
                  placeholder="e.g. Software Engineer"
                />
              </label>

              <label className="form-field">
                <span className="field-label">
                  Email <span className="required-asterisk">*</span>
                </span>
                <input
                  type="email"
                  value={candidateForm.email}
                  onChange={updateCandidateField("email")}
                  placeholder="you@example.com"
                />
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
                    value={candidateForm.phone}
                    onChange={(event) =>
                      setCandidateForm((prev) => ({ ...prev, phone: toIndianPhoneDigits(event.target.value) }))
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
                <button type="submit" className="button button-primary" disabled={isCandidateSubmitting}>
                  {isCandidateSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </>
        ) : null}

        {view === "client" ? (
          <>
            <h1 className="headline">Client / Employer Registration</h1>
            <p className="sub-copy">
              {clientStep === 1
                ? "Step 1 of 2: Company details."
                : "Step 2 of 2: Add role manually or upload JD files."}
            </p>

            {clientFeedback.message ? (
              <div className={`feedback ${clientFeedback.type === "error" ? "feedback-error" : "feedback-info"}`}>
                {clientFeedback.message}
              </div>
            ) : null}

            <form
              className="candidate-form client-form"
              onSubmit={clientStep === 2 ? submitClient : handleClientNext}
              noValidate
            >
              {clientStep === 1 ? (
                <>
                  <label className="form-field">
                    <span className="field-label">
                      Company Name <span className="required-asterisk">*</span>
                    </span>
                    <input
                      type="text"
                      value={clientForm.companyName}
                      onChange={updateClientField("companyName")}
                      placeholder="Company legal name"
                    />
                  </label>

                  <label className="form-field">
                    <span className="field-label">
                      Company Email <span className="required-asterisk">*</span>
                    </span>
                    <input
                      type="email"
                      value={clientForm.email}
                      onChange={updateClientField("email")}
                      placeholder="hr@company.com"
                    />
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
                        value={clientForm.phone}
                        onChange={(event) =>
                          setClientForm((prev) => ({ ...prev, phone: toIndianPhoneDigits(event.target.value) }))
                        }
                        placeholder="9876543210"
                      />
                    </div>
                  </label>

                  <label className="form-field">
                    <span className="field-label">Budget / CTC (optional)</span>
                    <input
                      type="text"
                      value={clientForm.budget}
                      onChange={updateClientField("budget")}
                      placeholder="e.g. 8-10 LPA"
                    />
                  </label>

                  <div className="form-actions">
                    <button type="button" className="button button-secondary" onClick={resetClientFlow}>
                      Back
                    </button>
                    <button type="submit" className="button button-primary">
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <label className="form-field">
                    <span className="field-label">Role Title (option A: manual)</span>
                    <input
                      type="text"
                      value={clientForm.roleTitle}
                      onChange={updateClientField("roleTitle")}
                      placeholder="e.g. Territory Sales Manager"
                    />
                  </label>

                  <label className="form-field form-field-full">
                    <span className="field-label">Role Description (optional)</span>
                    <textarea
                      value={clientForm.roleDescription}
                      onChange={updateClientField("roleDescription")}
                      placeholder="Describe responsibilities, skills, and hiring context."
                    />
                  </label>

                  <label className="form-field form-field-full">
                    <span className="field-label">Upload JD Files (option B)</span>
                    <input
                      type="file"
                      multiple
                      onChange={(event) => setClientJdFiles(Array.from(event.target.files || []))}
                    />
                    <small className="field-hint">
                      Upload up to {MAX_CLIENT_JD_FILES} files, max 8MB each. Add role title or at least one JD file.
                    </small>
                    {clientJdFiles.length ? (
                      <div className="selected-files">
                        {clientJdFiles.map((file) => (
                          <span key={`${file.name}-${file.size}`}>{file.name}</span>
                        ))}
                      </div>
                    ) : null}
                  </label>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => {
                        setClientStep(1);
                        setClientFeedback({ type: "", message: "" });
                      }}
                    >
                      Back
                    </button>
                    <button type="submit" className="button button-primary" disabled={isClientSubmitting}>
                      {isClientSubmitting ? "Submitting..." : "Submit Role Posting"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </>
        ) : null}

        {view === "thanks" ? (
          <section className="thanks-card">
            <h1 className="headline">THANK YOU{candidateName ? `, ${candidateName}` : ""}</h1>
            <p className="sub-copy">
              Your application has been submitted successfully.
            </p>
            {candidateReferenceId ? (
              <p className="reference-copy">
                Reference ID: <strong>{candidateReferenceId}</strong>
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

        {view === "client-thanks" ? (
          <section className="thanks-card">
            <h1 className="headline">THANK YOU{clientCompanyName ? `, ${clientCompanyName}` : ""}</h1>
            <p className="sub-copy">
              Your role posting has been submitted successfully.
            </p>
            {clientReferenceId ? (
              <p className="reference-copy">
                Reference ID: <strong>{clientReferenceId}</strong>
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
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  resetClientDraft();
                  setClientStep(1);
                  setView("client");
                }}
              >
                Submit Another Role
              </button>
              <button type="button" className="button button-secondary" onClick={resetClientFlow}>
                Back to Role Selection
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
