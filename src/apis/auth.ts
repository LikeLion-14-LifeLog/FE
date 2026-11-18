import { apiClient } from "@/apis/client";
import type { ApiResponse } from "@/types/spec/api";
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
  return data.data;
}

/** 이메일 로그인 — Access Token 발급 */
export async function login(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    "/api/auth/login",
    body,
  );
  return data.data;
}
