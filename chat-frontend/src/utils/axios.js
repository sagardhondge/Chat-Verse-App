import axios from "axios";

// Create Axios instance with base URL from .env
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`, // e.g. https://chatverse-backend-0c8u.onrender.com/api
});

// Add Authorization header if user is logged in
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("chat-user") || "{}");

    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handling for unauthorized access
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("chat-user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
