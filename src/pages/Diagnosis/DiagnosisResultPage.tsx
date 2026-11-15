import SalaryChart from "@/components/SalaryChart";
import type { SalaryResult } from "@/types/diagnosis";

// GET /api/spec-profile/analyzation/runs/{runId} 응답 예시
const salaryResults: SalaryResult[] = [
  {
    annual: 0,
    annualIncomeMin: 34000000,
    annualIncomeExpected: 36000000,
    annualIncomeMax: 38000000,
    topPercent: 28,
  },
  {
    annual: 3,
    annualIncomeMin: 41000000,
    annualIncomeExpected: 44500000,
    annualIncomeMax: 48000000,
    topPercent: null,
  },
  {
    annual: 5,
    annualIncomeMin: 50000000,
    annualIncomeExpected: 54500000,
    annualIncomeMax: 60000000,
    topPercent: null,
  },
];

const formatSalary = (won: number) =>
  (won / 10000).toLocaleString("ko-KR", {
    maximumFractionDigits: 1,
  });

const chartData = salaryResults.map((item) => ({
  year: item.annual,
  salary: item.annualIncomeExpected,
  lower: item.annualIncomeMin,
  upper: item.annualIncomeMax,
}));

export default function DiagnosisResultPage() {
  const startingSalary = salaryResults[0].annualIncomeExpected;

  return (
    <section className="w-full">
      <section
        aria-label="예상 연봉 요약"
        className="mt-5 grid grid-cols-1 gap-y-6 border-b border-border pb-4 sm:grid-cols-3 sm:gap-y-0"
      >
        {salaryResults.map((item, index) => (
          <div
            key={item.annual}
            className={
              index === 0
                ? "sm:pr-7"
                : index === 1
                  ? "sm:border-l sm:border-border sm:px-7"
                  : "sm:border-l sm:border-border sm:pl-7"
            }
          >
            <p className="text-[12px] font-medium text-text-secondary">
              {item.annual === 0
                ? "첫 취업 초봉 예상"
                : `취업 ${item.annual}년 차 예상`}
            </p>
            <p
              className={`mt-2 text-[32px] font-bold leading-tight tracking-[-0.04em] ${
                index === 0
                  ? "text-brand-strong"
                  : "text-text-primary"
              }`}
            >
              {formatSalary(item.annualIncomeExpected)}
              <span className="ml-0.5 text-[12px] font-semibold tracking-normal">
                만원
              </span>
            </p>
            <p className="mt-2 text-[11px] leading-5 text-text-muted">
              {item.annual === 0
                ? `${formatSalary(item.annualIncomeMin)}만 ~ ${formatSalary(item.annualIncomeMax)}만 원`
                : `${item.annualIncomeExpected >= startingSalary ? "+" : ""}${formatSalary(item.annualIncomeExpected - startingSalary)}만 원 성장`}
              {item.topPercent !== null && (
                <span className="ml-1 font-semibold text-brand-strong">
                  (비교 표본 내 상위 {item.topPercent}%)
                </span>
              )}
            </p>
          </div>
        ))}
      </section>
      <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] lg:gap-8">

        <section aria-labelledby="salary-trend-title" className="min-w-0">
          <h2
            id="salary-trend-title"
            className="text-[16px] font-semibold text-text-primary"
          >
            연차별 연봉 추이
          </h2>
          <p className="mt-2 text-[11px] text-text-secondary">
            현재 스펙 유지 시 예상되는 연봉 변화
          </p>
          <div className="mt-4">
            <SalaryChart data={chartData} />
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-text-muted">
            API 응답 예시 데이터 · 연차별 연봉 및 음영 범위는 AI 추정값
          </p>
        </section>
        <section aria-labelledby="diagnosis-detail-title" className="min-w-0">
          <h2
            id="diagnosis-detail-title"
            className="text-[16px] font-semibold text-text-primary"
          >
            분석 기준 및 스펙 점검
          </h2>
          <div className="mt-5">
            <h3 className="text-[13px] font-semibold text-text-primary">
              비교 기준 집단
            </h3>
          </div>
          <div className="mt-5">
            <h3 className="text-[13px] font-semibold text-text-primary">
              진단에 반영된 내 스펙
            </h3>
          </div>
          <div className="mt-5">
            <h3 className="text-[13px] font-semibold text-text-primary">
              연봉 성장을 위해 보완하면 좋은 점
            </h3>
          </div>
        </section>
      </div>
    </section>
  );
}