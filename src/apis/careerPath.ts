import { apiClient } from "@/apis/client";
import type { ApiResponse } from "@/types/spec/api";
import type { CareerRoutesData } from "@/types/careerRoute";

/**
 * 직업코드별 관측 이동 경로 조회.
 * fromCode 를 넘기면 해당 출발 직업의 경로만 내려온다 (명세 외, 서버 응답의 fromCode 필드로 확인).
 */
export async function getCareerRoutes(
  options: { fromCode?: string; signal?: AbortSignal } = {},
): Promise<CareerRoutesData> {
  const { fromCode, signal } = options;
  const { data } = await apiClient.get<ApiResponse<CareerRoutesData>>(
    "/api/v1/career-paths/yearly/routes",
    { params: fromCode ? { fromCode } : undefined, signal },
  );
  if (!data.success || !data.data)
    throw new Error(data.message ?? "직업 이동 경로를 불러오지 못했습니다.");
  return data.data;
}
