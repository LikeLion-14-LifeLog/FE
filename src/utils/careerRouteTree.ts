import type {
  CareerStartCondition,
  FirstJobNode,
  NextStepNode,
  RouteSalary,
  RouteSummary,
  RouteSummaryRow,
} from "@/types/career";
import type {
  CareerRoute,
  CareerSalaryGroup,
  MajorField,
} from "@/types/careerRoute";

/** 그래프 레이아웃(951 × 560)에 맞춘 노드 수 상한 */
export const MAX_FIRST_JOBS = 3;
export const MAX_NEXT_STEPS_PER_JOB = 2;

export type CareerRouteTree = {
  start: CareerStartCondition;
  firstJobs: FirstJobNode[];
  nextSteps: NextStepNode[];
  summaries: Record<string, RouteSummary>;
};

const byShareDesc = (a: CareerRoute, b: CareerRoute) =>
  b.shareOfSourceSegmentsPercent - a.shareOfSourceSegmentsPercent ||
  b.observedSegments - a.observedSegments;

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

/** 원 → "3,808만 원" */
export const formatManwon = (krw: number) =>
  `${Math.round(krw / 10_000).toLocaleString("ko-KR")}만 원`;

/** 원 → "+309만" / "-120만" */
export const formatManwonDiff = (krw: number) => {
  const manwon = Math.round(krw / 10_000);
  return `${manwon >= 0 ? "+" : ""}${manwon.toLocaleString("ko-KR")}만`;
};

export const routeKey = (source: string, target: string) =>
  `${source}-${target}`;

/**
 * 연봉 그룹(출발·도착·전공 계열)을 경로(출발·도착)별로 합친다.
 * majorField 를 주면 그 계열만, 없으면 공개된 모든 계열을 관측 구간 수로 가중 평균한다.
 */
export function aggregateSalaryGroups(
  groups: CareerSalaryGroup[],
  majorField: MajorField | null = null,
) {
  const byRoute = new Map<string, CareerSalaryGroup[]>();
  for (const group of groups) {
    if (majorField && group.majorField !== majorField) continue;
    const key = routeKey(group.source, group.target);
    const list = byRoute.get(key);
    if (list) list.push(group);
    else byRoute.set(key, [group]);
  }

  const result = new Map<string, RouteSalary>();
  for (const [key, list] of byRoute) {
    const total = list.reduce((sum, g) => sum + g.segmentCount, 0);
    if (total === 0) continue;
    const weighted = (pick: (g: CareerSalaryGroup) => number) =>
      list.reduce((sum, g) => sum + pick(g) * g.segmentCount, 0) / total;
    const single = list.length === 1 ? list[0] : null;
    result.set(key, {
      segmentCount: total,
      meanFrom: weighted((g) => g.meanFromSalaryKrw),
      meanTo: weighted((g) => g.meanToSalaryKrw),
      meanDifference: weighted((g) => g.meanSalaryDifferenceKrw),
      medianFrom: single?.medianFromSalaryKrw ?? null,
      medianTo: single?.medianToSalaryKrw ?? null,
      meanYearGap: weighted((g) => g.meanObservedYearGap),
    });
  }
  return result;
}

/** 출발 직업코드별 경로 묶음 (비율 내림차순) */
export function groupRoutesBySource(routes: CareerRoute[]) {
  const map = new Map<string, CareerRoute[]>();
  for (const route of routes) {
    const list = map.get(route.source);
    if (list) list.push(route);
    else map.set(route.source, [route]);
  }
  for (const list of map.values()) list.sort(byShareDesc);
  return map;
}

/** 출발 직업으로 고를 수 있는 직업 목록 (경로가 많은 순) */
export function getSourceOptions(routes: CareerRoute[]) {
  return [...groupRoutesBySource(routes).values()]
    .map((list) => ({
      code: list[0].source,
      name: list[0].sourceName,
      routeCount: list.length,
      segments: list.reduce((sum, r) => sum + r.observedSegments, 0),
    }))
    .sort((a, b) => b.segments - a.segments || a.name.localeCompare(b.name));
}

