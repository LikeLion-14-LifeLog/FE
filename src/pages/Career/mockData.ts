/**
 * 커리어 경로 목데이터 — API 연동 전 임시.
 * TODO: API 연동 후 이 파일 삭제 (CareerPage / CareerDetailPage 의 import 만 교체하면 됨)
 * 중견·플랫폼 이직(platformJump) 외 경로의 상세 수치는 화면 확인용 임의값입니다.
 */
import type { CareerMapData, CareerRouteDetail } from "@/types/career";

/** 우측 패널 연봉 막대의 최대 눈금 (만 원) */
export const SALARY_SCALE_MAX = 6800;

export const MOCK_CAREER_MAP: CareerMapData = {
  conditions: ["컴퓨터공학", "백엔드 개발", "0~5년 차"],
  start: {
    label: "현재 조건",
    title: "컴퓨터공학 학사 (3.6)",
    description: "정보처리기사 · TOEIC 865",
  },
  firstJobs: [
    {
      id: "solution",
      title: "중소·스타트업 솔루션",
      salary: 3450,
      share: 54,
      entrants: 766,
      note: "1순위 경로",
    },
    {
      id: "midSI",
      title: "중견 SI 및 IT 서비스",
      salary: 3850,
      share: 32,
      entrants: 454,
      note: "시스템 운영",
    },
    {
      id: "bigTech",
      title: "대기업 테크 플랫폼",
      salary: 4800,
      share: 14,
      entrants: 200,
      note: "직무 평가 상위",
    },
  ],
  nextSteps: [
    {
      id: "platformJump",
      parentId: "solution",
      title: "중견·플랫폼 이직",
      salary: 4850,
      variant: "jump",
      badge: "최대 상승 구간",
    },
    {
      id: "solutionStay",
      parentId: "solution",
      title: "솔루션 파트리드 승진",
      salary: 4200,
      variant: "stay",
      note: "근속 38%",
    },
    {
      id: "midSIStay",
      parentId: "midSI",
      title: "엔터프라이즈 PL 승진",
      salary: 4500,
      variant: "stay",
      note: "근속 48%",
    },
    {
      id: "bigTechStay",
      parentId: "bigTech",
      title: "코어 플랫폼 리드",
      salary: 5800,
      variant: "stay",
      note: "잔류 72%",
    },
  ],
  summaries: {
    platformJump: {
      title: "중소 솔루션 ➔ 중견 플랫폼 이직",
      startSalary: 3450,
      targetSalary: 4850,
      rows: [
        { label: "첫 직장 시작 초봉", value: "3,450만 원" },
        { label: "평균 이직 소요 기간", value: "약 3.2년" },
        {
          label: "솔루션 출발자 이직 성공률",
          value: "62% 이동 달성",
          tone: "brandStrong",
        },
        {
          label: "동일 기업 근속(4,200만) 대비",
          value: "+650만 원 높은 상승폭",
          tone: "brand",
        },
        { label: "주요 평가 기준", value: "직무 실무 프로젝트 성과" },
      ],
    },
    solutionStay: {
      title: "중소 솔루션 ➔ 파트리드 승진",
      startSalary: 3450,
      targetSalary: 4200,
      rows: [
        { label: "첫 직장 시작 초봉", value: "3,450만 원" },
        { label: "평균 승진 소요 기간", value: "약 3.5년" },
        {
          label: "동일 기업 근속 비율",
          value: "38% 근속",
          tone: "brandStrong",
        },
        {
          label: "플랫폼 이직(4,850만) 대비",
          value: "-650만 원 낮은 상승폭",
          tone: "brand",
        },
        { label: "주요 평가 기준", value: "프로젝트 리딩 경험" },
      ],
    },
    midSIStay: {
      title: "중견 SI ➔ 엔터프라이즈 PL 승진",
      startSalary: 3850,
      targetSalary: 4500,
      rows: [
        { label: "첫 직장 시작 초봉", value: "3,850만 원" },
        { label: "평균 승진 소요 기간", value: "약 3.8년" },
        {
          label: "동일 기업 근속 비율",
          value: "48% 근속",
          tone: "brandStrong",
        },
        {
          label: "초봉 대비",
          value: "+650만 원 상승",
          tone: "brand",
        },
        { label: "주요 평가 기준", value: "대형 프로젝트 관리 역량" },
      ],
    },
    bigTechStay: {
      title: "대기업 테크 ➔ 코어 플랫폼 리드",
      startSalary: 4800,
      targetSalary: 5800,
      rows: [
        { label: "첫 직장 시작 초봉", value: "4,800만 원" },
        { label: "평균 승진 소요 기간", value: "약 4.1년" },
        {
          label: "동일 기업 잔류 비율",
          value: "72% 잔류",
          tone: "brandStrong",
        },
        {
          label: "초봉 대비",
          value: "+1,000만 원 상승",
          tone: "brand",
        },
        { label: "주요 평가 기준", value: "직무 평가 상위 등급" },
      ],
    },
  },
};

const SOURCE = "출처: 한국고용정보원 청년패널조사";

