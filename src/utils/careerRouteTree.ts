import type {
  CareerStartCondition,
  FirstJobNode,
  NextStepNode,
  RouteSummary,
} from "@/types/career";
import type { CareerRoute } from "@/types/careerRoute";

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
  }));

  const nextSteps: NextStepNode[] = [];
  const summaries: Record<string, RouteSummary> = {};

  for (const first of firstRoutes) {
    const children = (bySource.get(first.target) ?? [])
      .filter((r) => r.target !== rootCode && r.target !== first.target)
      .slice(0, MAX_NEXT_STEPS_PER_JOB);

    children.forEach((second, k) => {
      const id = `${first.target}-${second.target}`;
      nextSteps.push({
        id,
        parentId: first.target,
        code: second.target,
        title: second.targetName,
        share: second.shareOfSourceSegmentsPercent,
        observedSegments: second.observedSegments,
        observedYearIntervals: second.observedYearIntervals,
        variant: k === 0 ? "jump" : "stay",
        badge: k === 0 ? "최다 이동" : undefined,
      });

      summaries[id] = {
        title: `${first.targetName} ➔ ${second.targetName}`,
        share: second.shareOfSourceSegmentsPercent,
        caption: `${first.targetName} 출발 관측 구간 중 비율`,
        rows: [
          {
            label: "전체 경로",
            value: `${rootName} ➔ ${first.targetName} ➔ ${second.targetName}`,
          },
          {
            label: `1차 이동 비율 (${rootName} 출발)`,
            value: formatPercent(first.shareOfSourceSegmentsPercent),
            tone: "brand",
          },
          {
            label: `2차 이동 비율 (${first.targetName} 출발)`,
            value: formatPercent(second.shareOfSourceSegmentsPercent),
            tone: "brandStrong",
          },
          {
            label: "관측 구간 수 (1차 / 2차)",
            value: `${first.observedSegments} / ${second.observedSegments}구간`,
          },
          {
            label: "관측 연도 구간 (1차 / 2차)",
            value: `${first.observedYearIntervals} / ${second.observedYearIntervals}개`,
          },
        ],
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
