import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import type { CareerRouteDetail } from "@/types/career";
import CareerIcon from "./components/CareerIcon";
import CareerDetailSkeleton from "./components/CareerDetailSkeleton";
import DetailStatSummary from "./components/DetailStatSummary";
import RequirementList from "./components/RequirementList";
import StatCard from "./components/StatCard";
import TimingDistribution from "./components/TimingDistribution";
import { getCareerRouteDetail, getCareerSalaryAnalytics } from "@/apis/careerPath";
import { aggregateSalaryGroups, routeKey } from "@/utils/careerRouteTree";
import { buildCareerRouteDetail, parseRouteId } from "@/utils/careerRouteDetail";

const SectionTitle = ({ children }: { children: string }) => (
  <h2 className="border-b border-slate-100 pb-3 text-[16px] leading-6 font-extrabold text-slate-900">
    {children}
  </h2>
);

type DetailState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "done"; detail: CareerRouteDetail };

const CareerDetail = ({ source, target }: { source: string; target: string }) => {
  const [state, setState] = useState<DetailState>({ status: "loading" });
  // 지도에서 넘어왔으면 그때의 선택 상태(쿼리)로 돌아간다
  const back = (useLocation().state as { back?: string } | null)?.back;
  const backTo = back?.startsWith("/career") ? back : "/career";

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([
      getCareerRouteDetail(source, target, { signal }),
      // 연봉은 실패해도 나머지 정보는 보여 준다
      getCareerSalaryAnalytics({ signal })
        .then(({ groups }) => aggregateSalaryGroups(groups).get(routeKey(source, target)))
        .catch(() => undefined),
    ])
      .then(([data, salary]) => {
        const detail = buildCareerRouteDetail(data, salary);
        setState(detail ? { status: "done", detail } : { status: "not-found" });
      })
      .catch(() => {
        if (!signal.aborted) setState({ status: "not-found" });
      });
    return () => controller.abort();
  }, [source, target]);

  if (state.status === "not-found") return <Navigate to="/career" replace />;
  if (state.status === "loading") return <CareerDetailSkeleton />;
  const { detail } = state;


  return (
    <div>
      <header className="flex items-start justify-between pb-6">
        <div>
          <p className="pt-[7px] text-[10px] leading-[15px] font-extrabold tracking-[1.6px] text-brand-strong">
            SALARY DIAGNOSIS REPORT
          </p>
          <h1 className="mt-2 text-[30px] leading-[37.5px] font-extrabold tracking-[-0.6px] text-slate-900">
            {detail.title}
          </h1>
        </div>
        <Link
          to={backTo}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-[8px] border border-slate-300 bg-white px-4 text-[13px] leading-[19.5px] font-semibold text-slate-700 hover:bg-slate-50"
        >
          <CareerIcon name="backArrow" />
          전체 경로 지도로 돌아가기
        </Link>
      </header>

      <DetailStatSummary stats={detail.stats} />

      <div className="flex min-h-[560px]">
        <section className="flex w-1/2 flex-col border-r border-slate-200 pr-12">
          <div className="flex flex-col gap-5">
            <SectionTitle>내 현재 조건과 도착 직업 요건 대조</SectionTitle>
            <RequirementList
              title="현재 조건과 일치하는 요건"
              icon="check"
              items={detail.matchedRequirements}
            />
            <RequirementList
              title="도착 직업 준비에 추천하는 경험"
              icon="mintArrow"
              items={detail.recommendedExperiences}
              tone="brand"
            />
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4" />
        </section>

        <section className="flex w-1/2 flex-col pl-12">
          <div className="flex flex-col gap-6">
            <SectionTitle>관측 간격 및 연봉 변화 통계</SectionTitle>
            <TimingDistribution
              title="직업코드 변화 관측 간격 분포"
              items={detail.timing}
            />
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-[18px]">
              <p className="text-[13.5px] leading-[20.25px] font-bold text-slate-900">
                이동 전후 평균 연봉 차이
              </p>
              <div className="flex gap-3">
                {detail.raises.map(({ label, value }) => (
                  <StatCard
                    key={label}
                    label={label}
                    value={value}
                    className="min-w-0 flex-1"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-[12px] leading-[18px]">
            <span className="text-slate-400">{detail.source}</span>
            <span className="flex items-center gap-1 font-bold text-slate-700">
              통계 기준 확인
              <CareerIcon name="averageArrow" />
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};

const CareerDetailPage = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const parsed = routeId ? parseRouteId(routeId) : null;

  if (!parsed) return <Navigate to="/career" replace />;

  // key 로 경로가 바뀔 때마다 로딩 상태 초기화
  return <CareerDetail key={routeId} {...parsed} />;
};

export default CareerDetailPage;
