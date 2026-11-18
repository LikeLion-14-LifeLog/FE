import axios from "axios";

/** 공통 API 클라이언트. 서버 응답은 { success, code, message, data } 형태. */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
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
