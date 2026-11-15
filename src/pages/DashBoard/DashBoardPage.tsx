import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useCurrentUser } from "@/store/authStore";
import { hasCompletedDiagnosis } from "@/mocks/diagnosis";
import type { JobPosting } from "@/types/dashboard";
import DiagnosisSummary from "./components/DiagnosisSummary";
import EmptyDiagnosis from "./components/EmptyDiagnosis";
import RecommendedJobs from "./components/RecommendedJobs";
import EmptyRecommendedJobs from "./components/EmptyRecommendedJobs";
// TODO: API 연동 후 목데이터 제거
import { MOCK_DASHBOARD } from "./mockData";

const DashBoardPage = () => {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const { major, recommendedJobs, totalJobCount } = MOCK_DASHBOARD;
  // 진단을 마치기 전에는 진단 전(빈) 화면을 보여 준다
  const diagnosis = hasCompletedDiagnosis(user?.email)
    ? MOCK_DASHBOARD.diagnosis
    : null;
  const profile = { nickname: user?.nickname ?? "", major };

  const handleJobClick = (job: JobPosting) => {
    navigate(`/jobs/${job.id}`);
  };

  return (
    <div className="min-h-screen bg-bg-page font-sans text-text-primary">
      <Header />
      <main className="mx-auto w-full max-w-[1040px] px-4 pb-[90px] md:px-6 lg:px-0 lg:[zoom:1.5]">
        {diagnosis ? (
          <div className="pt-[42px]">
            <DiagnosisSummary profile={profile} diagnosis={diagnosis} />
            <RecommendedJobs
              jobs={recommendedJobs}
              totalCount={totalJobCount}
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
