import type {
  CertificationSearchRecord, JobSearchRecord, LanguageExamRecord, MajorSearchRecord,
} from "@/types/spec/search";

export type SearchKind = "job" | "major" | "certificate" | "language";
export const majorFields = [
  "HUMANITIES", "SOCIAL_SCIENCES", "NATURAL_SCIENCES", "ENGINEERING",
  "MEDICINE_PHARMACY", "EDUCATION", "ARTS_PHYSICAL_EDUCATION",
] as const;
export type MajorField = (typeof majorFields)[number];
export type SearchItem = {
  key: string;
  name: string;
  /** 서버 검색 응답으로 선택했을 때만 채우는 PK. mock key에서 추론 금지. */
  id?: number;
  description?: string;
  category?: MajorField;
  tab?: string;
  scoreType?: "NUMERIC" | "GRADE" | "NUMERIC_AND_GRADE" | "NONE";
};
export const fromJob = (v: JobSearchRecord): SearchItem => ({
  key: `job-${v.jobId}`, id: v.jobId, name: v.name,
  description: v.subCategory.name, tab: v.mainCategory.code,
});
export const fromMajor = (v: MajorSearchRecord): SearchItem => ({
  key: `major-${v.majorId}`, id: v.majorId, name: v.name,
  category: majorFields.find((f) => f === v.mainField),
  description: v.middleField,
});
export const fromCertificate = (v: CertificationSearchRecord): SearchItem => ({
  key: `certificate-${v.certificationId}`, id: v.certificationId,
  name: v.name, description: v.authorizedInstitutionName ?? undefined,
  tab: typeof v.type === "string" ? v.type : undefined,
});
export const fromLanguageExam = (v: LanguageExamRecord): SearchItem => ({
  key: `language-${v.languageExamId}`, id: v.languageExamId, name: v.name,
  tab: v.languageType, scoreType: v.scoreType,
});

type SearchTab = { value: string; label: string };
type SearchConfig = {
  title: string; description: string; placeholder: string;
  maxLength: number; tabs: SearchTab[];
};
const majorTabs = [
  { value: "all", label: "전체" }, { value: "HUMANITIES", label: "인문" },
  { value: "SOCIAL_SCIENCES", label: "사회" }, { value: "NATURAL_SCIENCES", label: "자연" },
  { value: "ENGINEERING", label: "공학" }, { value: "MEDICINE_PHARMACY", label: "의약" },
  { value: "EDUCATION", label: "교육" }, { value: "ARTS_PHYSICAL_EDUCATION", label: "예체능" },
];
export const searchConfig: Record<SearchKind, SearchConfig> = {
  job: {
    title: "희망 직무 검색·선택", description: "관심 있는 직무를 검색하고 하나를 선택해 주세요.",
    placeholder: "이름 또는 키워드를 입력해 주세요", maxLength: 50,
    // 기존 UI의 분류 탭은 서버 코드와 대응 미확정이라 비활성 상태 유지.
    tabs: [{ value: "all", label: "전체" }, { value: "development", label: "개발" },
      { value: "data", label: "데이터" }, { value: "planning", label: "기획" },
      { value: "design", label: "디자인" }, { value: "marketing", label: "마케팅" },
      { value: "management", label: "경영지원" }, { value: "sales", label: "영업" }],
  },
  major: {
    title: "전공 검색·선택", description: "전공명 또는 관련 키워드를 검색해 선택해 주세요.",
    placeholder: "이름 또는 키워드를 입력해 주세요", maxLength: 100, tabs: majorTabs,
  },
  certificate: {
    title: "자격증 검색·선택", description: "자격증명 또는 관련 키워드를 검색해 선택해 주세요.",
    placeholder: "이름 또는 키워드를 입력해 주세요", maxLength: 100,
    tabs: [{ value: "all", label: "전체" }, { value: "NATIONAL_TECHNICAL", label: "국가기술" },
      { value: "NATIONAL_PROFESSIONAL", label: "국가전문" },
      { value: "INTERNATIONAL", label: "국제" }, { value: "PRIVATE", label: "민간" }],
  },
  language: {
    title: "어학시험 검색·선택", description: "어학시험명 또는 관련 키워드를 검색해 선택해 주세요.",
    placeholder: "이름 또는 키워드를 입력해 주세요", maxLength: 20,
    tabs: [{ value: "all", label: "전체" }, { value: "ENGLISH", label: "영어" },
      { value: "JAPANESE", label: "일본어" }, { value: "CHINESE", label: "중국어" },
      { value: "SPANISH", label: "스페인어" }, { value: "RUSSIAN", label: "러시아어" },
      { value: "KOREAN", label: "한국어" }, { value: "VIETNAMESE", label: "베트남어" }],
  },
};
/** 이름만 확인된 UI 테스트 값. 이름/순서에서 서버 ID 생성 금지. */
export const mockSearchItems: Record<SearchKind, SearchItem[]> = {
  job: [
    { key: "job-1", name: "웹 개발자" },
    { key: "job-2", name: "프론트엔드 개발자" },
    { key: "job-3", name: "백엔드 개발자" },
    { key: "job-4", name: "데이터 엔지니어" },
  ],
  major: [
    { key: "major-1", name: "컴퓨터공학", category: "ENGINEERING" },
    { key: "major-2", name: "소프트웨어학", category: "ENGINEERING" },
    { key: "major-3", name: "전자공학", category: "ENGINEERING" },
    { key: "major-4", name: "경영학", category: "SOCIAL_SCIENCES" },
    { key: "major-5", name: "경제학", category: "SOCIAL_SCIENCES" },
    { key: "major-6", name: "국어국문학", category: "HUMANITIES" },
    { key: "major-7", name: "수학", category: "NATURAL_SCIENCES" },
    { key: "major-8", name: "교육학", category: "EDUCATION" },
    { key: "major-9", name: "간호학", category: "MEDICINE_PHARMACY" },
    { key: "major-10", name: "시각디자인학", category: "ARTS_PHYSICAL_EDUCATION" },
  ],
  certificate: [
    { key: "certificate-1", name: "정보처리기사" },
    { key: "certificate-2", name: "SQL 개발자(SQLD)" },
    { key: "certificate-3", name: "정보보안기사" },
  ],
  language: [
    // 이번 명세에 실제 PK/scoreType이 명시된 항목만 서버 ID 사용
    { key: "language-1", id: 1, name: "TOEIC", tab: "ENGLISH", scoreType: "NUMERIC" },
    { key: "language-mock-2", name: "TOEFL iBT", tab: "ENGLISH" },
    { key: "language-mock-3", name: "OPIc", tab: "ENGLISH" },
    { key: "language-mock-4", name: "JLPT", tab: "JAPANESE" },
  ],
};