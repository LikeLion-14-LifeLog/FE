import { apiClient } from "@/apis/client";
import type { ApiResponse } from "@/types/spec/api";
import type {
  CareerGraphData,
  CareerPathCandidatesData,
  CareerRoutesData,
  CareerSalaryAnalyticsData,
  CareerSalaryFilters,
} from "@/types/careerRoute";

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

/**
 * 직업 이동 경로별 연봉 통계 조회 (로그인 필요 — 비로그인이면 401).
 * 필터 이름(fromCode·toCode·majorField)은 응답의 filters 기준이며 컨트롤러 확인 전이다.
 * 비어 있는 필터는 보내지 않는다.
 */
export async function getCareerSalaryAnalytics(
  options: CareerSalaryFilters & { signal?: AbortSignal } = {},
): Promise<CareerSalaryAnalyticsData> {
  const { signal, ...filters } = options;
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value),
  );
  const { data } = await apiClient.get<ApiResponse<CareerSalaryAnalyticsData>>(
    "/api/v1/career-paths/yearly/salary-analytics",
    { params, signal },
  );
  if (!data.success || !data.data)
    throw new Error(data.message ?? "경로별 연봉 통계를 불러오지 못했습니다.");
  return data.data;
}

/**
 * 연도별 커리어 경로 그래프 조회 (직업코드 노드 + 연도 구간별 변화 엣지).
 * fromCode(4자리 직업코드)를 생략하면 전체 그래프(수백 KB)라 가급적 지정해서 부른다.
 */
export async function getCareerGraph(
  options: { fromCode?: string; signal?: AbortSignal } = {},
): Promise<CareerGraphData> {
  const { fromCode, signal } = options;
  const { data } = await apiClient.get<ApiResponse<CareerGraphData>>(
    "/api/v1/career-paths/yearly/graph",
    { params: fromCode ? { fromCode } : undefined, signal },
  );
  if (!data.success || !data.data)
    throw new Error(data.message ?? "연도별 커리어 경로 그래프를 불러오지 못했습니다.");
  return data.data;
}

/** 검증 전 탐색 데이터 상태 — 이 상태의 paths 는 공식 커리어 지도에 노출하지 않는다 */
export const EXPLORATORY_NOT_VERIFIED = "EXPLORATORY_NOT_VERIFIED";

/**
 * 커리어 경로(직업코드 변화 후보) 목록 조회.
 * 쿼리 파라미터는 명세 미확정(major·targetJob 을 보내도 filters 가 null 로 돌아옴)이라 받지 않는다.
 * 현재 paths 는 항상 빈 배열이며, 경로 시각화는 getCareerRoutes / getCareerGraph 를 쓴다.
 */
export async function getCareerPathCandidates(
  options: { signal?: AbortSignal } = {},
): Promise<CareerPathCandidatesData> {
  const { data } = await apiClient.get<ApiResponse<CareerPathCandidatesData>>(
    "/api/v1/career-paths",
    { signal: options.signal },
  );
  if (!data.success || !data.data)
    throw new Error(data.message ?? "커리어 경로 목록을 불러오지 못했습니다.");
  return data.data;
}

/** 검증된 상태이고 경로가 있을 때만 화면에 노출 가능 */
export const isPublishableCareerPaths = (data: CareerPathCandidatesData) =>
  data.dataStatus !== EXPLORATORY_NOT_VERIFIED && data.paths.length > 0;
