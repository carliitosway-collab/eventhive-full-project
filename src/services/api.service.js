import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// baseURL: http://localhost:5005/api  (si VITE_API_URL=http://localhost:5005)
const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// ✅ En cada request, si hay token -> lo agrega en Authorization
api.interceptors.request.use(
  (config) => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    } else {
      // por si acaso, evita headers viejos
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
