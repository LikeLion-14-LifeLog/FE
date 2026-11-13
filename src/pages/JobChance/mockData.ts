// TODO: API 연동 후 이 파일 삭제 (JobChancePage 의 import 만 교체하면 됨)
import type {
  DropdownOption,
  JobDetail,
  JobRole,
  JobPosting,
  JobSort,
} from "@/types/jobs";

export const JOB_ROLE_CATEGORIES = [
  "전체",
  "개발",
  "데이터",
  "기획",
  "디자인",
  "마케팅",
  "경영지원",
  "영업",
];

export const JOB_ROLES: JobRole[] = [
  { name: "백엔드/서버", category: "개발", description: "서버·API·데이터베이스" },
  { name: "프론트엔드", category: "개발", description: "웹 화면·인터페이스" },
  { name: "풀스택", category: "개발", description: "프론트엔드·백엔드 통합" },
  { name: "모바일 앱", category: "개발", description: "iOS·Android·크로스 플랫폼" },
  { name: "DevOps·인프라", category: "개발", description: "클라우드·CI/CD·운영 자동화" },
  { name: "QA·테스트", category: "개발", description: "테스트 설계·품질 보증" },
  { name: "보안", category: "개발", description: "보안 관제·취약점 진단" },
  { name: "게임 개발", category: "개발", description: "게임 클라이언트·엔진" },
  { name: "임베디드", category: "개발", description: "펌웨어·하드웨어 제어" },
  { name: "데이터 엔지니어", category: "데이터", description: "데이터 파이프라인·플랫폼" },
  { name: "데이터 분석가", category: "데이터", description: "지표 설계·통계 분석·시각화" },
  { name: "AI·머신러닝", category: "데이터", description: "모델 개발·MLOps" },
  { name: "데이터 사이언티스트", category: "데이터", description: "예측 모델링·실험 설계" },
  { name: "서비스 기획자", category: "기획", description: "서비스 전략·요구사항·운영" },
  { name: "PM·PO", category: "기획", description: "제품 로드맵·우선순위 관리" },
  { name: "사업 기획", category: "기획", description: "사업 전략·시장 분석" },
  { name: "UX/UI 디자이너", category: "디자인", description: "사용자 경험·화면 설계" },
  { name: "프로덕트 디자이너", category: "디자인", description: "제품 디자인·디자인 시스템" },
  { name: "그래픽 디자이너", category: "디자인", description: "브랜딩·편집·시각물" },
  { name: "퍼포먼스 마케터", category: "마케팅", description: "광고 운영·성과 분석" },
  { name: "콘텐츠 마케터", category: "마케팅", description: "콘텐츠 기획·SNS 운영" },
  { name: "브랜드 마케터", category: "마케팅", description: "브랜드 전략·캠페인" },
  { name: "인사(HR)", category: "경영지원", description: "채용·평가·조직 문화" },
  { name: "재무·회계", category: "경영지원", description: "결산·세무·자금 관리" },
  { name: "법무", category: "경영지원", description: "계약 검토·컴플라이언스" },
  { name: "기술 영업", category: "영업", description: "IT 솔루션 제안·고객 기술 지원" },
  { name: "B2B 영업", category: "영업", description: "기업 고객 발굴·계약 관리" },
];

export const REGION_FILTERS: { label: string; match: string[] }[] = [
  { label: "전체", match: [] },
  { label: "서울 전체", match: ["서울"] },
  { label: "서울·판교 전체", match: ["서울", "경기 성남시 판교"] },
  { label: "경기 전체", match: ["경기"] },
  { label: "인천", match: ["인천"] },
  { label: "부산", match: ["부산"] },
  { label: "대구", match: ["대구"] },
  { label: "대전", match: ["대전"] },
  { label: "광주", match: ["광주"] },
];

export const REGION_OPTIONS: DropdownOption[] = REGION_FILTERS.map(
  ({ label }) => ({ value: label, label })
);

export const SORT_OPTIONS: DropdownOption<JobSort>[] = [
  { value: "latest", label: "최신순", description: "마감 임박 D-day 순" },
  { value: "popular", label: "찜한순", description: "찜이 많은 공고 순" },
];

export const DEFAULT_JOB_ROLE = "백엔드/서버";
export const DEFAULT_REGION = "서울·판교 전체";

