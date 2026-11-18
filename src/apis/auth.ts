import { apiClient } from "@/apis/client";
import type { ApiResponse } from "@/types/spec/api";
import type { SignupRequest, SignupResponse } from "@/types/auth";

/** 이메일 회원가입 */
export async function signup(body: SignupRequest): Promise<SignupResponse> {
  const { data } = await apiClient.post<ApiResponse<SignupResponse>>(
    "/api/auth/signup",
    body,
  );
  return data.data;
}
