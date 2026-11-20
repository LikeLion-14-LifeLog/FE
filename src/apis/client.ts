import axios, { isAxiosError } from "axios";
import { getAccessToken, logout } from "@/store/authStore";

/** 서버 공통 응답 포맷 (com.lifelog.global.response.ApiResponse) */
export type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

/** 서버 페이지 메타데이터 (SliceResponse). 목록 DTO 필드는 같은 객체에 펼쳐져서 온다. */
export type PageMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

/** API 실패. status 가 null 이면 네트워크 오류(응답 없음). */
export class ApiError extends Error {
  readonly status: number | null;
  readonly code: string | null;

  constructor(message: string, status: number | null, code: string | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// 로그인 상태면 Authorization 헤더에 Access Token(authStore)을 붙인다
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    if (isAxiosError<Partial<ApiResponse<unknown>>>(error)) {
      const status = error.response?.status ?? null;
      // 현재 세션의 토큰을 보낸 요청이 401이면 토큰 만료/무효로 보고 로그아웃한다.
      // 이전 세션 토큰으로 보낸 요청의 늦은 401은 새 세션을 지우지 않는다.
      const sentToken = error.config?.headers?.Authorization;
      const currentToken = getAccessToken();
      if (status === 401 && currentToken && sentToken === `Bearer ${currentToken}`)
        logout();

      const body = error.response?.data;
      return Promise.reject(
        new ApiError(body?.message ?? error.message, status, body?.code ?? null),
      );
    }
    return Promise.reject(error);
  },
);

/** ApiResponse 를 벗겨 data 만 반환한다. success=false 면 ApiError. */
export const unwrap = <T>(body: ApiResponse<T>): T => {
  if (!body.success) throw new ApiError(body.message, null, body.code);
  return body.data;
};

/** 화면에서 쓰기 쉬운 오류 정보. ApiError 가 아니면 빈 값 (status·code·message 모두 undefined) */
export const toApiError = (
  error: unknown,
): { status?: number; code?: string; message?: string } =>
  error instanceof ApiError
    ? {
        status: error.status ?? undefined,
        code: error.code ?? undefined,
        message: error.message || undefined,
      }
    : {};
