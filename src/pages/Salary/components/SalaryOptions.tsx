import type { SalaryTargetSaveData } from "@/types/salaryApi";

type Props = {
  comparison: SalaryTargetSaveData;
  onBack: () => void;
};

const formatManwon = (won: number) =>
  (won / 10_000).toLocaleString("ko-KR", { maximumFractionDigits: 1 });

export default function SalaryOptions({ comparison, onBack }: Props) {
  const { options, salaryNotice, preparationNotice } = comparison;

  return (
    <section aria-label="설정한 조건과 AI 추천 선택지 비교">
      <button
        type="button"
        onClick={onBack}
        aria-label="연봉 시뮬레이터로 돌아가기"
        className="cursor-pointer px-2 py-1 text-[21px] hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
      >
        ←
      </button>

      <div className="mt-5 border-y border-text-primary">
        {options.length === 0 ? (
          <p
            role="status"
            className="py-10 text-center text-[14px] text-text-secondary"
          >
            비교할 수 있는 선택지가 없어요.
          </p>
        ) : (
          <div className="grid auto-cols-fr divide-y divide-border md:grid-flow-col md:divide-x md:divide-y-0">
            {options.map((option) => (
              <article
                key={option.slotNumber}
                className={`min-w-0 px-7 pt-7 pb-12 sm:px-[30px] lg:min-h-[444px] ${
                  option.source === "AI_RECOMMENDATION"
                    ? "bg-brand-soft/60"
                    : "bg-white"
                }`}
              >
                <div className="flex min-h-6 items-center justify-between gap-2">
                  <p className="text-[12px] font-semibold text-text-primary">
                    {option.source === "USER_INPUT"
                      ? "내가 설정한 조건"
                      : `AI 추천 선택지 ${option.slotNumber - 1}`}
                  </p>
                  {option.source === "USER_INPUT" && (
                    <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white">
                      현재 조건
                    </span>
                  )}
                </div>

                <h2 className="mt-3 min-h-[57px] border-b border-border pb-4 text-[18px] font-medium text-text-primary">
                  {option.title}
                </h2>

                <p className="mt-5 text-[11px] text-text-muted">
                  변경 후 예상 초봉
                </p>
                <p className="mt-2 text-[26px] font-bold tracking-[-0.04em] text-text-primary">
                  {formatManwon(option.expectedStartingSalary)}만 원
                </p>
                <p className="mt-1 text-[13px] font-bold text-brand-strong">
                  {option.salaryIncreaseAmount > 0 ? "+" : ""}
                  {formatManwon(option.salaryIncreaseAmount)}만 원
                </p>

                <dl className="mt-5 divide-y divide-border border-y border-border text-[12px]">
                  {[
                    ["준비 기간", option.preparationPeriod],
                    ["예상 비용", option.estimatedCost],
                    ["판단 기준", option.decisionCriteria],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex min-h-12 items-center justify-between gap-3 py-2"
                    >
                      <dt className="shrink-0 text-text-muted">{label}</dt>
                      <dd className="text-right font-semibold text-text-primary">{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        )}
      </div>

      <p className="mt-3 text-right text-[11px] leading-relaxed text-text-muted">
        {salaryNotice} {preparationNotice}
      </p>
    </section>
  );
}
