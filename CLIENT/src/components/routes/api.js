// src/routes/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_URL,
});

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Use axios for login so the same base URL and interceptor logic are used.
// This also stores the token in localStorage if returned by backend.
export const loginUser = async (credentials) => {
  // credentials: { email, password }
  const resp = await api.post("/auth/login", credentials);
  const data = resp.data;
  if (data?.access_token) {
    localStorage.setItem("token", data.access_token);
  }
  return data;
};

// Optional: register helper (useful)
export const registerUser = async (payload) => {
  // payload: { email, password, full_name }
  const resp = await api.post("/auth/register", payload);
  return resp.data;
};

export default api;