export const INITIAL_SAVED_IDS = ["17", "20"];

const job = (
  id: number,
  industry: string,
  jobRole: string,
  title: string,
  company: string,
  education: string,
  location: string,
  salaryMin: number,
  salaryMax: number,
  daysLeft: number | null,
  bookmarkCount: number
): JobPosting => ({
  id: String(id),
  industry,
  jobRole,
  title,
  company,
  education,
  location,
  salaryMin,
  salaryMax,
  daysLeft,
  bookmarkCount,
});

const BACHELOR = "대졸(4년제) 이상";
const ENGINEERING = "공학계열 학사 이상";

export const MOCK_JOBS: JobPosting[] = [
  job(1, "이커머스", "백엔드/서버", "주니어 백엔드 웹 개발자 (신입 정규직)", "(주)네오커머스", BACHELOR, "서울 강남구", 3600, 4000, 3, 312),
  job(2, "금융IT", "백엔드/서버", "금융 결제 백엔드 시스템 개발자 (신입)", "(주)한국금융IT", BACHELOR, "서울 영등포구 여의도", 3850, 4100, 5, 187),
  job(3, "IT솔루션", "백엔드/서버", "데이터 플랫폼 백엔드 엔지니어 (신입)", "(주)데이터웨이브", ENGINEERING, "경기 성남시 판교", 3800, 4200, 7, 248),
  job(4, "디지털헬스케어", "백엔드/서버", "헬스케어 백엔드 서버 개발자 (신입)", "(주)메디케어솔루션", BACHELOR, "서울 마포구 상암동", 3500, 3800, 12, 96),
  job(5, "클라우드솔루션", "백엔드/서버", "엔터프라이즈 클라우드 백엔드 개발자", "(주)엔터프라이즈넷", BACHELOR, "서울 송파구 문정동", 3700, 4000, 14, 131),
  job(6, "물류IT", "백엔드/서버", "물류 풀필먼트 코어 API 개발자 (신입)", "(주)스마트물류테크", ENGINEERING, "서울 구로구 디지털단지", 3600, 3900, 21, 64),
  job(7, "핀테크", "백엔드/서버", "핀테크 플랫폼 백엔드 개발자 (신입)", "㈜토스페이먼츠", BACHELOR, "서울 강남구", 3800, 4200, 12, 275),
  job(8, "게임", "백엔드/서버", "게임 서버 백엔드 개발자 (신입)", "(주)플레이온", ENGINEERING, "경기 성남시 판교", 4000, 4400, 16, 158),
  job(9, "모빌리티", "백엔드/서버", "모빌리티 플랫폼 백엔드 개발자", "(주)무브링크", BACHELOR, "서울 성동구 성수동", 3700, 4100, 11, 142),
  job(10, "클라우드솔루션", "백엔드/서버", "클라우드 인프라 및 API 서버 엔지니어", "㈜딩근마켓", BACHELOR, "서울 서초구", 3600, 4100, null, 73),
  job(11, "보안", "백엔드/서버", "보안 관제 시스템 백엔드 개발자", "(주)시큐어원", ENGINEERING, "서울 금천구 가산동", 3600, 3900, 25, 58),
  job(12, "이커머스", "백엔드/서버", "이커머스 결제·정산 API 개발자", "㈜무아한정패션", BACHELOR, "서울 송파구", 3700, 4000, 7, 89),
  job(13, "미디어", "백엔드/서버", "OTT 콘텐츠 서버 개발자 (신입)", "(주)스트림웍스", BACHELOR, "서울 마포구 상암동", 3700, 4000, 28, 117),
  job(14, "AI솔루션", "백엔드/서버", "AI 서비스 백엔드 개발자 (신입)", "(주)딥인사이트", ENGINEERING, "경기 성남시 판교", 4100, 4500, 4, 203),
  job(15, "리테일", "백엔드/서버", "옴니채널 주문 시스템 개발자", "(주)리테일원", BACHELOR, "서울 중구", 3500, 3800, 19, 47),
  job(16, "통신", "백엔드/서버", "통신 과금 시스템 백엔드 개발자", "(주)넥스트텔레콤", BACHELOR, "서울 중구 을지로", 3900, 4200, 23, 166),
  job(17, "이커머스", "프론트엔드", "커머스 웹 프론트엔드 개발자 (신입)", "(주)네오커머스", BACHELOR, "서울 강남구", 3500, 3900, 8, 221),
  job(18, "IT솔루션", "데이터 엔지니어", "데이터 파이프라인 엔지니어 (신입)", "(주)데이터웨이브", ENGINEERING, "경기 성남시 판교", 3800, 4200, 13, 134),
  job(19, "제조IT", "백엔드/서버", "스마트팩토리 MES 백엔드 개발자", "(주)팩토리랩", ENGINEERING, "경기 수원시 영통구", 3600, 3900, 10, 52),
  job(20, "금융IT", "풀스택", "금융 플랫폼 풀스택 개발자 (신입)", "(주)한국금융IT", BACHELOR, "서울 영등포구 여의도", 3800, 4100, 15, 98),
  job(21, "물류IT", "백엔드/서버", "항만 물류 시스템 백엔드 개발자", "(주)오션로지스", BACHELOR, "부산 해운대구", 3400, 3700, 20, 37),
  job(22, "모빌리티", "모바일 앱", "모빌리티 앱 안드로이드 개발자", "(주)무브링크", BACHELOR, "서울 성동구 성수동", 3600, 4000, 17, 81),
  job(23, "클라우드솔루션", "DevOps·인프라", "클라우드 인프라 엔지니어 (신입)", "(주)엔터프라이즈넷", ENGINEERING, "서울 송파구 문정동", 3800, 4200, 26, 109),
  job(24, "공공IT", "백엔드/서버", "공공 서비스 백엔드 개발자 (신입)", "(주)디지털가버넌스", BACHELOR, "대전 유성구", 3300, 3600, 30, 28),
];

