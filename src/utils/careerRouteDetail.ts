import type {
  CareerRouteDetail,
  RouteSalary,
  TimingDistribution,
} from "@/types/career";
import type {
  CareerGraphEdge,
  CareerRouteDetailData,
  CareerSpecItem,
  CareerSpecResult,
} from "@/types/careerRoute";
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

const LANGUAGE_EXAM_NAMES: Record<string, string> = {
  TOEIC: "TOEIC",
  OPIC: "OPIc",
  TOEIC_SPEAKING: "TOEIC Speaking",
  TOEIC_WRITING: "TOEIC Writing",
  TOEFL: "TOEFL",
  TEPS: "TEPS",
  IELTS: "IELTS",
};

/** 스펙 항목 → "어학시험 TOEIC" / "공학계열 전공" / "국가기술자격증" */
function specLabel({ type, code, name }: CareerSpecItem) {
  if (type === "LANGUAGE_EXAM") return `어학시험 ${LANGUAGE_EXAM_NAMES[code] ?? name}`;
  if (type === "MAJOR_FIELD") return `${name} 전공`;
  return name;
}

/** 스펙 비교 결과를 목록 문구로 (표본 부족·미제공이면 빈 배열) */
const toSpecLines = (
  result: CareerSpecResult | null | undefined,
  scope: string,
  filter: (item: CareerSpecItem) => boolean = () => true,
) =>
  (result?.items ?? [])
    .filter(filter)
    .map((item) => `${specLabel(item)} · ${scope} ${item.sharePercent}%`);

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

/** 개인화 상세 분석의 스펙 비교 (비로그인·실패 시 없음) */
export type CareerRouteSpecs = {
  requirements?: CareerSpecResult | null;
  recommendations?: CareerSpecResult | null;
};

/**
 * 경로 상세 API + 연봉 분석 + (로그인 시) 스펙 비교 결과를 상세 화면 구조로 바꾼다.
 * 표본 부족으로 비어 있는 값은 "-" 또는 빈 목록으로 둔다.
 */
export function buildCareerRouteDetail(
  data: CareerRouteDetailData,
  salary: RouteSalary | undefined,
  specs: CareerRouteSpecs | undefined,
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
        caption:
          salary?.medianFrom != null
            ? `중앙값 ${toManwon(salary.medianFrom)}만 원`
            : `${route.sourceName} 기준`,
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
    // 도착 직업 응답자 스펙 중 내 현재 스펙과 같은 것 / 이 경로 출발 시점 스펙 중 내가 없는 것
    matchedRequirements: toSpecLines(
      specs?.requirements,
      "도착 직업 응답자",
      (item) => item.matched,
    ),
    recommendedExperiences: toSpecLines(specs?.recommendations, "이 경로 응답자"),
    timing,
    raises: [
      {
        label: "평균 연봉 차이",
        value: salary ? `${formatManwonDiff(salary.meanDifference)} 원` : EMPTY,
      },
      {
        label: "상위 25% 연봉 차이",
        value:
          salary?.p75Difference != null
            ? `${formatManwonDiff(salary.p75Difference)} 원`
            : EMPTY,
      },
    ],
    source: CAREER_DATA_SOURCE,
  };
}
