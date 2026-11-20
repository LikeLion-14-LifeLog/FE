import type {
  CertificationSearchRecord,
  JobSearchRecord,
  LanguageExamRecord,
  MajorSearchRecord,
} from "@/types/spec/search";

export type SearchKind = "job" | "major" | "certificate" | "language";
export const majorFields = [
  "HUMANITIES",
  "SOCIAL_SCIENCES",
  "NATURAL_SCIENCES",
  "ENGINEERING",
  "MEDICINE_PHARMACY",
  "EDUCATION",
  "ARTS_PHYSICAL_EDUCATION",
] as const;
export type MajorField = (typeof majorFields)[number];
export type SearchItem = {
  key: string;
  name: string;
  /** 서버 검색 응답으로 선택했을 때만 채우는 PK. mock key에서 추론 금지. */
  id?: number;
  /** 직무 검색 결과의 직업 코드 */
  code?: string;
  description?: string;
  category?: MajorField;
  tab?: string;
  scoreType?: "NUMERIC" | "GRADE" | "NUMERIC_AND_GRADE" | "NONE";
};
export const fromJob = (v: JobSearchRecord): SearchItem => ({
  key: `job-${v.jobId}`,
  id: v.jobId,
  code: v.code,
  name: v.name,
  description: v.subCategory.name,
  tab: v.mainCategory.code,
});
export const fromMajor = (v: MajorSearchRecord): SearchItem => ({
  key: `major-${v.majorId}`,
  id: v.majorId,
  name: v.name,
  category: majorFields.find((f) => f === v.mainField),
  description: v.middleField,
});
export const fromCertificate = (v: CertificationSearchRecord): SearchItem => ({
  key: `certificate-${v.certificationId}`,
  id: v.certificationId,
  name: v.name,
  description: v.authorizedInstitutionName ?? undefined,
  tab: typeof v.type === "string" ? v.type : undefined,
});
export const fromLanguageExam = (v: LanguageExamRecord): SearchItem => ({
  key: `language-${v.languageExamId}`,
  id: v.languageExamId,
  name: v.name,
  tab: v.languageType,
  scoreType: v.scoreType,
});

type SearchTab = { value: string; label: string };
type SearchConfig = {
  title: string;
  description: string;
  placeholder: string;
  maxLength: number;
  tabs: SearchTab[];
};
const majorTabs = [
  { value: "all", label: "전체" },
  { value: "HUMANITIES", label: "인문" },
  { value: "SOCIAL_SCIENCES", label: "사회" },
  { value: "NATURAL_SCIENCES", label: "자연" },
  { value: "ENGINEERING", label: "공학" },
  { value: "MEDICINE_PHARMACY", label: "의약" },
  { value: "EDUCATION", label: "교육" },
  { value: "ARTS_PHYSICAL_EDUCATION", label: "예체능" },
];
export const searchConfig: Record<SearchKind, SearchConfig> = {
  job: {
    title: "희망 직무 검색·선택",
    description: "관심 있는 직무를 검색하고 하나를 선택해 주세요.",
    placeholder: "이름 또는 키워드를 입력해 주세요",
    maxLength: 50,
    tabs: [{ value: "all", label: "전체" }],
  },
  major: {
    title: "전공 검색·선택",
    description: "전공명 또는 관련 키워드를 검색해 선택해 주세요.",
    placeholder: "이름 또는 키워드를 입력해 주세요",
    maxLength: 100,
    tabs: majorTabs,
  },
  certificate: {
    title: "자격증 검색·선택",
    description: "자격증명 또는 관련 키워드를 검색해 선택해 주세요.",
    placeholder: "이름 또는 키워드를 입력해 주세요",
    maxLength: 100,
    tabs: [
      { value: "all", label: "전체" },
      { value: "NATIONAL_TECHNICAL", label: "국가기술" },
      { value: "NATIONAL_PROFESSIONAL", label: "국가전문" },
      { value: "INTERNATIONAL", label: "국제" },
      { value: "PRIVATE", label: "민간" },
    ],
  },
  language: {
    title: "어학시험 검색·선택",
    description: "어학시험명 또는 관련 키워드를 검색해 선택해 주세요.",
    placeholder: "이름 또는 키워드를 입력해 주세요",
    maxLength: 20,
    tabs: [
      { value: "all", label: "전체" },
      { value: "ENGLISH", label: "영어" },
      { value: "JAPANESE", label: "일본어" },
      { value: "CHINESE", label: "중국어" },
      { value: "SPANISH", label: "스페인어" },
      { value: "RUSSIAN", label: "러시아어" },
      { value: "KOREAN", label: "한국어" },
      { value: "VIETNAMESE", label: "베트남어" },
    ],
  },
};
