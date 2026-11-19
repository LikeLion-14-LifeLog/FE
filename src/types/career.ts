/** 경로(출발→도착) 연봉 통계 — 공개 그룹을 관측 구간 수로 가중 평균 (원) */
export type RouteSalary = {
  segmentCount: number;
  meanFrom: number;
  meanTo: number;
  meanDifference: number;
  /** 중앙값은 그룹 하나일 때만 (여러 그룹을 합치면 계산 불가) */
  medianFrom: number | null;
  medianTo: number | null;
  /** 상위 25% 연봉 차이 — 표본이 P75 기준에 못 미치면 null */
  p75Difference: number | null;
  /** 평균 관측 연도 간격 (년) */
  meanYearGap: number;
};

/** 경로 지도 노드 공통 — 직업 이동 경로 API(routes) 한 건에서 만든다 */
type CareerRouteNodeBase = {
  id: string;
  /** 도착 직업코드 */
  code: string;
  /** 도착 직업명 */
  title: string;
  /** 출발 직업 기준 이동 비율 (%) — 실제 이직 확률 아님 */
  share: number;
  /** 관측 구간 수 */
  observedSegments: number;
  /** 관측 연도 구간 수 */
  observedYearIntervals: number;
  /** 이 노드로 들어오는 경로의 연봉 통계 (비로그인·비공개 그룹이면 없음) */
  salary?: RouteSalary;
};

/** 커리어 경로 지도 — 1차 이동 직업 노드 */
export type FirstJobNode = CareerRouteNodeBase;

/** 커리어 경로 지도 — 2차 이동 직업 노드 */
export type NextStepNode = CareerRouteNodeBase & {
  /** 출발한 1차 노드 id */
  parentId: string;
  /** jump: 부모 기준 최다 이동(강조 카드), stay: 그 외(작은 카드) */
  variant: "jump" | "stay";
  /** jump 카드 우측 상단 라벨 (예: "최다 이동") */
  badge?: string;
};

export type CareerStartCondition = {
  label: string;
  title: string;
  description: string;
};

export type RouteSummaryRow = {
  label: string;
  value: string;
  tone?: "default" | "brand" | "brandStrong";
};

/** 우측 패널 — 선택한 이동 경로 요약 */
export type RouteSummary = {
  title: string;
  /** 2차 이동 구간(1차 직업 → 2차 직업) 연봉 통계 — 없으면 연봉 칸을 비워 둔다 */
  salary?: RouteSalary;
  rows: RouteSummaryRow[];
};

export type DetailStat = {
  label: string;
  value: string;
  unit: string;
  caption: string;
  highlight?: boolean;
};

export type TimingDistribution = {
  label: string;
  percent: number;
  highlight?: boolean;
};

/** 이동 경로 상세 분석 */
export type CareerRouteDetail = {
  title: string;
  stats: DetailStat[];
  matchedRequirements: string[];
  recommendedExperiences: string[];
  timing: TimingDistribution[];
  raises: { label: string; value: string }[];
  source: string;
};
