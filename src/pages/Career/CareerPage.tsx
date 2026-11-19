import { useEffect, useMemo, useRef, useState } from "react";
import {
  getCareerGraph,
  getCareerRoutes,
  getCareerSalaryAnalytics,
} from "@/apis/careerPath";
import { toApiError } from "@/apis/client";
import FilterDropdown from "@/pages/JobChance/components/FilterDropdown";
import { MAJOR_FIELDS, MAJOR_FIELD_LABEL } from "@/constants/majorField";
import { useCurrentUser } from "@/store/authStore";
import type {
  CareerGraphEdge,
  CareerRoutesData,
  CareerSalaryGroup,
  MajorField,
} from "@/types/careerRoute";
import {
  aggregateSalaryGroups,
  buildCareerRouteTree,
  getSourceOptions,
  getYearlyObservations,
} from "@/utils/careerRouteTree";
import CareerPathGraph from "./components/CareerPathGraph";
import ConditionChip from "./components/ConditionChip";
import RouteSummaryPanel from "./components/RouteSummaryPanel";
import type { YearlyObservationColumn } from "./components/YearlyObservationList";

const COLUMN_TITLE =
  "text-[12.5px] leading-[18.75px] font-extrabold text-slate-600";

/** 처음 보여줄 출발 직업 (응용 소프트웨어 개발자). 데이터에 없으면 경로가 가장 많은 직업 */
const DEFAULT_ROOT_CODE = "1332";

const DEFAULT_NOTICE =
  "이동 비율은 실제 이직 확률이 아니라 관측된 직업코드 변경 구간의 비율입니다.";

const ALL_MAJORS = "ALL";
type MajorFilter = MajorField | typeof ALL_MAJORS;
const MAJOR_OPTIONS: { value: MajorFilter; label: string }[] = [
  { value: ALL_MAJORS, label: "전체 계열" },
  ...MAJOR_FIELDS.map((value) => ({ value, label: MAJOR_FIELD_LABEL[value] })),
];

/** 연봉 통계 응답 — 어떤 토큰으로 받은 결과인지 함께 보관 (로그인 사용자가 바뀌면 다시 조회) */
type SalaryResult =
  | { token: string; groups: CareerSalaryGroup[] }
  | { token: string; error: string };

const SALARY_NOTICE =
  "연봉은 관측 연도에 보고된 연봉으로, 실제 이직 전후 연봉이나 초봉이 아닙니다. 소규모 그룹은 비공개되어 전공 계열을 합친 값은 공개된 그룹만의 가중 평균입니다.";

/** 출발 직업코드별 연도 그래프 엣지 (fromCode 로 조회한 결과 캐시) */
type GraphCache = Record<string, { edges: CareerGraphEdge[] } | { error: string }>;

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; data: CareerRoutesData };

