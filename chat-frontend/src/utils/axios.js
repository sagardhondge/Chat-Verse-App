import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`, // ✅ dynamic from .env
});

// Attach token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("chat-user") || "{}");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth error globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("chat-user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
