import { useEffect, useMemo, useRef, useState } from "react";
import DiagnosisGate from "@/components/DiagnosisGate";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getCareerRouteDetail,
  getCareerRoutes,
  getCareerSalaryAnalytics,
  getPersonalizedCareerRoutes,
  getPersonalizedRouteAnalysis,
} from "@/apis/careerPath";
import { toApiError } from "@/apis/client";
import FilterDropdown from "@/pages/JobChance/components/FilterDropdown";
import { MAJOR_FIELDS, MAJOR_FIELD_LABEL } from "@/constants/majorField";
import { useCurrentUser } from "@/store/authStore";
import { getDefaultCareerJob } from "@/store/defaultCareerJobStore";
import type {
  CareerGraphEdge,
  CareerRoutesData,
  CareerSalaryGroup,
  MajorField,
  PersonalizedCareerRoutesData,
} from "@/types/careerRoute";
import {
  aggregateSalaryGroups,
  buildCareerRouteTree,
  getSourceOptions,
  getYearlyObservations,
  routeKey,
  toRouteSalary,
} from "@/utils/careerRouteTree";
import type { RouteSalary } from "@/types/career";
import CareerPathGraph from "./components/CareerPathGraph";
import ConditionChip from "./components/ConditionChip";
import RouteSummaryPanel from "./components/RouteSummaryPanel";
import type { YearlyObservationColumn } from "./components/YearlyObservationList";

const COLUMN_TITLE =
  "text-[12.5px] leading-[18.75px] font-extrabold text-slate-600";

/** 처음 보여줄 출발 직업 (응용 소프트웨어 개발자). 데이터에 없으면 경로가 가장 많은 직업 */
const DEFAULT_ROOT_CODE = "1332";

const DEFAULT_NOTICE =
  "이동 비율은 실제 이직 확률이 아니라 관측된 직업 변경 구간의 비율입니다.";

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

/** 경로(출발-도착)별 연도 구간 — 경로 상세 API 결과 캐시 */
type RouteDetailCache = Record<
  string,
  { edges: CareerGraphEdge[] } | { error: string }
>;

/** 개인화 경로 응답 — 어떤 토큰으로 받은 결과인지 함께 보관 */
type PersonalResult =
  | { token: string; data: PersonalizedCareerRoutesData }
  | { token: string; error: string };

/** 개인화 경로 분석 연봉 캐시 — 경로(출발-도착)별, 받은 토큰과 함께 (값이 없으면 null) */
type PersonalSalaryCache = {
  token: string | null;
  salaries: Record<string, RouteSalary | null>;
};

const PERSONAL_SALARY_NOTICE =
  "연봉은 내 전공 계열 응답자가 관측 연도에 보고한 연봉의 평균으로, 실제 이직 전후 연봉이나 초봉이 아닙니다.";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; data: CareerRoutesData };

