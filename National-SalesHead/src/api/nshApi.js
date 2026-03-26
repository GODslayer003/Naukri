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
      // ignore
    }
  }
  return "";
};

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1/national-sales-head",
});

http.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function loginNSH(credentials) {
  const { data } = await http.post("/auth/login", credentials);
  return data;
}

export async function fetchNSHDashboard() {
  const { data } = await http.get("/dashboard");
  return data.data;
}

export async function fetchZoneStats() {
  const { data } = await http.get("/zones");
  return data.data;
}

export async function fetchAllLeads(params = {}) {
  const { data } = await http.get("/leads", { params });
  return data;
}

export async function fetchStatePerformance(params = {}) {
  const { data } = await http.get("/performance/states", { params });
  return data.data;
}

export async function fetchIndividualPerformance(params = {}) {
  const { data } = await http.get("/performance/individual", { params });
  return data.data;
}

export async function fetchPendingApprovals(params = {}) {
  const { data } = await http.get("/approvals/pending", { params });
  return data.data;
}

export async function reviewLeadApproval(leadId, payload) {
  const { data } = await http.post(`/approvals/${leadId}/decision`, payload);
  return data;
}

export async function fetchApprovalPolicy() {
  const { data } = await http.get("/approval-policy");
  return data.data;
}

export async function updateApprovalPolicy(payload) {
  const { data } = await http.put("/approval-policy", payload);
  return data;
}

export async function fetchProfile() {
  const { data } = await http.get("/profile");
  return data.data;
}
