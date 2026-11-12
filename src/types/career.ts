/** 커리어 경로 지도 — 1차 첫 취업 진입군 노드 */
export type FirstJobNode = {
  id: string;
  title: string;
  /** 초봉 (만 원) */
  salary: number;
  /** 진입 비중 (%) */
  share: number;
  /** 진입 인원 (명) */
  entrants: number;
  /** 인원 옆 보조 설명 (예: "시스템 운영") */
  note: string;
};

/** 커리어 경로 지도 — 2차 이직/성장 궤적 노드 */
export type NextStepNode = {
  id: string;
  /** 출발한 1차 노드 id */
  parentId: string;
  title: string;
  /** 도달 연봉 (만 원) */
  salary: number;
  /** jump: 이직(강조 카드), stay: 근속·승진(작은 카드) */
  variant: "jump" | "stay";
  /** stay 카드 연봉 옆 괄호 설명 (예: "근속 38%") */
  note?: string;
  /** jump 카드 우측 상단 라벨 (예: "최대 상승 구간") */
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
  startSalary: number;
  targetSalary: number;
  rows: RouteSummaryRow[];
};

export type CareerMapData = {
  conditions: string[];
  start: CareerStartCondition;
  firstJobs: FirstJobNode[];
  nextSteps: NextStepNode[];
  summaries: Record<string, RouteSummary>;
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
