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

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1/fse",
});

http.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function loginFSE(payload) {
  const { data } = await http.post("/auth/login", payload);
  return data;
}

export async function signupFSE(payload) {
  const { data } = await http.post("/auth/signup", payload);
  return data;
}

export async function changeFsePassword(payload) {
  const { data } = await http.patch("/auth/change-password", payload);
  return data;
}

export async function fetchFseDashboard() {
  const { data } = await http.get("/dashboard");
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
