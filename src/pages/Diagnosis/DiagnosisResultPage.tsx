const salaryEstimates = [
  {
    year: 0,
    label: "첫 취업 초봉 예상",
    salary: 3600,
    description: "3,400만 ~ 3,800만 원",
    highlight: "상위 28%",
  },
  {
    year: 3,
    label: "취업 3년 차 예상",
    salary: 4450,
    description: "+850만 원 성장",
    highlight: "중견 IT 서비스",
  },
  {
    year: 5,
    label: "취업 5년 차 예상",
    salary: 5450,
    description: "+1,850만 원 성장",
    highlight: "플랫폼 시니어",
  },
];

export default function DiagnosisResultPage() {
  return (
    <section className="w-full">
      <section
        aria-label="예상 연봉 요약"
        className="mt-5 grid grid-cols-1 gap-y-6 border-b border-border pb-4 sm:grid-cols-3 sm:gap-y-0"
      >
        {salaryEstimates.map((item, index) => (
          <div
            key={item.year}
            className={
              index === 0
                ? "sm:pr-7"
                : index === 1
                  ? "sm:border-l sm:border-border sm:px-7"
                  : "sm:border-l sm:border-border sm:pl-7"
            }
          >
            <p className="text-[12px] font-medium text-text-secondary">
              {item.label}
            </p>
            <p
              className={`mt-2 text-[32px] font-bold leading-tight tracking-[-0.04em] ${
                index === 0 ? "text-brand-strong" : "text-text-primary"
              }`}
            >
              {item.salary.toLocaleString("ko-KR")}
              <span className="ml-0.5 text-[12px] font-semibold tracking-normal">
                만원
              </span>
            </p>
            <p className="mt-2 text-[11px] leading-5 text-text-muted">
              {item.description}
              <span className="ml-1 font-semibold text-brand-strong">
                ({item.highlight})
              </span>
            </p>
          </div>
        ))}
      </section>
      <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-10">
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
          <div className="mt-4 min-h-[240px] w-full" />
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