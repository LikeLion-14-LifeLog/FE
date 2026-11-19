import axios from "axios";
import { getAccessToken, logout } from "@/store/authStore";

/** 공통 API 클라이언트. 서버 응답은 { success, code, message, data } 형태. */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// 로그인 상태면 Authorization 헤더에 Access Token을 붙인다
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 토큰을 보낸 요청이 401이면 토큰 만료/무효로 보고 로그아웃한다
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
  /** HTTP 상태 코드 (네트워크 오류면 undefined) */
  status?: number;
  /** 서버 에러 코드 (예: CONFLICT, INVALID_REQUEST) */
  code?: string;
  /** 서버가 내려준 메시지 */
  message?: string;
};

/** axios 에러를 화면에서 쓰기 쉬운 형태로 변환한다. */
export const toApiError = (error: unknown): ApiError => {
  if (!axios.isAxiosError(error)) return {};
  const body = error.response?.data as
    | { code?: string; message?: string }
    | undefined;
  return {
    status: error.response?.status,
    code: body?.code,
    message: body?.message,
  };
};
