/**
 * 커리어 경로 목데이터 — API 연동 전 임시.
 * 경로 지도(CareerPage)는 직업 이동 경로 API로 연동됨.
 * TODO: 경로 상세 API 연동 후 이 파일 삭제 (CareerDetailPage 의 import 만 교체하면 됨)
 * 중견·플랫폼 이직(platformJump) 외 경로의 상세 수치는 화면 확인용 임의값입니다.
 */
import type { CareerRouteDetail } from "@/types/career";

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
