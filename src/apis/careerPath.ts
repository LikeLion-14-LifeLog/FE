import { apiClient, toApiError } from "@/apis/client";
import type { ApiResponse } from "@/types/spec/api";
import type {
  CareerGraphData,
  CareerPathCandidatesData,
  CareerPathDetail,
  CareerPathDetailResult,
  CareerRouteDetailData,
  CareerRoutesData,
  YearlyCodePoint,
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
 * 연도별 직업코드 변화 경로 상세 (출발→도착 한 쌍).
 * 관측되지 않은 쌍이면 route 가 null, 숫자가 아닌 코드는 서버가 500 을 준다.
 */
export async function getCareerRouteDetail(
  source: string,
  target: string,
  options: { signal?: AbortSignal } = {},
): Promise<CareerRouteDetailData> {
  const { data } = await apiClient.get<ApiResponse<CareerRouteDetailData>>(
    `/api/v1/career-paths/yearly/routes/${encodeURIComponent(source)}/${encodeURIComponent(target)}`,
    { signal: options.signal },
  );
  if (!data.success || !data.data)
    throw new Error(data.message ?? "직업 이동 경로 상세를 불러오지 못했습니다.");
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

const CAREER_PATH_NOT_FOUND = "CAREER_PATH_NOT_FOUND";

/**
 * 커리어 경로 상세 조회. pathId 는 getCareerPathCandidates 의 paths[].id.
 * 없는 경로면 404 CAREER_PATH_NOT_FOUND → { status: "not-found" } 로 돌려주고, 그 외 오류는 throw 한다.
 * 탐색적 관측 결과이므로 화면에서 실제 첫 이직 경로로 표현하지 않는다.
 */
export async function getCareerPathDetail(
  pathId: string,
  options: { signal?: AbortSignal } = {},
): Promise<CareerPathDetailResult> {
  try {
    const { data } = await apiClient.get<ApiResponse<CareerPathDetail>>(
      `/api/v1/career-paths/${encodeURIComponent(pathId)}`,
      { signal: options.signal },
    );
    if (!data.success || !data.data)
      throw new Error(data.message ?? "커리어 경로 상세를 불러오지 못했습니다.");
    return { status: "found", data: data.data };
  } catch (error) {
    const { status, code, message } = toApiError(error);
    if (status === 404 || code === CAREER_PATH_NOT_FOUND) {
      return {
        status: "not-found",
        message: message ?? "해당 커리어 경로를 찾을 수 없습니다.",
      };
    }
    throw error;
  }
}

/**
 * 응답자별 연도별 직업코드 이력 원문 조회 — ["2023:2141 -> 2024:5317", ...].
 * 다른 API와 달리 공통 응답({ success, data })으로 감싸지 않은 배열이 온다 (약 200KB, 4,600여 건).
 * 명세의 요청 본문({ pathId })은 GET 이라 보낼 수 없고 서버도 쓰지 않아 생략한다.
 * 실제 이직·승진·첫 이직이 아니며, 시각화에는 getCareerGraph 가 더 적합하다.
 */
export async function getYearlyCodeHistories(
  options: { signal?: AbortSignal } = {},
): Promise<YearlyCodePoint[][]> {
  const { data } = await apiClient.get<string[]>(
    "/api/v1/career-paths/yearly",
    { signal: options.signal, timeout: 30_000 },
  );
  if (!Array.isArray(data))
    throw new Error("응답자별 직업코드 이력을 불러오지 못했습니다.");
  return data.map(parseYearlyCodeHistory).filter((points) => points.length > 0);
}

/** "2023:2141 -> 2024:5317" → [{ year: 2023, code: "2141" }, { year: 2024, code: "5317" }] (형식이 다른 조각은 버림) */
export function parseYearlyCodeHistory(history: string): YearlyCodePoint[] {
  return history
    .split("->")
    .map((part) => part.trim().match(/^(\d{4}):(\w+)$/))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map(([, year, code]) => ({ year: Number(year), code }));
}
