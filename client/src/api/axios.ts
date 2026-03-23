import axios from "axios";

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const defaultBaseUrl = isLocalhost 
  ? "http://localhost:5000/api" 
  : "https://kairos-crm-g7af.onrender.com/api";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor – attach token ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kairos_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor – handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("kairos_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
