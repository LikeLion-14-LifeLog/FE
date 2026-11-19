/** GET /api/v1/career-paths/yearly/routes — 직업코드별 관측 이동 경로 */
export type CareerRoute = {
  /** 출발 직업코드 */
  source: string;
  sourceName: string;
  /** 도착 직업코드 */
  target: string;
  targetName: string;
  /** 해당 직업 이동이 관측된 구간 수 */
  observedSegments: number;
  /** 해당 경로가 관측된 연도 구간 수 */
  observedYearIntervals: number;
  /**
   * 출발 직업의 전체 관측 이동 구간 중 해당 경로 비율 (%).
   * 실제 이직 확률이 아니라 관측된 직업코드 변경 구간의 비율.
   */
  shareOfSourceSegmentsPercent: number;
};

export type CareerRoutesData = {
  dataStatus: string;
  verifiedFirstJobChange: boolean;
  /** 직업명 기준 분류표 연도 */
  jobNameReferenceYear: number;
  /** 서버가 내려주는 데이터 해석 주의 문구 (명세 외 필드) */
  notice?: string;
  /** fromCode 로 조회했을 때 그 값 (전체 조회면 "") */
  fromCode?: string;
  minSegments: number;
  respondentCountInYearlyDataset: number;
  allObservedSegments: number;
  returnedRouteCount: number;
  routes: CareerRoute[];
};

/** 전공 계열 코드 */
export type MajorField =
  | "HUMANITIES"
  | "SOCIAL_SCIENCES"
  | "NATURAL_SCIENCES"
  | "ENGINEERING"
  | "MEDICINE_PHARMACY"
  | "EDUCATION"
  | "ARTS_PHYSICAL_EDUCATION"
  | "UNKNOWN";

/**
 * GET /api/v1/career-paths/yearly/salary-analytics — 경로(출발→도착)·전공 계열별 연봉 통계.
 * 연봉은 관측 연도에 보고된 연봉이며 실제 이직 전후 연봉이나 초봉이 아니다.
 */
export type CareerSalaryGroup = {
  source: string;
  target: string;
  majorField: MajorField;
  /** 분석에 포함된 관측 구간 수 */
  segmentCount: number;
  /** 출발 관측 연도 평균 연봉 (원) */
  meanFromSalaryKrw: number;
  /** 도착 관측 연도 평균 연봉 (원) */
  meanToSalaryKrw: number;
  medianFromSalaryKrw: number;
  medianToSalaryKrw: number;
  /** 평균 연봉 차이 (원) */
  meanSalaryDifferenceKrw: number;
  /** 평균 관측 연도 간격 (년) */
  meanObservedYearGap: number;
};

export type CareerSalaryFilters = {
  fromCode?: string;
  toCode?: string;
  majorField?: MajorField;
};

export type CareerSalaryAnalyticsData = {
  metadata: {
    source: string;
    metric: string;
    salaryUnit: string;
    /** 이 값보다 작은 그룹은 비공개 */
    minimumGroupSize: number;
    respondentCount: number;
    totalObservedChangedSegments: number;
    releasedGroupCount: number;
    suppressedSmallGroups: number;
    majorFieldUnknown: string;
  };
  filters: { fromCode: string; toCode: string; majorField: string };
  matchingGroupCount: number;
  groups: CareerSalaryGroup[];
};

/** GET /api/v1/career-paths/yearly/graph — 직업코드 노드 */
export type CareerGraphNode = {
  id: string;
  code: string;
  /** 화면 표시용 직업명 (분류표에 없으면 "직업코드 0000") */
  label: string;
};

/** 연도 구간별 관측 직업코드 변화 (실제 이직·승진 아님) */
export type CareerGraphEdge = {
  /** "출발|도착|fromYear|toYear" */
  id: string;
  source: string;
  target: string;
  fromYear: number;
  toYear: number;
  /** 해당 코드·연도 조합의 중복 제거 응답자 수 */
  distinctRespondents: number;
  verifiedFirstJobChange: boolean;
};

export type CareerGraphData = {
  dataStatus: string;
  notice: string;
  classification: string;
  jobNameReferenceYear: number;
  verifiedFirstJobChange: boolean;
  respondentCount: number;
  filters: { fromCode: string };
  nodes: CareerGraphNode[];
  edges: CareerGraphEdge[];
  nodeCount: number;
  edgeCount: number;
};

/**
 * GET /api/v1/career-paths — 직업코드 변화 후보 경로 (탐색적 집계, 첫 취업·첫 이직 검증 안 됨).
 * paths 항목 구조는 아직 정의되지 않아 unknown 으로 둔다 (현재 항상 빈 배열).
 */
export type CareerPathCandidatesData = {
  title: string;
  /** 현재 "EXPLORATORY_NOT_VERIFIED" — 검증된 커리어 경로로 표현 금지 */
  dataStatus: string;
  notice: string;
  filters: {
    major: string | null;
    targetJob: string | null;
    observationYears: string;
  };
  paths: unknown[];
  auditSummary: {
    source: string;
    rawJobObservations: number;
    distinctRespondents: number;
    candidateObservationPairs: number;
    distinctOccupationCodePairs: number;
    publishedPathsAtMinCell5: number;
    minimumCellSize: number;
    interpretation: string;
  };
};
