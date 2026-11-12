/** 대시보드 – 연봉 진단 결과 */
export type DiagnosisResult = {
  /** 예상 초봉 (만 원) */
  expectedSalary: number;
  /** 비교 집단 내 상위 % */
  topPercent: number;
  /** 산출에 반영된 핵심 스펙 */
  specs: string[];
};

/** 대시보드 – 추천 채용 공고 */
export type JobPosting = {
  id: number;
  title: string;
  company: string;
  location: string;
  /** 마감까지 남은 일수, null 이면 상시 채용 */
  dDay: number | null;
  /** 예상 연봉 범위 (만 원) */
  salaryMin: number;
  salaryMax: number;
  skills: string[];
};

/** 대시보드 – 사원증에 표시할 사용자 정보 */
export type CardProfile = {
  /** 로그인한 사용자 닉네임 */
  nickname: string;
  /** 학과 */
  major: string;
};

export type DashboardData = {
  /** 학과 (사원증 표시용) */
  major: string;
  /** 진단 전이면 null */
  diagnosis: DiagnosisResult | null;
  recommendedJobs: JobPosting[];
  /** 맞춤 공고 전체 건수 */
  totalJobCount: number;
};
