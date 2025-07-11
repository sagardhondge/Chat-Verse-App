// src/utils/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api", // adjust this if your backend URL is different
});

// Automatically attach token
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem("chat-user");
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Optional: logout user, redirect, show alert
      console.warn("⚠️ Token expired or unauthorized");
      localStorage.removeItem("chat-user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
