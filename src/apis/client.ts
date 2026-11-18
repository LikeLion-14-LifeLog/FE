import axios from "axios";
import { getAccessToken, logout } from "@/store/authStore";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(undefined, (error) => {
  if (
    axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    error.config?.headers?.Authorization
  ) {
    logout();
  }
  return Promise.reject(error);
});

export type ApiError = {
  status?: number;
  code?: string;
  message?: string;
};

export const toApiError = (error: unknown): ApiError => {
  if (!axios.isAxiosError(error)) return {};
  const body = error.response?.data as
    { code?: string; message?: string } | undefined;
  return {
    status: error.response?.status,
    code: body?.code,
    message: body?.message,
  };
};
