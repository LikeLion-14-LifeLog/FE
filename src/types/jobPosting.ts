/** GET /api/job-postings — 채용공고 카드 */
export type JobPostingCard = {
  jobPostingId: number;
  title: string;
  /** OPEN: 모집 중, CLOSE: 마감 */
  status: string;
  companyName: string;
  companySizeLabel: string | null;
  industryLabel: string | null;
  educationRequirement: string | null;
  workRegion: string | null;
  /** 예상 연봉 (원) — 서버 연봉 모델 준비 전이라 현재 항상 null */
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  /** 마감까지 남은 일수 (당일 0, 상시 채용이면 null) */
  dDay: number | null;
  bookmarkCount: number;
  bookmarked: boolean;
};

/** DEADLINE: 마감 임박순 (기본), POPULAR: 저장 많은 순 */
export type JobPostingSort = "DEADLINE" | "POPULAR";

/** 맞춤 공고 목록 (페이지 정보가 같은 객체에 펼쳐져 옴) */
export type JobPostingListData = {
  /** 희망 직무·학력 맞춤 조건 적용 여부 — 희망 직무가 없으면 false 이고 전체 공고 */
  personalized: boolean;
  desiredJob: { code: string; name: string } | null;
  tabCounts: {
    /** 맞춤 조건까지 적용한 모집 중 공고 수 (지역 필터 전) */
    recommended: number;
    bookmarked: number;
  };
  jobPostings: JobPostingCard[];
  /** 1부터 시작 */
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};
