import SalaryChart from "@/components/SalaryChart";

const baseSalary = [
  { year: 0, salary: 36_000_000 },
  { year: 3, salary: 44_500_000 },
  { year: 5, salary: 54_500_000 },
];

const conditions = [
  { label: "직무 경험", summary: "없음" },
  { label: "자격증", summary: "현재 자격증 유지" },
  { label: "어학", summary: "현재 수준 유지" },
  { label: "학력", summary: "진학 안 함" },
];

export default function SalaryPage() {
  const startingSalary = (baseSalary[0].salary / 10_000).toLocaleString("ko-KR");

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-text-primary pt-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-[10px] font-bold text-brand-strong">
            비교 기준
          </span>
          <label htmlFor="salary-company" className="text-[12px] font-bold">
            어떤 기업군을 목표로 하나요?
          </label>
          <select
            id="salary-company"
            disabled
            className="h-10 min-w-[190px] rounded-lg bg-bg-section px-4 text-[12px] font-semibold"
          >
            <option>중견 IT 서비스</option>
          </select>
        </div>

        <p className="rounded-full bg-brand-soft px-3.5 py-2 text-[11px] text-brand-strong">
          비교한 조건은 내 스펙에 저장되지 않아요
        </p>
      </div>

      <div className="mt-[38px] grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)]">
        <section
          aria-labelledby="salary-projection-title"
          className="flex min-w-0 flex-col rounded-[18px] border border-border px-5 py-7 sm:px-[34px] lg:min-h-[620px]"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="salary-projection-title" className="text-[13px] font-bold">
              조건 변경에 따른 예상 변화
            </h2>
            <span className="text-[10px] text-text-muted">
              세전 기본급 기준
            </span>
          </div>

          <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-end gap-4 pb-6 sm:gap-8">
            <div>
              <p className="text-[11px] text-text-muted">현재 예상 초봉</p>
              <p className="mt-2 text-[24px] font-bold tracking-[-0.04em] sm:text-[30px]">
                {startingSalary}
                <span className="ml-0.5 text-[12px] tracking-normal">만 원</span>
              </p>
            </div>
            <span aria-hidden="true" className="pb-1 text-[17px]">→</span>
            <div>
              <p className="text-[11px] text-text-muted">변경 후 예상 초봉</p>
              <p className="mt-2 text-[24px] font-bold text-brand-strong sm:text-[30px]">
                –
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-4 pb-3">
            <div className="mx-auto max-w-[560px]">
              <SalaryChart data={baseSalary} />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-[10px] text-text-muted">해석할 때 유의할 점</p>
            <p className="mt-1 text-[12px] leading-5 text-text-secondary">
              Mock 예시 연봉입니다. 기업 규모와 채용 시점에 따라 결과가 달라질 수 있어요.
            </p>
          </div>

          <div className="mt-auto flex justify-end pt-7">
            <button
              type="button"
              disabled
              className="flex min-h-[46px] items-center gap-3 rounded-[9px] bg-text-primary px-5 text-[13px] font-semibold text-white opacity-45"
            >
              이 목표를 대시보드에 저장 <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <section
          aria-labelledby="salary-conditions-title"
          className="rounded-[18px] border border-border px-6 py-[26px]"
        >
          <div className="flex items-center justify-between gap-3 border-b-2 border-border pb-4">
            <h2 id="salary-conditions-title" className="text-[16px] font-medium">
              변경할 조건 선택
            </h2>
            <button
              type="button"
              disabled
              className="text-[10px] text-text-disabled"
            >
              초기화
            </button>
          </div>

          {conditions.map(({ label, summary }) => (
            <button
              key={label}
              type="button"
              disabled
              className="flex min-h-[83px] w-full items-center justify-between gap-3 border-b border-border py-3 text-left"
            >
              <span>
                <span className="block text-[13px] font-bold">{label}</span>
                <span className="mt-2 block text-[11px] text-text-muted">
                  {summary}
                </span>
              </span>
              <span aria-hidden="true" className="text-[15px] text-text-secondary">
                →
              </span>
            </button>
          ))}

          <button
            type="button"
            disabled
            className="flex w-full items-center justify-between gap-3 py-5 text-left text-[12px] font-bold text-brand-strong"
          >
            3개 선택지 한눈에 비교 <span aria-hidden="true">→</span>
          </button>
        </section>
      </div>
    </div>
  );
}