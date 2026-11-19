import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import LoginPage from "@/pages/Login/LoginPage";
import SignupPage from "@/pages/Login/SignupPage";
import PasswordResetPage from "@/pages/Login/PasswordResetPage";
import WelcomePage from "@/pages/Login/WelcomePage";
import SpecEntryPage from "@/pages/Spec/SpecEntryPage";
import DiagnosisLoadingPage from "@/pages/Diagnosis/DiagnosisLoadingPage";
import DiagnosisResultPage from "@/pages/Diagnosis/DiagnosisResultPage";
import CareerPage from "@/pages/Career/CareerPage";
import CareerDetailPage from "@/pages/Career/CareerDetailPage";
import NotFoundPage from "@/pages/NotFound/NotFoundPage";
import SalaryPage from "@/pages/Salary/SalaryPage";
import JobChancePage from "@/pages/JobChance/JobChancePage";
import JobDetailPage from "@/pages/JobChance/JobDetailPage";
import DashBoardPage from "@/pages/DashBoard/DashBoardPage";
import LandingPage from "@/pages/Landing/LandingPage";
import RequireLogin from "@/routes/RequireLogin";
import {
  LoginRequiredPage,
  MaintenancePage,
  NetworkErrorPage,
  ServerErrorPage,
  SpecUnavailablePage,
} from "@/pages/Exception/ExceptionPages";

const router = createBrowserRouter([
  // 상단 메뉴(대시보드·스펙·연봉·커리어·채용)와 그 하위 화면은 로그인 필요
  {
    element: <RequireLogin />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "/career",
            element: <CareerPage />,
            handle: {
              eyebrow: "Career Path",
              title: "동일 전공·스펙 선배들은 어디로 취업하고 이직했을까요?",
              description:
                "공공 청년패널 실데이터 기반 동일 전공·조건 취업자 이동 경로 추적 분석",
            },
          },
          { path: "/career/:routeId", element: <CareerDetailPage /> },
          { path: "/salary", element: <SalaryPage /> },
          {
            path: "/spec",
            element: <SpecEntryPage />,
            handle: {
              eyebrow: "MY CAREER PROFILE",
              title: "내 커리어 프로필",
              description:
                "입력한 스펙은 연봉 진단과 맞춤 커리어 추천에 활용되며, 이 페이지에서 언제든 수정할 수 있습니다.",
            },
          },
          { path: "/diagnosis/loading", element: <DiagnosisLoadingPage /> },
          {
            path: "/diagnosis/result",
            element: <DiagnosisResultPage />,
            handle: {
              eyebrow: "SALARY DIAGNOSIS REPORT",
              title: "내 조건 기반 예상 연봉 진단 결과",
              description: "등록한 스펙을 바탕으로 분석 결과를 확인합니다.",
            },
          },
          {
            path: "/jobs",
            element: <JobChancePage />,
            handle: {
              eyebrow: "JOB OPENING",
              title: "채용 기회",
              description:
                "등록된 프로필 조건 및 설정한 준비 목표(인턴 6개월)를 바탕으로 추천 맞춤 공고입니다.",
            },
          },
          {
            // 상세 화면은 자체 제목을 쓰므로 handle 없음
            path: "/jobs/:jobId",
            element: <JobDetailPage />,
          },
        ],
      },
      { path: "/dashboard", element: <DashBoardPage /> },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/password-reset", element: <PasswordResetPage /> },
  { path: "/welcome", element: <WelcomePage /> },
  // 예외 페이지
  { path: "/error/500", element: <ServerErrorPage /> },
  { path: "/error/network", element: <NetworkErrorPage /> },
  { path: "/error/login-required", element: <LoginRequiredPage /> },
  { path: "/error/maintenance", element: <MaintenancePage /> },
  { path: "/error/spec-unavailable", element: <SpecUnavailablePage /> },
  { path: "*", element: <NotFoundPage /> },
  { path: "/", element: <LandingPage /> },
]);

export default router;
