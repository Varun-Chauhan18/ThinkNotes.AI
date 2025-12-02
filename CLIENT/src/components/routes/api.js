import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
console.log("API_URL =", API_URL);

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(
  (config) => {
    const idToken = localStorage.getItem("idToken");
    if (idToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${idToken}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// -------------------------------
// AUTH
// -------------------------------
export const verifyWithBackend = async (idToken) => {
  try {
    const resp = await api.post("/auth/login", { id_token: idToken });
    return resp.data;
  } catch (err) {
    console.error(
      "verifyWithBackend error:",
      err?.response || err?.message || err
    );
    throw err;
  }
};

// -------------------------------
// GEMINI UPLOAD
// -------------------------------
export const uploadStudyFile = async (formData, wantPdf = true) => {
  try {
    const url = `/api/gemini/upload?return_pdf=${wantPdf ? "true" : "false"}`;
    console.log("uploadStudyFile -> POST", url, {
      formKeys: Array.from(formData.keys()),
    });

    const resp = await api.post(url, formData);
    return resp.data;
  } catch (err) {
    console.error(
      "uploadStudyFile error:",
      err?.response || err?.message || err
    );
    if (err?.response) {
      console.error("status:", err.response.status, "data:", err.response.data);
    }
    throw err;
  }
};

export default api;
