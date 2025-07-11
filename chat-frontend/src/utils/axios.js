import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`, // ✅ Use environment variable
});

// Automatically attach token to each request
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

// Handle token expiration globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.warn("⚠️ Token expired or unauthorized");
      localStorage.removeItem("chat-user");
      localStorage.removeItem("token");
      window.location.href = "/login"; // Redirect to login page
    }
    return Promise.reject(error);
  }
);
console.log("🌐 API Base URL:", import.meta.env.VITE_API_URL);


export default api;
