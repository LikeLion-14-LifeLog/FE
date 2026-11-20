/** 대시보드 – 연봉 진단 결과 */
export type DiagnosisResult = {
  /** 예상 초봉 (만 원) */
  expectedSalary: number;
  /** 비교 집단 내 상위 % (표본 부족 등으로 없으면 null) */
  topPercent: number | null;
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
  /** 예상 연봉 범위 (만 원) — 서버가 아직 주지 않으면 null */
  salaryMin: number | null;
  salaryMax: number | null;
  /** 카드 하단 태그 (학력 조건·업종 등) */
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
