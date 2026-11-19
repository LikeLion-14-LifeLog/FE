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
  /** 1차 직업 기준 2차 이동 비율 (%) — 패널 메인 수치 */
  share: number;
  /** 막대 아래 보조 설명 */
  caption: string;
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
