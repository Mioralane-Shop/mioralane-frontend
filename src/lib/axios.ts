import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // REQUIRED: sends httpOnly cookies with every request
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Attach Bearer token from localStorage (fallback for non-cookie auth)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("mioralane-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401: do NOT clear localStorage here — that causes redirect loops.
// The auth store's checkAuth handles session verification gracefully.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only intervene on 401 if we have no token at all (truly logged out).
    // If we have a token or cookie, let checkAuth decide.
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      const hasToken = localStorage.getItem("mioralane-token");
      if (!hasToken) {
        // No token stored at all → safe to assume fully logged out
        localStorage.removeItem("mioralane-token");
        localStorage.removeItem("mioralane-user");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