export const MOCK_CAREER_DETAILS: Record<string, CareerRouteDetail> = {
  platformJump: {
    title: "중소·스타트업 솔루션 개발 출발 ➔ 3년 차 플랫폼 이직",
    stats: [
      {
        label: "첫 취업 초봉 기준",
        value: "3,450",
        unit: "만 원",
        caption: "중소 솔루션 직무 수행 기준",
      },
      {
        label: "평균 첫 이직 소요 시점",
        value: "평균 2.8",
        unit: "년 차",
        caption: "1년 이상~3년 미만 이직 비중 58%",
      },
      {
        label: "이직 후 연봉",
        value: "4,850",
        unit: "만 원",
        caption: "초봉 대비 +1,400만 원 (약 +41% 상승)",
        highlight: true,
      },
    ],
    matchedRequirements: [
      "전공: 컴퓨터공학 학사 (공학계열 일치)",
      "자격: 정보처리기사 보유 (직무 필수 공인 자격 충족)",
      "실무 프로젝트: 실무 개발 프로젝트 및 협업 경험 충족",
    ],
    recommendedExperiences: [
      "클라우드 환경 기반 서비스 배포 및 인프라 운영 경험",
      "데이터베이스 쿼리 최적화 및 시스템 성능 튜닝",
      "대용량 트래픽 대응을 위한 비동기 메시지 처리 경험",
    ],
    timing: [
      { label: "1년 미만 이직", percent: 14 },
      {
        label: "1년 이상 ~ 3년 미만 (최다 집중 구간)",
        percent: 58,
        highlight: true,
      },
      { label: "3년 이상 ~ 5년 미만", percent: 28 },
    ],
    raises: [
      { label: "평균 인상액", value: "+1,400만 원" },
      { label: "상위 25% 인상액", value: "+1,900만 원" },
    ],
    source: SOURCE,
  },
  solutionStay: {
    title: "중소·스타트업 솔루션 개발 출발 ➔ 파트리드 승진",
    stats: [
      {
        label: "첫 취업 초봉 기준",
        value: "3,450",
        unit: "만 원",
        caption: "중소 솔루션 직무 수행 기준",
      },
      {
        label: "평균 승진 소요 시점",
        value: "평균 3.5",
        unit: "년 차",
        caption: "3년 이상~5년 미만 승진 비중 52%",
      },
      {
        label: "승진 후 연봉",
        value: "4,200",
        unit: "만 원",
        caption: "초봉 대비 +750만 원 (약 +22% 상승)",
        highlight: true,
      },
    ],
    matchedRequirements: [
      "전공: 컴퓨터공학 학사 (공학계열 일치)",
      "자격: 정보처리기사 보유 (직무 필수 공인 자격 충족)",
    ],
    recommendedExperiences: [
      "솔루션 도입 고객사 기술 지원 및 요구사항 분석 경험",
      "소규모 개발 파트 일정·품질 관리 경험",
    ],
    timing: [
      { label: "3년 미만 승진", percent: 18 },
      {
        label: "3년 이상 ~ 5년 미만 (최다 집중 구간)",
        percent: 52,
        highlight: true,
      },
      { label: "5년 이상", percent: 30 },
    ],
    raises: [
      { label: "평균 인상액", value: "+750만 원" },
      { label: "상위 25% 인상액", value: "+1,100만 원" },
    ],
    source: SOURCE,
  },
  midSIStay: {
    title: "중견 SI 및 IT 서비스 출발 ➔ 엔터프라이즈 PL 승진",
    stats: [
      {
        label: "첫 취업 초봉 기준",
        value: "3,850",
        unit: "만 원",
        caption: "중견 SI 시스템 운영 기준",
      },
      {
        label: "평균 승진 소요 시점",
        value: "평균 3.8",
        unit: "년 차",
        caption: "3년 이상~5년 미만 승진 비중 55%",
      },
      {
        label: "승진 후 연봉",
        value: "4,500",
        unit: "만 원",
        caption: "초봉 대비 +650만 원 (약 +17% 상승)",
        highlight: true,
      },
    ],
    matchedRequirements: [
      "전공: 컴퓨터공학 학사 (공학계열 일치)",
      "자격: 정보처리기사 보유 (SI 수행 필수 자격 충족)",
    ],
    recommendedExperiences: [
      "대형 SI 프로젝트 요구사항 정의 및 설계 참여 경험",
      "레거시 시스템 운영·이관 경험",
    ],
    timing: [
      { label: "3년 미만 승진", percent: 15 },
      {
        label: "3년 이상 ~ 5년 미만 (최다 집중 구간)",
        percent: 55,
        highlight: true,
      },
      { label: "5년 이상", percent: 30 },
    ],
    raises: [
      { label: "평균 인상액", value: "+650만 원" },
      { label: "상위 25% 인상액", value: "+950만 원" },
    ],
    source: SOURCE,
  },
  bigTechStay: {
    title: "대기업 테크 플랫폼 출발 ➔ 코어 플랫폼 리드",
    stats: [
      {
        label: "첫 취업 초봉 기준",
        value: "4,800",
        unit: "만 원",
        caption: "대기업 테크 플랫폼 직무 기준",
      },
      {
        label: "평균 리드 전환 시점",
        value: "평균 4.1",
        unit: "년 차",
        caption: "3년 이상~5년 미만 전환 비중 61%",
      },
      {
        label: "리드 전환 후 연봉",
        value: "5,800",
        unit: "만 원",
        caption: "초봉 대비 +1,000만 원 (약 +21% 상승)",
        highlight: true,
      },
    ],
    matchedRequirements: ["전공: 컴퓨터공학 학사 (공학계열 일치)"],
    recommendedExperiences: [
      "대규모 분산 시스템 설계 및 운영 경험",
      "코드 리뷰·기술 의사결정 주도 경험",
      "직무 평가 상위 등급 유지",
    ],
    timing: [
      { label: "3년 미만 전환", percent: 9 },
      {
        label: "3년 이상 ~ 5년 미만 (최다 집중 구간)",
        percent: 61,
        highlight: true,
      },
      { label: "5년 이상", percent: 30 },
    ],
    raises: [
      { label: "평균 인상액", value: "+1,000만 원" },
      { label: "상위 25% 인상액", value: "+1,500만 원" },
    ],
    source: SOURCE,
  },
};
