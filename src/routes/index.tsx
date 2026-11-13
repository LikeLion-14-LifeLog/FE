import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import LoginPage from "@/pages/Login/LoginPage";
import SignupPage from "@/pages/Login/SignupPage";
import PasswordResetPage from "@/pages/Login/PasswordResetPage";
import WelcomePage from "@/pages/Login/WelcomePage";
import MainPage from "@/pages/Main/components/MainPage";
import CareerPage from "@/pages/Career/CareerPage";
import NotFoundPage from "@/pages/NotFound/NotFoundPage";
import SalaryPage from "@/pages/Salary/SalaryPage";
import JobChancePage from "@/pages/JobChance/JobChancePage";
import DashBoardPage from "@/pages/DashBoard/DashBoardPage";
import LandingPage from "@/pages/Landing/LandingPage";

const router = createBrowserRouter([
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
      {
        path: "/salary",
        element: <SalaryPage />,
        handle: {
          eyebrow: "SALARY DIAGNOSIS REPORT",
          title: "내 조건 기반 예상 연봉 진단 결과",
          description:
            "서울 학사 · 소프트웨어학 전공 · SQL 개발자(SQLD) · TOEIC 865 기준의 대표 취업자 비교 결과입니다.",
        },
      },
      {
        path: "/spec",
        element: <MainPage />,
        handle: {
          eyebrow: "my carrer profile",
          title: "내 커리어 프로필",
          description:
            "입력한 스펙은 연봉 진단과 맞춤 커리어 추천에 바로 반영되며, 이 기기에 자동 저장됩니다.",
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
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "dashboard", element: <DashBoardPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/password-reset", element: <PasswordResetPage /> },
  { path: "/welcome", element: <WelcomePage /> },
  { path: "*", element: <NotFoundPage /> },
  { path: "/", element: <LandingPage /> },
]);

export default router;
