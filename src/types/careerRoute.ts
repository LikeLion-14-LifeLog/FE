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
