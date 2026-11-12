import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { useCurrentUser } from "@/store/authStore";
import DiagnosisSummary from "./components/DiagnosisSummary";
import EmptyDiagnosis from "./components/EmptyDiagnosis";
import RecommendedJobs from "./components/RecommendedJobs";
import EmptyRecommendedJobs from "./components/EmptyRecommendedJobs";
// TODO: API 연동 후 목데이터 제거
import { MOCK_DASHBOARD, MOCK_DASHBOARD_EMPTY } from "./mockData";

const DashBoardPage = () => {
  const user = useCurrentUser();
  // 목데이터 전용: /dashboard?empty 로 진단 전 화면 확인
  const [searchParams] = useSearchParams();
  const data = searchParams.has("empty")
    ? MOCK_DASHBOARD_EMPTY
    : MOCK_DASHBOARD;
  const { major, diagnosis, recommendedJobs, totalJobCount } = data;
  const profile = { nickname: user?.nickname ?? "", major };

  return (
    <div className="min-h-screen bg-bg-page font-sans text-text-primary">
      <Header />
      <main className="mx-auto w-full max-w-[1040px] px-4 pb-[90px] md:px-6 lg:px-0">
        {diagnosis ? (
          <div className="pt-[42px]">
            <DiagnosisSummary profile={profile} diagnosis={diagnosis} />
            <RecommendedJobs
              jobs={recommendedJobs}
              totalCount={totalJobCount}
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
