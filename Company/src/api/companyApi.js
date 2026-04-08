import axios from "axios";

const SESSION_KEY = "company_panel_session";

const normalizeApiV1BaseUrl = (value = "") => {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return "";
  }

  const trimmedValue = rawValue.replace(/\/+$/, "");
  const match = trimmedValue.match(/^(.*\/api\/v1)(?:\/.*)?$/i);
  return (match ? match[1] : trimmedValue).replace(/\/+$/, "");
};

const resolveApiV1BaseUrl = () => {
  const configuredBaseUrl = normalizeApiV1BaseUrl(import.meta.env.VITE_API_BASE_URL);
  return configuredBaseUrl || "http://localhost:3000/api/v1";
};

const API_V1_BASE_URL = resolveApiV1BaseUrl();

const getAuthToken = () => {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    return "";
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed?.token || "";
  } catch {
    return "";
  }
};

const http = axios.create({
  baseURL: `${API_V1_BASE_URL}/company-panel`,
});

http.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function loginCompany(payload) {
  const { data } = await http.post("/auth/login", payload);
  return data;
}

export async function fetchCompanyDashboard() {
  const { data } = await http.get("/dashboard");
  return data.data;
}

export async function createCompanyJob(payload) {
  const { data } = await http.post("/jobs", payload);
  return data;
}

export async function fetchCompanyProfile() {
  const { data } = await http.get("/profile");
  return data.data;
}

export async function updateCompanyProfile(payload) {
  const { data } = await http.patch("/profile", payload);
  return data;
}

export async function previewCompanyApplicationResume(applicationId) {
  const { data } = await http.get(`/applications/${applicationId}/resume/preview`, {
    responseType: "blob",
  });
  return data;
}
