import axios, { isAxiosError } from "axios";

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

const ACCESS_TOKEN_KEY = "lifelog:accessToken";

// TODO: 로그인 API 연동 시 로그인 성공 후 setAccessToken 호출
export const getAccessToken = (): string | null => {
  try {
    return (
      localStorage.getItem(ACCESS_TOKEN_KEY) ??
      sessionStorage.getItem(ACCESS_TOKEN_KEY)
    );
  } catch {
    return null;
  }
};

export const setAccessToken = (token: string | null, persist = true) => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    if (token) {
      (persist ? localStorage : sessionStorage).setItem(ACCESS_TOKEN_KEY, token);
    }
  } catch {
    // 저장소 접근이 막힌 환경에서는 토큰 없이 진행
  }
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  timeout: 10_000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    if (isAxiosError<Partial<ApiResponse<unknown>>>(error)) {
      const body = error.response?.data;
      return Promise.reject(
        new ApiError(
          body?.message ?? error.message,
          error.response?.status ?? null,
          body?.code ?? null
        )
      );
    }
    return Promise.reject(error);
  }
);

/** ApiResponse 를 벗겨 data 만 반환한다. success=false 면 ApiError. */
export const unwrap = <T>(body: ApiResponse<T>): T => {
  if (!body.success) throw new ApiError(body.message, null, body.code);
  return body.data;
};
