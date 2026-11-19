import type {
  CareerRouteDetail,
  RouteSalary,
  TimingDistribution,
} from "@/types/career";
import type { CareerGraphEdge, CareerRouteDetailData } from "@/types/careerRoute";
import { formatManwonDiff } from "@/utils/careerRouteTree";

export const CAREER_DATA_SOURCE = "출처: 한국고용정보원 청년패널조사(KEEPⅡ)";

/** 상세 페이지 경로 id — 지도 화면의 2차 경로 id 와 같은 "출발코드-도착코드" */
export const parseRouteId = (routeId: string) => {
  const match = routeId.match(/^(\d{4})-(\d{4})$/);
  return match ? { source: match[1], target: match[2] } : null;
};

const EMPTY = "-";
const toManwon = (krw: number) =>
  Math.round(krw / 10_000).toLocaleString("ko-KR");

/** 관측 연도 간격(년)별 응답자 비율 — 1년 / 2년 / 3년 이상 */
function buildGapDistribution(intervals: CareerGraphEdge[]): TimingDistribution[] {
  const buckets = [
    { label: "1년 간격", count: 0 },
    { label: "2년 간격", count: 0 },
    { label: "3년 이상 간격", count: 0 },
  ];
  for (const { fromYear, toYear, distinctRespondents } of intervals) {
    const gap = toYear - fromYear;
    buckets[Math.min(Math.max(gap, 1), 3) - 1].count += distinctRespondents;
  }
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  if (total === 0) return [];

  const max = Math.max(...buckets.map((b) => b.count));
  const topIndex = buckets.findIndex((b) => b.count === max);
  return buckets.map(({ label, count }, i) => ({
    label: i === topIndex ? `${label} (최다 집중 구간)` : label,
    percent: Math.round((count / total) * 100),
    highlight: i === topIndex,
  }));
}

/** 연도 구간을 응답자 수로 가중한 평균 관측 연도 간격 */
function meanGap(intervals: CareerGraphEdge[]) {
  const total = intervals.reduce((sum, e) => sum + e.distinctRespondents, 0);
  if (total === 0) return null;
  return (
    intervals.reduce(
      (sum, e) => sum + (e.toYear - e.fromYear) * e.distinctRespondents,
      0,
    ) / total
  );
}

/**
 * 경로 상세 API + 연봉 분석 결과를 상세 화면 구조로 바꾼다.
 * 받을 수 없는 값(요건·추천 경험·상위 25% 연봉 차이)은 비워 둔다.
 */
export function buildCareerRouteDetail(
  data: CareerRouteDetailData,
  salary: RouteSalary | undefined,
): CareerRouteDetail | null {
  const { route, yearlyIntervals } = data;
  if (!route) return null;

  const timing = buildGapDistribution(yearlyIntervals);
  const top = timing.find((t) => t.highlight);
  const gap = meanGap(yearlyIntervals);
  const risePercent = salary
    ? Math.round((salary.meanDifference / salary.meanFrom) * 100)
    : null;

  return {
    title: `${route.sourceName} ➔ ${route.targetName}`,
    stats: [
      {
        label: "이동 전 평균 연봉",
        value: salary ? toManwon(salary.meanFrom) : EMPTY,
        unit: "만 원",
        caption: `${route.sourceName} 기준`,
      },
      {
        label: "평균 이동 간격",
        value: gap === null ? EMPTY : `평균 ${gap.toFixed(1)}`,
        unit: "년",
        caption: top
          ? `${top.label.replace(" (최다 집중 구간)", "")} 비중 ${top.percent}%`
          : EMPTY,
      },
      {
        label: "이동 후 평균 연봉",
        value: salary ? toManwon(salary.meanTo) : EMPTY,
        unit: "만 원",
        caption:
          salary && risePercent !== null
            ? `이동 전 대비 ${formatManwonDiff(salary.meanDifference)} 원 (약 ${risePercent >= 0 ? "+" : ""}${risePercent}%)`
            : EMPTY,
        highlight: true,
      },
    ],
    // 요건·추천 경험은 제공 API가 없어 비워 둔다
    matchedRequirements: [],
    recommendedExperiences: [],
    timing,
    raises: [
      {
        label: "평균 연봉 차이",
        value: salary ? `${formatManwonDiff(salary.meanDifference)} 원` : EMPTY,
      },
      { label: "상위 25% 연봉 차이", value: EMPTY },
    ],
    source: CAREER_DATA_SOURCE,
  };
}