const MOCK_JOB_DETAILS: Record<string, JobDetail> = {
  "1": {
    companyDescription: "이커머스 플랫폼",
    position: "주니어 백엔드 웹 개발자",
    salaryNote: "세전 기본급 기준",
    address: "서울시 강남구 테헤란로 142",
    employmentType: "신입 정규직",
    duties: [
      `결제·정산 대사 배치 파이프라인 개발 및 일간 정산 트랜잭션 관리`,
      `주문·배송 도메인 RESTful API 설계 및 MySQL 쿼리 성능 최적화`,
      `트래픽 대응 Redis 캐시 계층 설계 및 프로모션 트래픽 실시간 모니터링`,
    ].join("\n"),
    requirements: [
      `학력 요건 4년제 대학교 학사 이상 (컴퓨터공학 관련 학과 또는 2025년 2월 졸업예정자)`,
      `기술 역량 Java / Spring Boot 기반 웹 애플리케이션 개발 기초 이해 보유자`,
      `우대 사항 정보처리기사 공인 자격증 보유자 또는 클라우드 기초 인프라 활용 경험자`,
    ].join("\n"),
    benefits: [
      `유연근무 시차출퇴근제 운영 (08:00 ~ 10:00 자율 출근, 1일 8시간 근무)`,
      `장비지원 최신 M3 맥북 프로 및 4K 고해상도 모니터 지급`,
      `성장지원 직무 도서 구입비 및 공인 자격증 응시료 실비 전액 지원`,
    ].join("\n"),
  },
};

export const getMockJobDetail = (job: JobPosting): JobDetail =>
  MOCK_JOB_DETAILS[job.id] ?? {
    companyDescription: `${job.industry} 기업`,
    position: job.title.replace(/\s*\(.*\)\s*$/, ""),
    salaryNote: "세전 기본급 기준",
    address: job.location,
    employmentType: job.title.includes("신입") ? "신입 정규직" : "정규직",
    duties: [
      `서비스 개발 ${job.industry} 서비스 ${job.jobRole} 기능 설계 및 개발`,
      `운영·개선 운영 중인 서비스 장애 대응 및 성능 개선`,
    ].join("\n"),
    requirements: [
      `학력 요건 ${job.education}`,
      `기술 역량 ${job.jobRole} 직무 관련 기초 개발 역량 보유자`,
    ].join("\n"),
    benefits: [
      `유연근무 시차출퇴근제 운영`,
      `성장지원 직무 교육비 및 도서 구입비 지원`,
    ].join("\n"),
  };
