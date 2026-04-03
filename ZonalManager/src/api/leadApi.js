import axios from "axios";

const getAuthToken = () => {
  const crmSession = sessionStorage.getItem("crm_panel_session");
  if (crmSession) {
    try {
      const parsed = JSON.parse(crmSession);
      if (parsed?.token) {
        return parsed.token;
      }
    } catch {
      // Fall through to legacy token key
    }
  }

  return sessionStorage.getItem("token") || "";
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

const http = axios.create({
  baseURL: resolveModuleApiBaseUrl("/zonal-manager"),
});

http.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function fetchLeadDashboard() {
  const { data } = await http.get("/dashboard");
  return data.data;
}

export async function fetchLeads(params = {}) {
  const normalizedParams = {
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 50,
  };

  if (params.search?.trim()) {
    normalizedParams.search = params.search.trim();
  }

  if (params.status?.trim()) {
    normalizedParams.status = params.status.trim();
  }

  if (params.statusGroup?.trim()) {
    normalizedParams.statusGroup = params.statusGroup.trim();
  }

  if (params.businessCategory?.trim()) {
    normalizedParams.businessCategory = params.businessCategory.trim();
  }

  if (params.leadSource?.trim()) {
    normalizedParams.leadSource = params.leadSource.trim();
  }

  if (params.location?.trim()) {
    normalizedParams.location = params.location.trim();
  }

  if (params.date?.trim()) {
    normalizedParams.date = params.date.trim();
  }

  const { data } = await http.get("/leads", { params: normalizedParams });
  return data;
}

export async function updateLeadStatus(leadId, status) {
  const { data } = await http.patch(`/leads/${leadId}/status`, { status });
  return data.data;
}

export async function fetchStateManagers() {
  const { data } = await http.get("/state-managers");
  return data.data;
}

export async function fetchStateManagerMeta(params = {}) {
  const normalizedParams = {};

  if (params.excludeUserId) {
    normalizedParams.excludeUserId = params.excludeUserId;
  }

  if (params.currentState) {
    normalizedParams.currentState = params.currentState;
  }

  const { data } = await http.get("/state-managers/meta", { params: normalizedParams });
  return data.data;
}

export async function fetchStateManagerRegistry() {
  const { data } = await http.get("/state-managers/registry");
  return data.data;
}

export async function createStateManagerAccount(payload) {
  const { data } = await http.post("/state-managers", payload);
  return data.data;
}

export async function reviewStateManagerAccount(managerId, payload) {
  const { data } = await http.patch(`/state-managers/${managerId}/review`, payload);
  return data.data;
}

export async function deleteStateManagerAccount(managerId) {
  const { data } = await http.delete(`/state-managers/${managerId}`);
  return data.data;
}

export async function assignLeadToStateManager(leadId, stateManagerId) {
  const { data } = await http.patch(`/leads/${leadId}/assign`, { stateManagerId });
  return data.data;
}

export async function logLeadActivity(leadId, activityData) {
  const { data } = await http.post(`/leads/${leadId}/activity`, activityData);
  return data.data;
}

export async function deleteLeadActivity(leadId, index) {
  const { data } = await http.delete(`/leads/${leadId}/activity/${index}`);
  return data.data;
}

export async function fetchZonalManagerProfile() {
  const { data } = await http.get("/profile");
  return data.data;
}

export async function updateZonalManagerProfile(payload) {
  const { data } = await http.patch("/profile", payload);
  return data.data;
}

export async function uploadZonalManagerProfilePhoto(file) {
  const formData = new FormData();
  formData.append("photo", file);
  const { data } = await http.patch("/profile/photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data.data;
}
