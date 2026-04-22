import axios from "axios";

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const defaultBaseUrl = isLocalhost 
  ? "http://localhost:5000/api" 
  : "https://kairos-djb5.onrender.com/api";

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
    const responseData = error.response?.data;
    const errorMessage = responseData?.message || error.message || "An unexpected error occurred";

    if (error.response?.status === 401) {
      localStorage.removeItem("kairos_token");
      if (!window.location.pathname.endsWith("/login")) {
        window.location.href = "/login";
      }
    } else if (error.response?.status >= 400) {
      // Show descriptive error to user if they are in dev mode or seeing 400s
      console.error("API Error:", errorMessage);
      alert(`Error (${error.response.status}): ${errorMessage}`);
    }
    
    return Promise.reject(error);
  }
);

export default api;
