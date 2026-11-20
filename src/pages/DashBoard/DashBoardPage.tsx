import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { getSavedSpecProfileMock, getSpecProfile } from "@/apis/spec";
import { getJobPostings } from "@/apis/jobPosting";
import { useCurrentUser } from "@/store/authStore";
import { completedDiagnosis, useLatestDiagnosis } from "@/hooks/useLatestDiagnosis";
import type { DiagnosisResult, JobPosting } from "@/types/dashboard";
import type { JobPostingCard, JobPostingListData } from "@/types/jobPosting";
import { toDashboardSpec, type DashboardSpec } from "@/utils/dashboardSpec";
import DiagnosisSummary from "./components/DiagnosisSummary";
import EmptyDiagnosis from "./components/EmptyDiagnosis";
import RecommendedJobs from "./components/RecommendedJobs";
import EmptyRecommendedJobs from "./components/EmptyRecommendedJobs";

/** 대시보드에 보여 줄 추천 공고 수 */
const RECOMMENDED_JOB_COUNT = 3;

const toManwon = (krw: number | null) =>
  krw === null ? null : Math.round(krw / 10_000);

/** 공고 API 카드 → 대시보드 카드 (기술 스택이 없어 학력 조건·업종을 태그로) */
const toDashboardJob = (card: JobPostingCard): JobPosting => ({
  id: card.jobPostingId,
  title: card.title,
  company: card.companyName,
  location: card.workRegion ?? "",
  dDay: card.dDay,
  salaryMin: toManwon(card.expectedSalaryMin),
  salaryMax: toManwon(card.expectedSalaryMax),
  skills: [card.educationRequirement, card.industryLabel].filter(
    (value): value is string => !!value,
  ),
});

/** 맞춤 공고 목록 맨 위 3개 (기본 정렬: 마감 임박순). 불러오는 중이면 undefined, 실패하면 null */
function useRecommendedJobs(enabled: boolean, accessToken: string | undefined) {
  const key = accessToken ?? "";
  const [result, setResult] = useState<{
    key: string;
    data: JobPostingListData | null;
  } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    getJobPostings({ page: 1, size: RECOMMENDED_JOB_COUNT, signal: controller.signal })
      .then((data) => setResult({ key, data }))
      .catch(() => {
        if (!controller.signal.aborted) setResult({ key, data: null });
      });
    return () => controller.abort();
  }, [enabled, key]);

  return result?.key === key ? result.data : undefined;
}

type SavedSpecState =
  | { status: "loading" }
  | { status: "done"; spec: DashboardSpec | null };

/**
 * 로그인 사용자의 CURRENT 스펙 (GET /api/spec-profile).
 * 아직 저장한 스펙이 없으면(404) null, 조회 실패 시 저장할 때 남긴 사본을 쓴다.
 */
function useSavedSpec(
  email: string | undefined,
  accessToken: string | undefined,
): SavedSpecState {
  const key = `${email ?? ""}:${accessToken ?? ""}`;
  const [result, setResult] = useState<{
    key: string;
    spec: DashboardSpec | null;
  } | null>(null);

  useEffect(() => {
    if (!email || !accessToken) return;
    let active = true;
    getSpecProfile(accessToken)
      .catch(() => getSavedSpecProfileMock(email))
      .then((profile) => {
        if (active)
          setResult({ key, spec: profile ? toDashboardSpec(profile) : null });
      });
    return () => {
      active = false;
    };
  }, [email, accessToken, key]);

  if (!email || !accessToken) return { status: "done", spec: null };
  return result?.key === key
    ? { status: "done", spec: result.spec }
    : { status: "loading" };
}

const hasSavedSpec = (spec: DashboardSpec | null): spec is DashboardSpec =>
  !!spec?.registered;

const DashBoardPage = () => {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const saved = useSavedSpec(user?.email, user?.accessToken);
  const spec = saved.status === "done" ? saved.spec : null;
  const latest = useLatestDiagnosis();
  // 최신 진단이 완료됐으면 첫 취업(annual 0) 예상 연봉, 아니면 연봉 자리에 안내 문구
  const starting = completedDiagnosis(latest)?.salaryResults.find(
    (item) => item.annual === 0,
  );
  const diagnosis: DiagnosisResult | null = starting
    ? {
        expectedSalary: Math.round(starting.annualIncomeExpected / 10_000),
        topPercent: starting.topPercent,
        specs: [],
      }
    : null;

  const registered = hasSavedSpec(spec);
  const jobData = useRecommendedJobs(registered, user?.accessToken);
  const recommendedJobs = (jobData?.jobPostings ?? []).map(toDashboardJob);
  const jobDescription = jobData && !jobData.personalized
    ? "희망 직무가 없어 전체 모집 공고 중 마감이 가까운 순서입니다."
    : undefined;

  const handleJobClick = (job: JobPosting) => {
    navigate(`/jobs/${job.id}`);
  };

  return (
    <div className="min-h-screen bg-bg-page font-sans text-text-primary">
      <Header />
      <main className="mx-auto w-full max-w-[1040px] px-4 pb-[90px] md:px-6 lg:px-0 lg:[zoom:1.5]">
        {saved.status === "loading" || latest.status === "loading" ? null : registered ? (
          <div className="pt-[42px]">
            <DiagnosisSummary
              profile={{ nickname: user?.nickname ?? "", major: spec.major }}
              diagnosis={diagnosis}
              specs={spec.specs}
            />
            <RecommendedJobs
              jobs={recommendedJobs}
              totalCount={jobData?.tabCounts.recommended ?? 0}
              description={jobDescription}
              loading={jobData === undefined}
              onJobClick={handleJobClick}
            />
          </div>
        ) : (
          <div className="pt-[60px]">
            <EmptyDiagnosis />
            <EmptyRecommendedJobs />
          </div>
        )}
      </main>
    </div>
  );
};

export default DashBoardPage;
