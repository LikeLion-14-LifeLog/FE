import { useState } from "react";
import type { SalaryTargetSaveData } from "@/types/salaryApi";

type Props = {
  comparison: SalaryTargetSaveData;
  onBack: () => void;
};

const formatManwon = (won: number) =>
  (won / 10_000).toLocaleString("ko-KR", { maximumFractionDigits: 1 });

export default function SalaryOptions({ comparison, onBack }: Props) {
  const { options, salaryNotice, preparationNotice } = comparison;
  const [selectedId, setSelectedId] = useState(
    comparison.selectedTargetSpecProfileId
  );

  return (
    <section aria-label="설정한 조건과 AI 추천 선택지 비교">
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
            비교할 수 있는 선택지가 없어요.
          </p>
        ) : (
          <div className="grid auto-cols-fr divide-y divide-border md:grid-flow-col md:divide-x md:divide-y-0">
            {options.map((option) => {
              const selected = option.targetSpecProfileId === selectedId;

              return (
                <article
                  key={option.targetSpecProfileId}
                  className={`min-w-0 px-7 pt-7 pb-12 sm:px-[30px] lg:min-h-[444px] ${
                    selected ? "bg-brand-soft/60" : ""
                  }`}
                >
                  <div className="flex min-h-6 items-center justify-between gap-2">
                    <p className="text-[10px] text-text-muted">
                      {option.source === "USER_INPUT"
                        ? "내가 설정한 조건"
                        : `AI 추천 선택지 ${option.slotNumber - 1}`}
                    </p>
                    {selected && (
                      <span className="rounded-full bg-brand px-2 py-1 text-[10px] text-white">
                        미리 선택
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
                    {formatManwon(option.expectedStartingSalary)}만 원
                  </p>
                  <p className="mt-1 text-[12px] font-bold text-brand-strong">
                    {option.salaryIncreaseAmount > 0 ? "+" : ""}
                    {formatManwon(option.salaryIncreaseAmount)}만 원
                  </p>

                  <dl className="mt-5 divide-y divide-border border-y border-border text-[11px]">
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
                        <dd className="text-right font-semibold">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <button
                    type="button"
                    disabled={selected}
                    onClick={() => setSelectedId(option.targetSpecProfileId)}
                    aria-label={
                      selected ? undefined : `${option.title} 미리 선택하기`
                    }
                    className="mt-5 text-[12px] font-bold text-brand-strong transition-[filter] duration-150 enabled:cursor-pointer enabled:hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong disabled:text-text-disabled"
                  >
                    {selected ? "미리 선택됨" : "미리 선택하기"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-3 text-right text-[11px] text-text-secondary">
        선택 상태는 화면에서만 변경되며, 실제 목표 스펙에 적용되거나 저장되지
        않습니다.
      </p>
      <p className="mt-2 text-right text-[10px] text-text-muted">
        {salaryNotice} {preparationNotice}
      </p>
    </section>
  );
}
