/**
 * 대시보드 목데이터 — API 연동 전 임시.
 * TODO: API 연동 후 이 파일 삭제 (DashBoardPage 의 import 만 교체하면 됨)
 */
import type { DashboardData } from "@/types/dashboard";

/** 진단 전 화면 확인: diagnosis 를 null 로 변경 */
export const MOCK_DASHBOARD: DashboardData = {
  major: "AI응용학과",
  diagnosis: {
    expectedSalary: 3600,
    topPercent: 35,
    specs: [
      "한성대학교 컴퓨터공학부",
      "전공 학점 3.8 / 4.5",
      "국가공인 정보처리기사 취득",
      "희망 직무 백엔드 개발자",
    ],
  },
  recommendedJobs: [
    {
      id: 1,
      title: "핀테크 플랫폼 백엔드 개발자 (신입)",
      company: "㈜토스페이먼츠",
      location: "서울 강남구",
      dDay: 12,
      salaryMin: 3800,
      salaryMax: 4200,
      skills: ["Java", "Spring Boot"],
    },
    {
      id: 2,
      title: "이커머스 결제·정산 API 개발자",
      company: "㈜무아한정패션",
      location: "서울 송파구",
      dDay: 7,
      salaryMin: 3700,
      salaryMax: 4000,
      skills: ["MySQL", "Redis"],
    },
    {
      id: 3,
      title: "클라우드 인프라 및 API 서버 엔지니어",
      company: "㈜딩근마켓",
      location: "서울 서초구",
      dDay: null,
      salaryMin: 3600,
      salaryMax: 4100,
      skills: ["Kotlin", "AWS"],
    },
  ],
  totalJobCount: 24,
};
