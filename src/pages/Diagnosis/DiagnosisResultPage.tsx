import SalaryChart from "@/components/SalaryChart";
import chevronDown from "@/assets/icons/chevronDown.svg";
import type { SalaryResult } from "@/types/diagnosis";

// GET /api/spec-profile/analyzation/runs/{runId} 완료 응답 예시
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

const diagnosisDetail = {
  comparisonGroup: {
    jobSubCategoryName: "소프트웨어 개발자",
    sampleCount: 120,
    observationYears: [2021, 2022, 2023, 2024],
    description:
      "소프트웨어 개발 직무 이력이 있고 입력한 학력·전공·지역 조건에 부합하는 KEEPⅡ 응답자입니다. 학점·어학·자격증 개수의 유사도를 반영해 개인별 비교 연도를 선택했습니다.",
  },
  appliedSpecs: {
    jobName: "소프트웨어 개발자",
    academicAbilities: [
      {
        type: "UNIVERSITY",
        majorName: "소프트웨어학",
        universityGrade: 3.86,
        universityStandardGrade: 4.5,
      },
    ],
    certificates: [
      { certificateId: 710, certificateName: "SQL 개발자(SQLD)" },
    ],
    languageExamScores: [
      {
        languageExamId: 1,
        languageExamName: "TOEIC",
        scoreNumeric: 865,
        scoreGrade: null,
      },
    ],
  },
  recommendation:
    "프로젝트 경험을 직무 성과 중심으로 구체화하고 배포·운영 경험을 보완해 보세요.",
  salaryNotice:
    "한국교육고용패널Ⅱ(KEEPⅡ) 비교표본 기반 · 금액은 원화 연환산 · 연차별 연봉과 음영 범위는 AI 추정값 · 상위 비율은 비교 표본 내 순위",
};

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
  const { comparisonGroup, appliedSpecs, recommendation, salaryNotice } =
    diagnosisDetail;

  const education = appliedSpecs.academicAbilities
    .map(
      (item) =>
        `${item.type === "UNIVERSITY" ? "학사" : item.type} · ${item.majorName ?? "전공 미입력"}`,
    )
    .join(", ");

  const grades = appliedSpecs.academicAbilities
    .filter(
      (item) =>
        item.universityGrade !== null &&
        item.universityStandardGrade !== null,
    )
    .map(
      (item) =>
        `${item.universityGrade} / ${item.universityStandardGrade}`,
    )
    .join(", ");

  const certificates = appliedSpecs.certificates
    .map((item) => item.certificateName)
    .join(", ");

  const languages = appliedSpecs.languageExamScores
    .map(
      (item) =>
        `${item.languageExamName} ${item.scoreNumeric ?? item.scoreGrade ?? ""}`.trim(),
    )
    .join(", ");

  const specRows = [
    { label: "학력", value: education },
    { label: "학점", value: grades },
    { label: "자격", value: certificates },
    { label: "어학", value: languages },
  ];

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
                index === 0 ? "text-brand-strong" : "text-text-primary"
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
            {salaryNotice}
          </p>
          <p className="mt-1 text-[10px] text-text-muted">
            현재 화면은 API 응답 예시 데이터를 사용합니다.
          </p>
        </section>

        <section
          aria-labelledby="diagnosis-detail-title"
          className="min-w-0"
        >
          <h2
            id="diagnosis-detail-title"
            className="text-[16px] font-semibold text-text-primary"
          >
            분석 기준 및 스펙 점검
          </h2>

          <div className="mt-6">
            <h3 className="text-[13px] font-semibold text-text-primary">
              비교 기준 집단
            </h3>
            <p className="mt-2 text-[12px] font-medium text-text-secondary">
              {comparisonGroup.jobSubCategoryName} ·{" "}
              {comparisonGroup.sampleCount.toLocaleString("ko-KR")}명
            </p>
            <p className="mt-1 text-[11px] leading-5 text-text-muted">
              {comparisonGroup.description}
            </p>
            <p className="mt-1 text-[10px] text-text-muted">
              관측 연도: {comparisonGroup.observationYears.join(", ")}
            </p>
          </div>

          <details className="group mt-5 border-y border-border py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-text-primary">
                  진단에 반영된 내 스펙
                </span>
                <span className="text-[11px] font-medium text-brand-strong group-open:hidden">
                  펼치기
                </span>
                <span className="hidden text-[11px] font-medium text-brand-strong group-open:inline">
                  접기
                </span>
              </span>
              <img
                src={chevronDown}
                alt=""
                className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
              />
            </summary>

            <dl className="mt-6 space-y-5">
              {specRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[64px_minmax(0,1fr)] items-start gap-3"
                >
                  <dt className="text-[12px] text-text-muted">
                    {row.label}
                  </dt>
                  <dd className="min-w-0 text-right text-[12px] font-semibold leading-5 text-text-primary">
                    {row.value || "없음"}
                  </dd>
                </div>
              ))}
            </dl>
          </details>

          <div className="mt-5">
            <h3 className="text-[13px] font-semibold text-text-primary">
              연봉 성장을 위해 보완하면 좋은 점
            </h3>
            <p className="mt-2 text-[11px] leading-5 text-text-secondary">
              {recommendation}
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}