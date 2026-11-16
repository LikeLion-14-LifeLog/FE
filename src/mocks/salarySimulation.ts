import type { SalaryConditionOption } from "@/types/salary";

type SalaryChanges = SalaryConditionOption["changes"];

export const baseSalaryExample = [
  { annual: 0, incomeExpected: 36_000_000 },
  { annual: 3, incomeExpected: 44_500_000 },
  { annual: 5, incomeExpected: 54_500_000 },
];

export const salaryNotice =
  "기업 규모, 채용 시점, 실무 프로젝트 경험 등에 따라 차이가 발생할 수 있습니다.";

// 대기업 준비 선택지 비교 응답에 명시된 첫 취업 초봉 예시입니다.
export const startingSalaryExamples: {
  changes: SalaryChanges;
  incomeExpected: number;
  delta: number;
}[] = [
  {
    changes: { addCertificateIds: [1021] },
    incomeExpected: 39_000_000,
    delta: 3_000_000,
  },
  {
    changes: { experience: { type: "INTERNSHIP", durationMonths: 6 } },
    incomeExpected: 41_000_000,
    delta: 5_000_000,
  },
  {
    changes: { academic: { type: "GRADUATE_SCHOOL" } },
    incomeExpected: 45_500_000,
    delta: 9_500_000,
  },
];