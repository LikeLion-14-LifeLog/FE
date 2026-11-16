import { useState } from "react";
import {
  buildSalaryChanges,
  getSalarySimulationMock,
} from "@/apis/salarySimulation";
import chevronDown from "@/assets/icons/chevronDown.svg";
import SalaryChart from "@/components/SalaryChart";
import { salaryConditions } from "@/mocks/salaryConditions";
import type {
  SalaryCondition,
  SalaryConditionField,
  SalaryConditionOption,
} from "@/types/salary";
import SalaryConditionDrawer from "./components/SalaryConditionDrawer";

type Selection = Partial<Record<SalaryConditionField, SalaryConditionOption[]>>;

const formatManwon = (won: number) =>
  (won / 10_000).toLocaleString("ko-KR", { maximumFractionDigits: 1 });

export default function SalaryPage() {
  const [companyGroup, setCompanyGroup] = useState<"" | "LARGE">("");
  const [openCondition, setOpenCondition] = useState<SalaryCondition | null>(null);
  const [selection, setSelection] = useState<Selection>({});

  const selectedOptions = Object.values(selection).flat();
  const hasChanges = selectedOptions.length > 0;
  const changes = buildSalaryChanges(selectedOptions);
  const result = getSalarySimulationMock(companyGroup, changes);

  const startingSalary = result.base.find(
    ({ annual }) => annual === 0,
  )?.incomeExpected;
  const changedSalary = result.startingSalary;
  const chartData = result.base.map(({ annual, incomeExpected }) => ({
    year: annual,
    salary: incomeExpected,
  }));
  const comparisonData = changedSalary
    ? [{ year: 0, salary: changedSalary.incomeExpected }]
    : null;

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
          <span className="relative -top-px text-[12px] font-bold text-brand-strong">
            비교 기준
          </span>
          <label htmlFor="salary-company" className="text-[14px] font-bold">
            어떤 기업군을 목표로 하나요?
          </label>

          <div className="relative">
            <select
              id="salary-company"
              value={companyGroup}
              onChange={(event) =>
                setCompanyGroup(event.target.value === "LARGE" ? "LARGE" : "")
              }
              className="h-10 min-w-[190px] cursor-pointer appearance-none rounded-lg bg-bg-section pr-10 pl-4 text-[13px] font-semibold"
            >
              <option value="">중견 IT 서비스</option>
              <option value="LARGE">대기업</option>
            </select>
            <img
              src={chevronDown}
              alt=""
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
            />
          </div>
        </div>

        <p className="rounded-full bg-brand-soft px-3.5 py-2 text-[12px] text-brand-strong">
          비교한 조건은 내 스펙에 저장되지 않아요
        </p>
      </div>

      <div className="mt-[38px] grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,410px)] lg:gap-8">
        <section
          aria-labelledby="salary-projection-title"
          className="min-w-0 rounded-[18px] border border-border px-5 py-7 sm:px-[34px]"
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
              <p className="mt-2 text-[26px] font-bold tracking-[-0.04em] sm:text-[34px]">
                {startingSalary === undefined ? "–" : formatManwon(startingSalary)}
                {startingSalary !== undefined && (
                  <span className="ml-0.5 text-[13px] tracking-normal">만 원</span>
                )}
              </p>
            </div>

            <span aria-hidden="true" className="pb-1 text-[17px]">→</span>

            <div>
              <p className="text-[13px] text-text-secondary">
                변경 후 예상 초봉
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-[26px] font-bold text-brand-strong sm:text-[34px]">
                  {changedSalary ? formatManwon(changedSalary.incomeExpected) : "–"}
                  {changedSalary && (
                    <span className="ml-0.5 text-[13px]">만 원</span>
                  )}
                </p>
                {changedSalary && (
                  <span className="rounded-full bg-brand-soft px-2.5 py-1.5 text-[11px] text-brand-strong">
                    {changedSalary.delta > 0 ? "+" : ""}
                    {formatManwon(changedSalary.delta)}만 원
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-5 pb-3">
            <div className="mx-auto max-w-[920px]">
              <SalaryChart
                data={chartData}
                comparisonData={comparisonData}
                wide
              />
            </div>
          </div>

          <div className="grid items-start gap-x-5 gap-y-4 border-t border-border pt-4 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <p className="text-[12px] text-text-secondary">
                해석할 때 유의할 점
              </p>
              <p className="mt-1 text-[13px] leading-5 text-text-secondary">
                Mock 예시 연봉입니다. {result.notice}
              </p>
              {hasChanges && (
                <p role="status" className="mt-1 text-[12px] text-text-secondary">
                  {changedSalary
                    ? "이 선택지의 변경 후 수치는 첫 취업 초봉 예시만 제공돼요."
                    : "이 기업군과 조건 조합에 해당하는 변경 후 Mock 예시가 없어요."}
                </p>
              )}
            </div>

            <button
              type="button"
              disabled
              className="flex min-h-[46px] items-center gap-3 justify-self-end rounded-[9px] bg-text-primary px-5 text-[14px] font-semibold text-white opacity-45"
            >
              이 목표를 대시보드에 저장 <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <section
          aria-labelledby="salary-conditions-title"
          className="rounded-[18px] border border-border px-6 py-[26px]"
        >
          <div className="flex items-center justify-between gap-3 border-b-2 border-border pb-5">
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
                className="group flex min-h-[88px] w-full cursor-pointer items-center justify-between gap-3 border-b border-border py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
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