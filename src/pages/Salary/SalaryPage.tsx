import { useState } from "react";
import SalaryChart from "@/components/SalaryChart";
import { salaryConditions } from "@/mocks/salaryConditions";
import type {
  SalaryCondition,
  SalaryConditionField,
  SalaryConditionOption,
} from "@/types/salary";
import SalaryConditionDrawer from "./components/SalaryConditionDrawer";

const startingSalary = 36_000_000;

const baseSalary = [
  { year: 0, salary: startingSalary },
  { year: 3, salary: 44_500_000 },
  { year: 5, salary: 54_500_000 },
];

export default function SalaryPage() {
  const [openCondition, setOpenCondition] = useState<SalaryCondition | null>(null);
  const [selection, setSelection] = useState<
    Partial<Record<SalaryConditionField, SalaryConditionOption[]>>
  >({});

  const hasChanges = Object.values(selection).some(
    (options) => options.length > 0,
  );

  const applyCondition = (options: SalaryConditionOption[]) => {
    if (!openCondition) return;

    setSelection((previous) => ({
      ...previous,
      [openCondition.field]: options,
    }));
    setOpenCondition(null);
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-text-primary pt-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-[12px] font-bold text-brand-strong">
            비교 기준
          </span>
          <label htmlFor="salary-company" className="text-[14px] font-bold">
            어떤 기업군을 목표로 하나요?
          </label>
          <select
            id="salary-company"
            disabled
            className="h-10 min-w-[190px] rounded-lg bg-bg-section px-4 text-[13px] font-semibold"
          >
            <option>중견 IT 서비스</option>
          </select>
        </div>

        <p className="rounded-full bg-brand-soft px-3.5 py-2 text-[12px] text-brand-strong">
          비교한 조건은 내 스펙에 저장되지 않아요
        </p>
      </div>

      <div className="mt-[38px] grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)]">
        <section
          aria-labelledby="salary-projection-title"
          className="flex min-w-0 flex-col rounded-[18px] border border-border px-5 py-7 sm:px-[34px] lg:min-h-[620px]"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="salary-projection-title" className="text-[15px] font-bold">
              조건 변경에 따른 예상 변화
            </h2>
            <span className="text-[12px] text-text-secondary">
              세전 기본급 기준
            </span>
          </div>

          <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-end gap-4 pb-6 sm:gap-8">
            <div>
              <p className="text-[13px] text-text-secondary">현재 예상 초봉</p>
              <p className="mt-2 text-[25px] font-bold tracking-[-0.04em] sm:text-[32px]">
                {(startingSalary / 10_000).toLocaleString("ko-KR")}
                <span className="ml-0.5 text-[13px] tracking-normal">만 원</span>
              </p>
            </div>
            <span aria-hidden="true" className="pb-1 text-[17px]">→</span>
            <div>
              <p className="text-[13px] text-text-secondary">
                변경 후 예상 초봉
              </p>
              <p className="mt-2 text-[25px] font-bold text-brand-strong sm:text-[32px]">
                –
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-5 pb-3">
            <div className="mx-auto max-w-[560px]">
              <SalaryChart data={baseSalary} />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-[12px] text-text-secondary">해석할 때 유의할 점</p>
            <p className="mt-1 text-[13px] leading-5 text-text-secondary">
              Mock 예시 연봉입니다. 기업 규모와 채용 시점에 따라 결과가 달라질 수 있어요.
            </p>
          </div>

          <div className="mt-auto flex justify-end pt-7">
            <button
              type="button"
              disabled
              className="flex min-h-[46px] items-center gap-3 rounded-[9px] bg-text-primary px-5 text-[14px] font-semibold text-white opacity-45"
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
            <h2 id="salary-conditions-title" className="text-[17px] font-medium">
              변경할 조건 선택
            </h2>
            <button
              type="button"
              disabled={!hasChanges}
              onClick={() => setSelection({})}
              className="text-[12px] text-text-secondary enabled:cursor-pointer enabled:hover:text-brand-strong disabled:text-text-disabled"
            >
              초기화
            </button>
          </div>

          {salaryConditions.map((condition) => {
            const summary = selection[condition.field]
              ?.map((option) => option.summary ?? option.label)
              .join(", ");

            return (
              <button
                key={condition.field}
                type="button"
                aria-haspopup="dialog"
                onClick={() => setOpenCondition(condition)}
                className="group flex min-h-[83px] w-full cursor-pointer items-center justify-between gap-3 border-b border-border py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
              >
                <span className="min-w-0">
                  <span className="block text-[15px] font-bold transition-colors duration-150 group-hover:text-brand-strong group-focus-visible:text-brand-strong">
                    {condition.label}
                  </span>
                  <span className="mt-2 block break-words text-[13px] text-text-secondary">
                    {summary || condition.defaultSummary}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-[16px] text-text-secondary transition-[color,translate] duration-150 group-hover:text-brand-strong group-focus-visible:text-brand-strong motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1"
                >
                  →
                </span>
              </button>
            );
          })}

          <button
            type="button"
            disabled
            className="flex w-full items-center justify-between gap-3 py-5 text-left text-[14px] font-bold text-brand-strong"
          >
            3개 선택지 한눈에 비교 <span aria-hidden="true">→</span>
          </button>
        </section>
      </div>

      {openCondition && (
        <SalaryConditionDrawer
          key={openCondition.field}
          condition={openCondition}
          selected={selection[openCondition.field] ?? []}
          onClose={() => setOpenCondition(null)}
          onApply={applyCondition}
        />
      )}
    </div>
  );
}