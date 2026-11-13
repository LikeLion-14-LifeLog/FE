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
  description?: string;
  category?: MajorField;
};

type SearchTab = {
  value: string;
  label: string;
};

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
] satisfies { value: MajorField | "all"; label: string }[];

export const searchConfig: Record<SearchKind, SearchConfig> = {
  job: {
    title: "희망 직무 검색·선택",
    description: "관심 있는 직무를 검색하고 하나를 선택해 주세요.",
    placeholder: "이름 또는 키워드를 입력해 주세요",
    maxLength: 50,
    tabs: [
      { value: "all", label: "전체" },
      { value: "development", label: "개발" },
      { value: "data", label: "데이터" },
      { value: "planning", label: "기획" },
      { value: "design", label: "디자인" },
      { value: "marketing", label: "마케팅" },
      { value: "management", label: "경영지원" },
      { value: "sales", label: "영업" },
    ],
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
      { value: "NATIONAL_TECHNICAL", label: "국가기술자격" },
      { value: "NATIONAL_PROFESSIONAL", label: "국가전문" },
      { value: "other", label: "민간·기타" },
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
      { value: "other", label: "기타" },
    ],
  },
};

// UI 테스트용 Mock 데이터. 실제 API 응답 및 서버 ID가 아님.
// 전공명과 계열의 매핑 역시 실제 서버 데이터로 검증된 값이 아님.
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
    {
      key: "major-10",
      name: "시각디자인학",
      category: "ARTS_PHYSICAL_EDUCATION",
    },
  ],
  certificate: [
    { key: "certificate-1", name: "정보처리기사" },
    { key: "certificate-2", name: "SQL 개발자(SQLD)" },
    { key: "certificate-3", name: "정보보안기사" },
  ],
  language: [
    { key: "language-1", name: "TOEIC" },
    { key: "language-2", name: "TOEFL iBT" },
    { key: "language-3", name: "OPIc" },
    { key: "language-4", name: "JLPT" },
  ],
};