const CareerPage = () => {
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [rootCode, setRootCode] = useState<string | null>(null);
  // 1차 이동 직업 → 2차 경로 순서로 선택 (처음엔 아무것도 선택 안 됨)
  const [firstJobId, setFirstJobId] = useState<string | null>(null);
  const [stepId, setStepId] = useState<string | null>(null);
  const [majorField, setMajorField] = useState<MajorFilter>(ALL_MAJORS);
  const [graphs, setGraphs] = useState<GraphCache>({});
  const requestedGraphs = useRef(new Set<string>());

  const token = useCurrentUser()?.accessToken ?? null;
  const [salaryResult, setSalaryResult] = useState<SalaryResult | null>(null);

  // 연봉 통계는 로그인 필요 — 전체 그룹을 한 번 받아 전공 계열·경로별로 클라이언트에서 합친다
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    getCareerSalaryAnalytics({ signal: controller.signal })
      .then(({ groups }) => setSalaryResult({ token, groups }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setSalaryResult({
          token,
          error:
            toApiError(error).message ?? "경로별 연봉 통계를 불러오지 못했습니다.",
        });
      });
    return () => controller.abort();
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    getCareerRoutes({ signal: controller.signal })
      .then((data) => setLoad({ status: "done", data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoad({
          status: "error",
          message:
            toApiError(error).message ?? "직업 이동 경로를 불러오지 못했습니다.",
        });
      });
    return () => controller.abort();
  }, []);

  const data = load.status === "done" ? load.data : null;
  const sourceOptions = useMemo(
    () => (data ? getSourceOptions(data.routes) : []),
    [data],
  );
  const activeRoot =
    rootCode ??
    (sourceOptions.some(({ code }) => code === DEFAULT_ROOT_CODE)
      ? DEFAULT_ROOT_CODE
      : (sourceOptions[0]?.code ?? null));
  const salaryGroups =
    token && salaryResult?.token === token && "groups" in salaryResult
      ? salaryResult.groups
      : null;
  const salaryMessage = !token
    ? "로그인하면 경로별 관측 연봉 통계를 함께 볼 수 있습니다."
    : salaryResult?.token !== token
      ? "경로별 연봉 통계를 불러오는 중입니다..."
      : "error" in salaryResult
        ? salaryResult.error
        : undefined;
  const salaries = useMemo(
    () =>
      salaryGroups
        ? aggregateSalaryGroups(
            salaryGroups,
            majorField === ALL_MAJORS ? null : majorField,
          )
        : undefined,
    [salaryGroups, majorField],
  );
  const tree = useMemo(
    () =>
      data && activeRoot
        ? buildCareerRouteTree(data.routes, activeRoot, salaries)
        : null,
    [data, activeRoot, salaries],
  );
  /** 연봉 막대 최대 눈금 — 지금 트리에서 가장 높은 도착 연봉보다 조금 크게 */
  const salaryScaleMax = useMemo(() => {
    const max = Math.max(
      0,
      ...(tree?.nextSteps ?? []).map(({ salary }) => salary?.meanTo ?? 0),
    );
    return max > 0 ? max * 1.15 : 1;
  }, [tree]);
  const summary = stepId ? (tree?.summaries[stepId] ?? null) : null;

  // 연도별 그래프는 출발 직업 단위로 필요할 때만 조회 (전체 그래프는 수백 KB)
  useEffect(() => {
    for (const code of [activeRoot, firstJobId]) {
      if (!code || requestedGraphs.current.has(code)) continue;
      requestedGraphs.current.add(code);
      getCareerGraph({ fromCode: code })
        .then(({ edges }) => setGraphs((prev) => ({ ...prev, [code]: { edges } })))
        .catch((error: unknown) => {
          // 실패한 코드는 다음 선택 때 다시 시도
          requestedGraphs.current.delete(code);
          setGraphs((prev) => ({
            ...prev,
            [code]: {
              error:
                toApiError(error).message ??
                "연도별 관측 정보를 불러오지 못했습니다.",
            },
          }));
        });
    }
  }, [activeRoot, firstJobId]);

  const yearly = useMemo((): YearlyObservationColumn[] | undefined => {
    const step = tree?.nextSteps.find(({ id }) => id === stepId);
    const first = tree?.firstJobs.find(({ id }) => id === step?.parentId);
    if (!tree || !step || !first || !activeRoot) return undefined;

    const column = (
      title: string,
      fromName: string,
      fromCode: string,
      toName: string,
      toCode: string,
    ): YearlyObservationColumn => {
      const graph = graphs[fromCode];
      return {
        title,
        route: `${fromName} ➔ ${toName}`,
        items:
          graph && "edges" in graph
            ? getYearlyObservations(graph.edges, fromCode, toCode)
            : null,
        error: graph && "error" in graph ? graph.error : undefined,
      };
    };

    return [
      column("1차 구간", tree.start.title, activeRoot, first.title, first.code),
      column("2차 구간", first.title, first.code, step.title, step.code),
    ];
  }, [tree, stepId, activeRoot, graphs]);

  const handleSelectRoot = (code: string) => {
    setRootCode(code);
    setFirstJobId(null);
    setStepId(null);
  };

  const handleSelectFirstJob = (id: string) => {
    // 1차를 바꾸면 이전 2차 선택은 초기화
    if (id !== firstJobId) setStepId(null);
    setFirstJobId(id);
  };

  if (load.status !== "done" || !tree || !activeRoot) {
    return (
      <div className="flex min-h-[560px] items-center justify-center text-[14px] font-bold text-slate-500">
        {load.status === "loading"
          ? "직업 이동 경로를 불러오는 중입니다..."
          : load.status === "error"
            ? load.message
            : "표시할 직업 이동 경로가 없습니다."}
      </div>
    );
  }

  const conditions = [
    `최소 ${load.data.minSegments}구간 이상 관측`,
    `직업명 ${load.data.jobNameReferenceYear}년 분류 기준`,
    `전체 ${load.data.allObservedSegments.toLocaleString("ko-KR")}구간`,
  ];

  return (
    <div className="flex flex-col gap-[14px]">
      <div className="flex items-end">
        <span className="mr-[6px] self-center text-[12px] leading-[18px] font-bold text-teal-600">
          출발 직업
        </span>
        <div className="relative z-20 mr-2 self-center">
          <FilterDropdown
            options={sourceOptions.map(({ code, name, routeCount }) => ({
              value: code,
              label: name,
              description: `직업코드 ${code} · 이동 경로 ${routeCount}개`,
            }))}
            value={activeRoot}
            onChange={handleSelectRoot}
            menuWidth={280}
          />
        </div>
        {salaryGroups && (
          <div className="relative z-20 mr-2 self-center">
            <FilterDropdown<MajorFilter>
              label="전공"
              options={MAJOR_OPTIONS}
              value={majorField}
              onChange={setMajorField}
            />
          </div>
        )}
        <ConditionChip
          items={conditions}
          className="relative z-10 shrink-0 bg-white"
        />
        <div className="-ml-6 flex-1 border-b border-slate-200" />
      </div>

      <div className="flex items-start gap-9 overflow-x-auto pt-[22px]">
        <section className="shrink-0 border-r border-slate-200 pr-9">
          <div className="mb-1.5 grid w-[951px] grid-cols-[277.5px_371.5px_302px] items-center border-b border-slate-100 pb-2 text-center">
            <p className={COLUMN_TITLE}>01 출발 직업</p>
            <p className={COLUMN_TITLE}>02 1차 이동 직업</p>
            <p className={COLUMN_TITLE}>03 2차 이동 직업</p>
          </div>
          <CareerPathGraph
            start={tree.start}
            firstJobs={tree.firstJobs}
            nextSteps={tree.nextSteps}
            selectedFirstJobId={firstJobId}
            selectedStepId={stepId}
            onSelectFirstJob={handleSelectFirstJob}
            onSelectStep={setStepId}
          />
        </section>

        {/* TODO: 경로 상세 API 연동 후 onDetailClick 연결 (/career/:routeId) */}
        <RouteSummaryPanel
          summary={summary}
          notice={`${load.data.notice ?? DEFAULT_NOTICE}${salaryGroups ? ` ${SALARY_NOTICE}` : ""}`}
          salaryScaleMax={salaryScaleMax}
          salaryMessage={salaryMessage}
          yearly={yearly}
        />
      </div>
    </div>
  );
};

export default CareerPage;
