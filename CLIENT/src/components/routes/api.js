import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_URL,
});

// Automatically attach Firebase ID token to ALL requests
api.interceptors.request.use(async (config) => {
  const idToken = localStorage.getItem("idToken");

  if (idToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${idToken}`;
  }
  return config;
});

export const verifyWithBackend = async (idToken) => {
  const resp = await api.post("/auth/login", { id_token: idToken });
  return resp.data; // { uid, email, user? }
};

// UPLOAD for Gemini remains same:
export const uploadStudyFile = async (formData) => {
  const resp = await api.post("/api/gemini/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return resp.data;
};

export default api;
