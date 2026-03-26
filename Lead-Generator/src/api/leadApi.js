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

const http = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1/lead-generator",
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

export async function fetchLeadMeta() {
  const { data } = await http.get("/meta");
  return data.data;
}

export async function fetchLeads(params = {}) {
  const normalizedParams = {
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 10,
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

  if (params.zone?.trim()) {
    normalizedParams.zone = params.zone.trim();
  }

  if (params.date?.trim()) {
    normalizedParams.date = params.date.trim();
  }

  if (params.businessCategory?.trim()) {
    normalizedParams.businessCategory = params.businessCategory.trim();
  }

  if (params.leadSource?.trim()) {
    normalizedParams.leadSource = params.leadSource.trim();
  }

  const { data } = await http.get("/leads", { params: normalizedParams });
  return data.data;
}

export async function createLead(payload) {
  const { data } = await http.post("/leads", payload);
  return data.data;
}

export async function updateLeadStatus(leadId, status) {
  const { data } = await http.patch(`/leads/${leadId}/status`, { status });
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

export async function fetchLeadProfile() {
  const { data } = await http.get("/profile");
  return data.data;
}

export async function uploadLeadProfilePhoto(file) {
  const formData = new FormData();
  formData.append("photo", file);
  const { data } = await http.patch("/profile/photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data.data;
}
