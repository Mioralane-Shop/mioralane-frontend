import axios from "axios";
import { handleUnauthorizedSession } from "@/lib/auth-session";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      handleUnauthorizedSession();
    }

    return Promise.reject(error);
  }
);

export default api;
