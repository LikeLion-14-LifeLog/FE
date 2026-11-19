import { useEffect, useMemo, useState } from "react";
import { getCareerRoutes } from "@/apis/careerPath";
import { toApiError } from "@/apis/client";
import FilterDropdown from "@/pages/JobChance/components/FilterDropdown";
import type { CareerRoutesData } from "@/types/careerRoute";
import { buildCareerRouteTree, getSourceOptions } from "@/utils/careerRouteTree";
import CareerPathGraph from "./components/CareerPathGraph";
import ConditionChip from "./components/ConditionChip";
import RouteSummaryPanel from "./components/RouteSummaryPanel";

const COLUMN_TITLE =
  "text-[12.5px] leading-[18.75px] font-extrabold text-slate-600";

/** 처음 보여줄 출발 직업 (응용 소프트웨어 개발자). 데이터에 없으면 경로가 가장 많은 직업 */
const DEFAULT_ROOT_CODE = "1332";

const DEFAULT_NOTICE =
  "이동 비율은 실제 이직 확률이 아니라 관측된 직업코드 변경 구간의 비율입니다.";

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
  const tree = useMemo(
    () => (data && activeRoot ? buildCareerRouteTree(data.routes, activeRoot) : null),
    [data, activeRoot],
  );
  const summary = stepId ? (tree?.summaries[stepId] ?? null) : null;

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
          notice={load.data.notice ?? DEFAULT_NOTICE}
        />
      </div>
    </div>
  );
};

export default CareerPage;
