import type { SalaryComparison } from "@/types/salary";

export const salarySimulationExample = {
  base: [
    {
      annual: 0,
      incomeExpected: 36_000_000,
      incomeMin: 34_000_000,
      incomeMax: 38_500_000,
      growth: 0,
    },
    {
      annual: 3,
      incomeExpected: 44_500_000,
      incomeMin: 42_000_000,
      incomeMax: 47_500_000,
      growth: 8_500_000,
    },
    {
      annual: 5,
      incomeExpected: 54_500_000,
      incomeMin: 51_000_000,
      incomeMax: 58_000_000,
      growth: 18_500_000,
    },
  ],
  notice:
    "기업 규모, 채용 시점, 실무 프로젝트 경험 등에 따라 차이가 발생할 수 있습니다.",
};

export const salaryComparisonExample = {
  options: [
    {
      optionKey: "CERTIFICATE",
      title: "AWS SAA 자격증",
      incomeExpected: 39_000_000,
      delta: 3_000_000,
      prepPeriod: "약 2~3개월",
      estimatedCost: 350_000,
      costNote: "응시료·교재",
      fitDescription: "기본 직무 요건 보완에 적합",
      changes: { addCertificateIds: [1021] },
    },
    {
      optionKey: "INTERNSHIP",
      title: "실무 프로젝트 · 인턴 6개월",
      incomeExpected: 41_000_000,
      delta: 5_000_000,
      prepPeriod: "약 6개월",
      estimatedCost: 0,
      costNote: "인턴 급여 수령 (자체 비용 부담 없음)",
      fitDescription: "실무 수행 경험 중심 평가에 적합",
      changes: { experience: { type: "INTERNSHIP", durationMonths: 6 } },
    },
    {
      optionKey: "GRADUATE_SCHOOL",
      title: "일반대학원 진학",
      incomeExpected: 45_500_000,
      delta: 9_500_000,
      prepPeriod: "약 2년 (4학기 기준)",
      estimatedCost: 12_000_000,
      costNote: "등록금 기준",
      fitDescription: "연구 개발 및 전문 연구 직무 지원에 적합",
      changes: { academic: { type: "GRADUATE_SCHOOL" } },
    },
  ],
  basis: "세전 기본급 기준 (성과급 제외)",
  notice:
    "준비 기간과 비용은 참고 기준이며 개인 상황에 따라 다를 수 있습니다. 조건 변경 결과는 통계적 추정치입니다.",
} satisfies SalaryComparison;