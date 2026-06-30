import axios from "axios";

// In production, set VITE_API_URL to the backend origin (e.g. https://your-app.onrender.com/api).
// In local dev it falls back to "/api", which Vite proxies to http://localhost:4000.
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("its_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
