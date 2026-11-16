import type {
  SalaryComparison,
  SalaryComparisonOption,
} from "@/types/salary";

type Props = {
  comparison: SalaryComparison;
  currentOptionKey?: string;
  onBack: () => void;
  onApply: (option: SalaryComparisonOption) => void;
};

const formatManwon = (won: number) =>
  (won / 10_000).toLocaleString("ko-KR", { maximumFractionDigits: 1 });

export default function SalaryOptions({
  comparison,
  currentOptionKey,
  onBack,
  onApply,
}: Props) {
  const { options, basis, notice } = comparison;

  return (
    <section aria-label="준비 선택지 비교">
      <button
        type="button"
        onClick={onBack}
        aria-label="연봉 시뮬레이터로 돌아가기"
        className="cursor-pointer px-2 py-1 text-[20px] hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
      >
        ←
      </button>

      <div className="mt-5 border-y border-text-primary">
        {options.length === 0 ? (
          <p
            role="status"
            className="py-10 text-center text-[13px] text-text-secondary"
          >
            현재 스펙에서 비교할 수 있는 준비 선택지가 없어요.
          </p>
        ) : (
          <div className="grid auto-cols-fr divide-y divide-border md:grid-flow-col md:divide-x md:divide-y-0">
            {options.map((option, index) => {
              const selected = option.optionKey === currentOptionKey;
              const cost =
                option.estimatedCost === 0
                  ? option.costNote
                  : `약 ${formatManwon(option.estimatedCost)}만 원`;

              return (
                <article
                  key={option.optionKey}
                  className={`min-w-0 px-7 pt-7 pb-12 sm:px-[30px] lg:min-h-[444px] ${
                    selected ? "bg-brand-soft/60" : ""
                  }`}
                >
                  <div className="flex min-h-6 items-center justify-between gap-2">
                    <p className="text-[10px] text-text-muted">
                      선택지 {index + 1}
                    </p>
                    {selected && (
                      <span className="rounded-full bg-brand px-2 py-1 text-[10px] text-white">
                        현재 선택
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 min-h-[57px] border-b border-border pb-4 text-[17px] font-medium">
                    {option.title}
                  </h2>
                  <p className="mt-5 text-[10px] text-text-muted">
                    변경 후 예상 초봉
                  </p>
                  <p className="mt-2 text-[25px] font-bold tracking-[-0.04em]">
                    {formatManwon(option.incomeExpected)}만 원
                  </p>
                  <p className="mt-1 text-[12px] font-bold text-brand-strong">
                    {option.delta > 0 ? "+" : ""}
                    {formatManwon(option.delta)}만 원
                  </p>

                  <dl className="mt-5 divide-y divide-border border-y border-border text-[11px]">
                    {[
                      ["준비 기간", option.prepPeriod],
                      ["예상 비용", cost],
                      ["판단 기준", option.fitDescription],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex min-h-12 items-center justify-between gap-3 py-2"
                      >
                        <dt className="shrink-0 text-text-muted">{label}</dt>
                        <dd className="text-right font-semibold">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <button
                    type="button"
                    disabled={selected}
                    onClick={() => onApply(option)}
                    aria-label={
                      selected ? undefined : `${option.title} 선택지로 바꾸기`
                    }
                    className="mt-5 text-[12px] font-bold text-brand-strong transition-[filter] duration-150 enabled:cursor-pointer enabled:hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong disabled:text-text-disabled"
                  >
                    {selected ? "적용 중인 선택지" : "이 선택지로 바꾸기"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-3 text-right text-[10px] text-text-muted">
        {basis} · {notice}
      </p>
    </section>
  );
}