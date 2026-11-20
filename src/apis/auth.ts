import { apiClient, unwrap, type ApiResponse } from "@/apis/client";
import { getAccessToken } from "@/store/authStore";
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from "@/types/auth";

/** 이메일 회원가입 */
export async function signup(body: SignupRequest): Promise<SignupResponse> {
  const { data } = await apiClient.post<ApiResponse<SignupResponse>>(
    "/api/auth/signup",
    body,
  );
  return unwrap(data);
}

/** 이메일 로그인 — Access Token 발급 */
export async function login(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    "/api/auth/login",
    body,
  );
  return unwrap(data);
}

/** GET /api/auth/email/check 응답 data */
export type EmailCheckResult = {
  email: string;
  /** false 면 이미 가입된 이메일 */
  available: boolean;
};

/**
 * 이메일 중복 확인 (비로그인 가능). 형식 오류·누락이면 400 (toApiError 로 확인).
 * 명세 예시는 공통 포맷(success·code) 대신 status·message 를 쓰고 있어,
 * success 가 명시적으로 false 일 때만 실패로 본다.
 */
export async function checkEmailAvailable(
  email: string,
  signal?: AbortSignal,
): Promise<EmailCheckResult> {
  const { data } = await apiClient.get<Partial<ApiResponse<EmailCheckResult>>>(
    "/api/auth/email/check",
    { params: { email }, signal },
  );
  if (data.success === false || !data.data)
    throw new Error(data.message ?? "이메일 중복 확인에 실패했습니다.");
  return data.data;
}

/**
 * 서버 로그아웃 (토큰 무효화). 비로그인이면 호출하지 않는다.
 * 호출 직후 로컬 세션을 지워도 되도록 토큰을 미리 꺼내 헤더에 직접 싣는다.
 */
export async function requestLogout(): Promise<void> {
  const token = getAccessToken();
  if (!token) return;
  await apiClient.post("/api/auth/logout", null, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
