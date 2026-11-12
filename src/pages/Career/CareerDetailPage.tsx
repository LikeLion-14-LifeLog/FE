import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import type { CareerRouteDetail } from "@/types/career";
import CareerIcon from "./components/CareerIcon";
import CareerDetailSkeleton from "./components/CareerDetailSkeleton";
import DetailStatSummary from "./components/DetailStatSummary";
import RequirementList from "./components/RequirementList";
import StatCard from "./components/StatCard";
import TimingDistribution from "./components/TimingDistribution";
// TODO: API 연동 후 목데이터 제거
import { MOCK_CAREER_DETAILS } from "./mockData";

/** 목데이터 로딩 지연 (스켈레톤 확인용) */
const MOCK_DELAY_MS = 800;

const SectionTitle = ({ children }: { children: string }) => (
  <h2 className="border-b border-slate-100 pb-3 text-[16px] leading-6 font-extrabold text-slate-900">
    {children}
  </h2>
);

const CareerDetail = ({ routeId }: { routeId: string }) => {
  const [detail, setDetail] = useState<CareerRouteDetail | null>(null);

  useEffect(() => {
    // TODO: API 연동 시 fetch 로 교체
    const timer = setTimeout(
      () => setDetail(MOCK_CAREER_DETAILS[routeId] ?? null),
      MOCK_DELAY_MS
    );
    return () => clearTimeout(timer);
  }, [routeId]);

  if (!detail) return <CareerDetailSkeleton />;

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
          to="/career"
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
            <SectionTitle>내 현재 조건과 이직 요건 대조</SectionTitle>
            <RequirementList
              title="현재 조건과 일치하는 요건"
              icon="check"
              items={detail.matchedRequirements}
            />
            <RequirementList
              title="이직 성공자들이 추천하는 준비 경험"
              icon="mintArrow"
              items={detail.recommendedExperiences}
              tone="brand"
            />
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4" />
        </section>

        <section className="flex w-1/2 flex-col pl-12">
          <div className="flex flex-col gap-6">
            <SectionTitle>이직 시점 및 보상 상승률 실통계</SectionTitle>
            <TimingDistribution
              title="첫 직장 근무 후 이직 시점 분포"
              items={detail.timing}
            />
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-[18px]">
              <p className="text-[13.5px] leading-[20.25px] font-bold text-slate-900">
                이직 시 평균 연봉 상승폭
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

  if (!routeId || !(routeId in MOCK_CAREER_DETAILS)) {
    return <Navigate to="/career" replace />;
  }

  // key 로 경로가 바뀔 때마다 로딩 상태 초기화
  return <CareerDetail key={routeId} routeId={routeId} />;
};

export default CareerDetailPage;