const CareerPage = () => {
  const navigate = useNavigate();
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  // 선택 상태는 URL 쿼리에 둔다 → 상세 페이지에서 돌아오거나 새로고침해도 선택한 노드가 유지된다
  const [params, setParams] = useSearchParams();
  const rootCode = params.get("root");
  const firstJobId = params.get("first");
  const stepId = params.get("step");
  const majorParam = params.get("major") as MajorFilter | null;
  const majorField: MajorFilter =
    majorParam && MAJOR_OPTIONS.some(({ value }) => value === majorParam)
      ? majorParam
      : ALL_MAJORS;
  const updateParams = (changes: Record<string, string | null>) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(changes)) {
          if (value === null) next.delete(key);
          else next.set(key, value);
        }
        return next;
      },
      { replace: true },
    );
  const [routeDetails, setRouteDetails] = useState<RouteDetailCache>({});
  const requestedRoutes = useRef(new Set<string>());

  const currentUser = useCurrentUser();
  const token = currentUser?.accessToken ?? null;
  const email = currentUser?.email ?? null;
  const [salaryResult, setSalaryResult] = useState<SalaryResult | null>(null);
  const [personalResult, setPersonalResult] = useState<PersonalResult | null>(
    null,
  );

  // 로그인 사용자는 CURRENT 스펙 전공 계열 기준 개인화 경로를 받는다
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    getPersonalizedCareerRoutes({ signal: controller.signal })
      .then((data) => setPersonalResult({ token, data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setPersonalResult({
          token,
          error:
            toApiError(error).message ??
            "내 전공 맞춤 경로를 불러오지 못했습니다.",
        });
      });
    return () => controller.abort();
  }, [token]);

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
  const personal =
    token && personalResult?.token === token ? personalResult : null;
  const personalData =
    personal && "data" in personal && personal.data.routes.length > 0
      ? personal.data
      : null;
  // 로그인했는데 개인화 응답을 아직 못 받았으면 전체 경로로 잠깐 바뀌지 않도록 기다린다
  const personalPending = !!token && !personal;
  // 로그인 + 스펙 전공 계열이 있으면 항상 내 전공 계열 경로, 아니면 전체 경로
  const usePersonal = personalData !== null;
  const routes = usePersonal ? personalData.routes : (data?.routes ?? null);
  const sourceOptions = useMemo(
    () => (routes ? getSourceOptions(routes) : []),
    [routes],
  );
  // 사용자가 처음 스펙 등록 때 고른 희망 직무 → 출발 직업 후보 중 코드, 없으면 이름으로 찾기
  const userRootCode = useMemo(() => {
    const job = email ? getDefaultCareerJob(email) : null;
    if (!job) return null;
    const name = job.name.trim();
    return (
      sourceOptions.find(({ code }) => job.code && code === job.code)?.code ??
      sourceOptions.find(({ name: n }) => n.trim() === name)?.code ??
      null
    );
  }, [email, sourceOptions]);
  const validRootCode =
    rootCode && sourceOptions.some(({ code }) => code === rootCode)
      ? rootCode
      : null;
  const activeRoot =
    validRootCode ??
    userRootCode ??
    (sourceOptions.some(({ code }) => code === DEFAULT_ROOT_CODE)
      ? DEFAULT_ROOT_CODE
      : (sourceOptions[0]?.code ?? null));
  const salaryGroups =
    token && salaryResult?.token === token && "groups" in salaryResult
      ? salaryResult.groups
      : null;
  // 개인화 모드: 지금 지도에 보이는 경로(출발→1차, 1차→2차)마다 상세 분석 API로 연봉을 받는다
  const routeTree = useMemo(
    () => (routes && activeRoot ? buildCareerRouteTree(routes, activeRoot) : null),
    [routes, activeRoot],
  );
  const visibleRoutes = useMemo(() => {
    if (!routeTree || !activeRoot) return [];
    return [
      ...routeTree.firstJobs.map(({ code }) => [activeRoot, code] as const),
      ...routeTree.nextSteps.map(({ parentId, code }) => [parentId, code] as const),
    ];
  }, [routeTree, activeRoot]);
  const [personalSalaries, setPersonalSalaries] = useState<PersonalSalaryCache>(
    { token: null, salaries: {} },
  );
  const requestedAnalyses = useRef<{ token: string | null; keys: Set<string> }>(
    { token: null, keys: new Set() },
  );
  useEffect(() => {
    if (!usePersonal || !token) return;
    if (requestedAnalyses.current.token !== token)
      requestedAnalyses.current = { token, keys: new Set() };
    const requested = requestedAnalyses.current.keys;
    for (const [source, target] of visibleRoutes) {
      const key = routeKey(source, target);
      if (requested.has(key)) continue;
      requested.add(key);
      getPersonalizedRouteAnalysis(source, target)
        .then((analysis) => toRouteSalary(analysis) ?? null)
        .catch(() => {
          // 실패한 경로는 다음에 다시 보일 때 재시도, 그동안은 값 없이 표시
          requested.delete(key);
          return null;
        })
        .then((salary) =>
          setPersonalSalaries((prev) => ({
            token,
            salaries: {
              ...(prev.token === token ? prev.salaries : {}),
              [key]: salary,
            },
          })),
        );
    }
  }, [usePersonal, token, visibleRoutes]);
  const personalSalaryMap = useMemo(() => {
    if (!usePersonal || personalSalaries.token !== token) return undefined;
    const map = new Map<string, RouteSalary>();
    for (const [key, salary] of Object.entries(personalSalaries.salaries))
      if (salary) map.set(key, salary);
    return map;
  }, [usePersonal, personalSalaries, token]);

  const salaries = useMemo(
    () =>
      usePersonal
        ? personalSalaryMap
        : salaryGroups
        ? aggregateSalaryGroups(
            salaryGroups,
            majorField === ALL_MAJORS ? null : majorField,
          )
        : undefined,
    [usePersonal, personalSalaryMap, salaryGroups, majorField],
  );
  const tree = useMemo(
    () =>
      routes && activeRoot
        ? buildCareerRouteTree(routes, activeRoot, salaries)
        : null,
    [routes, activeRoot, salaries],
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

  // 선택한 경로의 구간(출발→1차, 1차→2차)
  const selectedSegments = useMemo(() => {
    const step = tree?.nextSteps.find(({ id }) => id === stepId);
    const first = tree?.firstJobs.find(({ id }) => id === firstJobId);
    if (!tree || !first || !activeRoot) return [];
    const segments = [
      {
        title: "1차 구간",
        fromName: tree.start.title,
        fromCode: activeRoot,
        toName: first.title,
        toCode: first.code,
      },
    ];
    if (step && step.parentId === first.id) {
      segments.push({
        title: "2차 구간",
        fromName: first.title,
        fromCode: first.code,
        toName: step.title,
        toCode: step.code,
      });
    }
    return segments;
  }, [tree, stepId, firstJobId, activeRoot]);

  // 구간별 연도 정보는 경로 상세 API로 선택할 때마다 한 쌍씩 조회 (받은 결과는 재사용)
  useEffect(() => {
    for (const { fromCode, toCode } of selectedSegments) {
      const key = routeKey(fromCode, toCode);
      if (requestedRoutes.current.has(key)) continue;
      requestedRoutes.current.add(key);
      getCareerRouteDetail(fromCode, toCode)
        .then(({ yearlyIntervals }) =>
          setRouteDetails((prev) => ({
            ...prev,
            [key]: { edges: yearlyIntervals },
          })),
        )
        .catch((error: unknown) => {
          // 실패한 경로는 다음 선택 때 다시 시도
          requestedRoutes.current.delete(key);
          setRouteDetails((prev) => ({
            ...prev,
            [key]: {
              error:
                toApiError(error).message ??
                "연도별 관측 정보를 불러오지 못했습니다.",
            },
          }));
        });
    }
  }, [selectedSegments]);

  const yearly = useMemo((): YearlyObservationColumn[] | undefined => {
    // 2차 경로까지 골랐을 때만 표시
    if (selectedSegments.length < 2) return undefined;
    return selectedSegments.map(({ title, fromName, fromCode, toName, toCode }) => {
      const detail = routeDetails[routeKey(fromCode, toCode)];
      return {
        title,
        route: `${fromName} ➔ ${toName}`,
        items:
          detail && "edges" in detail
            ? getYearlyObservations(detail.edges, fromCode, toCode)
            : null,
        error: detail && "error" in detail ? detail.error : undefined,
      };
    });
  }, [selectedSegments, routeDetails]);

  const handleSelectRoot = (code: string) => {
    updateParams({ root: code, first: null, step: null });
  };

  const handleSelectFirstJob = (id: string) => {
    // 1차를 바꾸면 이전 2차 선택은 초기화
    updateParams(id !== firstJobId ? { first: id, step: null } : { first: id });
  };


  if (load.status !== "done" || personalPending || !tree || !activeRoot) {
    return (
      <div className="flex min-h-[560px] items-center justify-center text-[14px] font-bold text-slate-500">
        {load.status === "loading" || personalPending
          ? "직업 이동 경로를 불러오는 중입니다..."
          : load.status === "error"
            ? load.message
            : "표시할 직업 이동 경로가 없습니다."}
      </div>
    );
  }

  const majorLabel = usePersonal
    ? (personalData.majorFields.find(
        (value) => !MAJOR_FIELDS.includes(value as MajorField),
      ) ??
      personalData.majorFields
        .map((value) => MAJOR_FIELD_LABEL[value as MajorField])
        .find(Boolean) ??
      "내 전공 계열")
    : null;
  const conditions = usePersonal
    ? [
        `${majorLabel} 응답자 기준`,
        `고유 응답자 ${personalData.minSampleSize}명 이상 경로`,
        `직업명 ${load.data.jobNameReferenceYear}년 분류 기준`,
      ]
    : [
        `최소 ${load.data.minSegments}구간 이상 관측`,
        `직업명 ${load.data.jobNameReferenceYear}년 분류 기준`,
        `전체 ${load.data.allObservedSegments.toLocaleString("ko-KR")}구간`,
      ];
  const routeNotice = usePersonal
    ? (personalData.notice ?? DEFAULT_NOTICE)
    : (load.data.notice ?? DEFAULT_NOTICE);

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
              description: `이동 경로 ${routeCount}개`,
            }))}
            value={activeRoot}
            onChange={handleSelectRoot}
            menuWidth={280}
          />
        </div>
        {salaryGroups && !usePersonal && (
          <div className="relative z-20 mr-2 self-center">
            <FilterDropdown<MajorFilter>
              label="전공"
              options={MAJOR_OPTIONS}
              value={majorField}
              onChange={(value) =>
                updateParams({ major: value === ALL_MAJORS ? null : value })
              }
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
            onSelectStep={(id) => updateParams({ step: id })}
          />
        </section>

        <RouteSummaryPanel
          summary={summary}
          notice={`${routeNotice}${
            usePersonal
              ? ` ${PERSONAL_SALARY_NOTICE}`
              : salaryGroups
                ? ` ${SALARY_NOTICE}`
                : ""
          }`}
          salaryScaleMax={salaryScaleMax}
          yearly={yearly}
          onDetailClick={() =>
            stepId &&
            navigate(`/career/${stepId}`, {
              // 상세에서 "전체 경로 지도로 돌아가기" 시 지금 선택 상태로 복귀
              state: { back: `/career?${params}` },
            })
          }
        />
      </div>
    </div>
  );
};

/** 연봉 시뮬레이터처럼 스펙 진단을 마쳐야 경로 지도를 보여 준다 */
const CareerPageWithGate = () => (
  <DiagnosisGate description="진단을 완료하면 내 전공·스펙 기준 커리어 이동 경로를 볼 수 있어요.">
    <CareerPage />
  </DiagnosisGate>
);

export default CareerPageWithGate;
