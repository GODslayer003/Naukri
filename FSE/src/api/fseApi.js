import axios from "axios";

const SESSION_KEY = "crm_panel_session";

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

const normalizeApiV1BaseUrl = (value = "") => {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return "";
  }

  const trimmedValue = rawValue.replace(/\/+$/, "");
  const match = trimmedValue.match(/^(.*\/api\/v1)(?:\/.*)?$/i);
  return (match ? match[1] : trimmedValue).replace(/\/+$/, "");
};

const resolveModuleApiBaseUrl = (modulePath) => {
  const configuredBaseUrl = normalizeApiV1BaseUrl(import.meta.env.VITE_API_BASE_URL);
  const fallbackBaseUrl = `http://localhost:3000/api/v1${modulePath}`;

  if (!configuredBaseUrl) {
    return fallbackBaseUrl;
  }

  const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, "");
  if (normalizedBaseUrl.toLowerCase().endsWith(modulePath.toLowerCase())) {
    return normalizedBaseUrl;
  }

  return `${normalizedBaseUrl}${modulePath}`;
};

const resolveApiV1BaseUrl = () => {
  const configuredBaseUrl = normalizeApiV1BaseUrl(import.meta.env.VITE_API_BASE_URL);
  return configuredBaseUrl || "http://localhost:3000/api/v1";
};

const API_V1_BASE_URL = resolveApiV1BaseUrl();

const http = axios.create({
  baseURL: resolveModuleApiBaseUrl("/fse"),
});

const crmHttp = axios.create({
  baseURL: `${API_V1_BASE_URL}/crm-panel`,
});

const coreHttp = axios.create({
  baseURL: API_V1_BASE_URL,
});

const attachAuthHeader = (config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

http.interceptors.request.use(attachAuthHeader);
crmHttp.interceptors.request.use(attachAuthHeader);
coreHttp.interceptors.request.use(attachAuthHeader);

export async function loginFSE(payload) {
  const { data } = await http.post("/auth/login", payload);
  return data;
}

export async function signupFSE(payload) {
  const { data } = await http.post("/auth/signup", payload);
  return data;
}

export async function fetchFseSignupMeta(zone = "") {
  const params = zone ? { zone } : {};
  const { data } = await http.get("/auth/meta", { params });
  return data.data;
}

export async function changeFsePassword(payload) {
  const { data } = await http.patch("/auth/change-password", payload);
  return data;
}

export async function fetchFseDashboard(params = {}) {
  const { data } = await http.get("/dashboard", { params });
  return data.data;
}

export async function fetchFseMeta() {
  const { data } = await http.get("/meta");
  return data.data;
}

export async function createFseLead(payload) {
  const { data } = await http.post("/leads", payload);
  return data.data;
}

export async function fetchFseLeads(params = {}) {
  const { data } = await http.get("/leads", { params });
  return data.data;
}

export async function updateFseLeadStatus(leadId, status) {
  const { data } = await http.patch(`/leads/${leadId}/status`, { status });
  return data.data;
}

export async function updateFseLeadProjection(leadId, projection) {
  const { data } = await http.patch(`/leads/${leadId}/projection`, { projection });
  return data.data;
}

export async function logFseLeadActivity(leadId, payload) {
  const { data } = await http.post(`/leads/${leadId}/activity`, payload);
  return data.data;
}

export async function deleteFseLeadActivity(leadId, index) {
  const { data } = await http.delete(`/leads/${leadId}/activity/${index}`);
  return data.data;
}

export async function fetchFseProfile() {
  const { data } = await http.get("/profile");
  return data.data;
}

export async function updateFseProfile(payload) {
  const { data } = await http.patch("/profile", payload);
  return data.data;
}

export async function uploadFseProfilePhoto(file) {
  const formData = new FormData();
  formData.append("photo", file);
  const { data } = await http.patch("/profile/photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data.data;
}

export async function fetchFseClientAccounts() {
  const { data } = await crmHttp.get("/clients");
  return data.data;
}

export async function fetchFsePackages() {
  const { data } = await crmHttp.get("/packages");
  return data.data;
}

export async function createFseClientAccount(payload) {
  const { data } = await crmHttp.post("/clients", payload);
  return data;
}

export async function updateFseClientAccount(id, payload) {
  const { data } = await crmHttp.put(`/clients/${id}`, payload);
  return data.data;
}

export async function updateFseClientAccountCredentials(id, payload) {
  const { data } = await crmHttp.patch(`/clients/${id}/credentials`, payload);
  return data.data;
}

export async function fetchFseQRCodes() {
  const { data } = await crmHttp.get("/qr-codes");
  return data.data;
}

export async function shareFseQRCode(id, payload) {
  const { data } = await crmHttp.patch(`/qr-codes/${id}/share`, payload);
  return data.data;
}

export async function generateFseManagedQRCode(payload) {
  const { data } = await coreHttp.post("/qr/generate", payload);
  return data;
}

export function getFseQrPdfDownloadUrl(token) {
  return `${API_V1_BASE_URL}/qr/download/${token}`;
}
