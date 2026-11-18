export type JobPosting = {
  id: string;
  industry: string;
  jobRole: string;
  title: string;
  company: string;
  education: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  daysLeft: number | null;
  bookmarkCount: number;
};

/** 서버 공고 카드를 화면용으로 변환한 값 (GET /api/job-postings) */
export type JobPostingCard = {
  id: string;
  title: string;
  isClosed: boolean;
  company: string;
  companySize: string | null;
  industry: string | null;
  education: string | null;
  location: string | null;
  /** 만원 단위. 서버 연봉 모델 준비 전이라 현재 null */
  salaryMin: number | null;
  salaryMax: number | null;
  /** 상시 채용이면 null */
  daysLeft: number | null;
  bookmarkCount: number;
  bookmarked: boolean;
};

export type DesiredJob = {
  code: string;
  name: string;
};

export type JobRegion =
  | "SEOUL"
  | "SEOUL_PANGYO"
  | "GYEONGGI"
  | "INCHEON"
  | "BUSAN"
  | "DAEGU"
  | "GWANGJU"
  | "DAEJEON"
  | "ULSAN"
  | "SEJONG"
  | "GANGWON"
  | "CHUNGBUK"
  | "CHUNGNAM"
  | "JEONBUK"
  | "JEONNAM"
  | "GYEONGBUK"
  | "GYEONGNAM"
  | "JEJU";

export type JobTab = "recommended" | "saved" | "offers";

export type JobSort = "latest" | "popular";

export type DropdownOption<T extends string = string> = {
  value: T;
  label: string;
  description?: string;
};

export type JobRole = {
  name: string;
  category: string;
  description: string;
};

export type JobDetail = {
  companyDescription: string;
  position: string;
  salaryNote: string;
  address: string;
  employmentType: string;
  duties: string;
  requirements: string;
  benefits: string;
  applyUrl?: string;
};
