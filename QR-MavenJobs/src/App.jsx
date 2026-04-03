import { useMemo, useState } from "react";
import logo from "./assets/maven-logo.svg";

const MAX_RESUME_SIZE = 8 * 1024 * 1024;
const PHONE_DIGITS_MIN = 10;
const PHONE_DIGITS_MAX = 15;

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
  return digits.length >= PHONE_DIGITS_MIN && digits.length <= PHONE_DIGITS_MAX;
};

const isPdfFile = (file) => {
  if (!file) {
    return true;
  }

  const mimeMatches = file.type === "application/pdf";
  const nameMatches = String(file.name || "").toLowerCase().endsWith(".pdf");
  return mimeMatches || nameMatches;
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

  const [form, setForm] = useState({
    name: "",
    designation: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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
      designation: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    setResumeFile(null);
    setCandidateName("");
    setFeedback({ type: "", message: "" });
    setView("role");
  };

  const validateCandidateForm = () => {
    if (
      !form.name.trim() ||
      !form.designation.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password.trim() ||
      !form.confirmPassword.trim()
    ) {
      return "All fields are mandatory except resume.";
    }

    if (form.password !== form.confirmPassword) {
      return "Password and confirm password must match.";
    }

    if (!isValidPhoneNumber(form.phone)) {
      return `Phone number must contain ${PHONE_DIGITS_MIN} to ${PHONE_DIGITS_MAX} digits.`;
    }

    if (form.password.length < 8) {
      return "Password must be at least 8 characters long.";
    }

    if (resumeFile && !isPdfFile(resumeFile)) {
      return "Resume must be a PDF file.";
    }

    if (resumeFile && resumeFile.size > MAX_RESUME_SIZE) {
      return "Resume size must be 8MB or less.";
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
    payload.append("designation", form.designation.trim());
    payload.append("phone", form.phone.trim());
    payload.append("email", form.email.trim());
    payload.append("password", form.password);
    if (qrToken) {
      payload.append("qrToken", qrToken);
    }
    if (resumeFile) {
      payload.append("resume", resumeFile);
    }

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
      setView("thanks");
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Unable to submit candidate registration.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Resume is optional. All other fields are mandatory.
            </p>

            {feedback.message ? (
              <div className={`feedback ${feedback.type === "error" ? "feedback-error" : "feedback-info"}`}>
                {feedback.message}
              </div>
            ) : null}

            <form className="candidate-form" onSubmit={submitCandidate} noValidate>
              <label>
                Full Name <span>*</span>
                <input type="text" value={form.name} onChange={updateField("name")} placeholder="Your full name" />
              </label>

              <label>
                Designation <span>*</span>
                <input
                  type="text"
                  value={form.designation}
                  onChange={updateField("designation")}
                  placeholder="e.g. Software Engineer"
                />
              </label>

              <label>
                Email <span>*</span>
                <input type="email" value={form.email} onChange={updateField("email")} placeholder="you@example.com" />
              </label>

              <label>
                Phone Number <span>*</span>
                <input type="tel" value={form.phone} onChange={updateField("phone")} placeholder="+91 98765 43210" />
              </label>

              <label>
                Password <span>*</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={updateField("password")}
                  placeholder="Minimum 8 characters"
                />
              </label>

              <label>
                Confirm Password <span>*</span>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={updateField("confirmPassword")}
                  placeholder="Repeat password"
                />
              </label>

              <label>
                Resume (Optional)
                <input
                  type="file"
                  accept=".pdf,application/pdf"
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
              For tracking your application download our App.
            </p>
            <div className="thanks-actions">
              <a className="button button-primary" href={appDownloadUrl} target="_blank" rel="noreferrer">
                Download App
              </a>
              <button type="button" className="button button-secondary" onClick={resetCandidateFlow}>
                Submit Another Candidate
              </button>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