/**
 * 출발 직업 → 1차 이동 직업 → 2차 이동 직업의 2단계 트리를 만든다.
 * 같은 경로 위에서 이미 지나온 직업으로 돌아가는 이동(예: A→B→A)은 제외한다.
 */
export function buildCareerRouteTree(
  routes: CareerRoute[],
  rootCode: string,
  salaries: Map<string, RouteSalary> = new Map(),
): CareerRouteTree | null {
  const bySource = groupRoutesBySource(routes);
  const rootRoutes = bySource.get(rootCode);
  if (!rootRoutes?.length) return null;

  const rootName = rootRoutes[0].sourceName;
  const firstRoutes = rootRoutes
    .filter((r) => r.target !== rootCode)
    .slice(0, MAX_FIRST_JOBS);

  const firstJobs: FirstJobNode[] = firstRoutes.map((r) => ({
    id: r.target,
    code: r.target,
    title: r.targetName,
    share: r.shareOfSourceSegmentsPercent,
    observedSegments: r.observedSegments,
    observedYearIntervals: r.observedYearIntervals,
    salary: salaries.get(routeKey(r.source, r.target)),
  }));

  const nextSteps: NextStepNode[] = [];
  const summaries: Record<string, RouteSummary> = {};

  for (const first of firstRoutes) {
    const children = (bySource.get(first.target) ?? [])
      .filter((r) => r.target !== rootCode && r.target !== first.target)
      .slice(0, MAX_NEXT_STEPS_PER_JOB);

    children.forEach((second, k) => {
      const id = routeKey(first.target, second.target);
      const salary = salaries.get(id);
      nextSteps.push({
        id,
        parentId: first.target,
        code: second.target,
        title: second.targetName,
        share: second.shareOfSourceSegmentsPercent,
        observedSegments: second.observedSegments,
        observedYearIntervals: second.observedYearIntervals,
        salary,
        variant: k === 0 ? "jump" : "stay",
        badge: k === 0 ? "최다 이동" : undefined,
      });

      summaries[id] = {
        title: `${first.targetName} ➔ ${second.targetName}`,
        share: second.shareOfSourceSegmentsPercent,
        caption: `${first.targetName} 출발 관측 구간 중 비율`,
        salary,
        rows: buildSummaryRows(rootName, first, second, salary),
      };
    });
  }

  return {
    start: {
      label: "출발 직업",
      title: rootName,
      description: `직업코드 ${rootCode} · 이동 경로 ${rootRoutes.length}개`,
    },
    firstJobs,
    nextSteps,
    summaries,
  };
}

function buildSummaryRows(
  rootName: string,
  first: CareerRoute,
  second: CareerRoute,
  salary: RouteSalary | undefined,
): RouteSummaryRow[] {
  const path = {
    label: "전체 경로",
    value: `${rootName} ➔ ${first.targetName} ➔ ${second.targetName}`,
  };
  const shares: RouteSummaryRow = {
    label: "이동 비율 (1차 / 2차)",
    value: `${formatPercent(first.shareOfSourceSegmentsPercent)} / ${formatPercent(second.shareOfSourceSegmentsPercent)}`,
    tone: "brandStrong",
  };

  if (!salary) {
    return [
      path,
      shares,
      {
        label: "관측 구간 수 (1차 / 2차)",
        value: `${first.observedSegments} / ${second.observedSegments}구간`,
      },
      {
        label: "관측 연도 구간 (1차 / 2차)",
        value: `${first.observedYearIntervals} / ${second.observedYearIntervals}개`,
      },
    ];
  }

  const median =
    salary.medianFrom !== null && salary.medianTo !== null
      ? `${formatManwon(salary.medianFrom)} → ${formatManwon(salary.medianTo)}`
      : "-";

  return [
    path,
    shares,
    {
      label: "평균 연봉 차이",
      value: `${formatManwonDiff(salary.meanDifference)} 원`,
      tone: "brand",
    },
    { label: "연봉 중앙값 (출발 → 도착)", value: median },
    {
      label: "평균 관측 연도 간격",
      value: `${salary.meanYearGap.toFixed(1)}년`,
    },
    { label: "연봉 분석 구간 수", value: `${salary.segmentCount}구간` },
  ];
}
