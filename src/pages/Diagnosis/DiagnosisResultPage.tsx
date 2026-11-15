export default function DiagnosisResultPage() {
  return (
    <section className="w-full">
      <section
        aria-label="예상 연봉 요약"
        className="mt-10 grid grid-cols-1 gap-y-6 border-b border-border pb-6 sm:grid-cols-3 sm:gap-y-0"
      >
        <div className="sm:pr-7">
          <p className="text-[13px] font-medium text-text-secondary">
            첫 취업 초봉 예상
          </p>
        </div>

        <div className="sm:border-l sm:border-border sm:px-7">
          <p className="text-[13px] font-medium text-text-secondary">
            취업 3년 차 예상
          </p>
        </div>

        <div className="sm:border-l sm:border-border sm:pl-7">
          <p className="text-[13px] font-medium text-text-secondary">
            취업 5년 차 예상
          </p>
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-12">
        <section aria-labelledby="salary-trend-title" className="min-w-0">
          <h2
            id="salary-trend-title"
            className="text-[16px] font-semibold text-text-primary"
          >
            연차별 연봉 추이
          </h2>

          <p className="mt-2 text-[12px] text-text-secondary">
            현재 스펙 유지 시 예상되는 연봉 변화
          </p>

          <div className="mt-6 min-h-[280px] w-full" />
        </section>

        <section aria-labelledby="diagnosis-detail-title" className="min-w-0">
          <h2
            id="diagnosis-detail-title"
            className="text-[16px] font-semibold text-text-primary"
          >
            분석 기준 및 스펙 점검
          </h2>

          <div className="mt-8">
            <h3 className="text-[13px] font-semibold text-text-primary">
              비교 기준 집단
            </h3>
          </div>

          <div className="mt-8">
            <h3 className="text-[13px] font-semibold text-text-primary">
              진단에 반영된 내 스펙
            </h3>
          </div>

          <div className="mt-8">
            <h3 className="text-[13px] font-semibold text-text-primary">
              연봉 성장을 위해 보완하면 좋은 점
            </h3>
          </div>
        </section>
      </div>
    </section>
  );
}