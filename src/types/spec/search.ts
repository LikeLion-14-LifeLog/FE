/** 명세의 조회 data 필드. URL/Method는 제공되지 않아 연결하지 않음. */
export type PagedResult<T, K extends string> = Record<K, T[]> & {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};
export type JobSearchRecord = {
  jobId: number;
  code: string;
  name: string;
  mainCategory: { code: string; name: string };
  middleCategory: { code: string; name: string };
  subCategory: { code: string; name: string };
};
export type MajorSearchRecord = {
  majorId: number;
  name: string;
  mainField: string;
  middleField: string;
  subField: string;
  code: string;
  degreeProcessName: string;
};
export type CertificationSearchRecord = {
  certificationId: number;
  name: string;
  code: string | null;
  /** 명세 표에는 integer, 응답 예시에는 문자열 ENUM이므로 확인 전까지 union */
  type: string | number;
  mainCategoryName: string;
  authorizedInstitutionName: string | null;
};
export type LanguageExamRecord = {
  languageExamId: number;
  name: string;
  languageType: string;
  scoreType: "NUMERIC" | "GRADE" | "NUMERIC_AND_GRADE" | "NONE";
};
export type JobSearchData = PagedResult<JobSearchRecord, "jobs">;
export type MajorSearchData = PagedResult<MajorSearchRecord, "majors">;
export type CertificationSearchData = PagedResult<
  CertificationSearchRecord,
  "certifications"
>;
export type LanguageExamSearchData = {
  languageExams: LanguageExamRecord[];
  totalCount: number;
};
export type ResidentialAreasData = {
  residentialAreas: { code: string; name: string }[];
};

/** 공통 success/code 래퍼로 잘못 가정하지 않음. */
export type JobSearchResponse = StandardSearchResponse<JobSearchData>;
export type StandardSearchResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};
