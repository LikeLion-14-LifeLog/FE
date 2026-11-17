import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  buildSalaryChanges,
  getSalarySimulationMock,
  sameSalaryChanges,
} from "@/apis/salarySimulation";
import chevronDown from "@/assets/icons/chevronDown.svg";
import SalaryChart from "@/components/SalaryChart";
import { salaryConditions } from "@/mocks/salaryConditions";
import {
  salarySimulationRequestMock,
  salaryTargetSaveResponseMock,
} from "@/mocks/salaryApi";
import { useCurrentUser } from "@/store/authStore";
import type {
  SalaryChanges,
  SalaryCondition,
  SalaryConditionField,
  SalaryConditionOption,
} from "@/types/salary";
import SalaryConditionDrawer from "./components/SalaryConditionDrawer";
import SalaryExperienceDrawer from "./components/SalaryExperienceDrawer";
import SalaryOptions from "./components/SalaryOptions";

const changeKeyByField = {
  EXPERIENCE: "experiences",
  CERTIFICATE: "addCertificateIds",
  LANGUAGE: "languageScore",
  ACADEMIC: "academic",
} as const satisfies Record<SalaryConditionField, keyof SalaryChanges>;

const formatManwon = (won: number) =>
  (won / 10_000).toLocaleString("ko-KR", { maximumFractionDigits: 1 });

function getSelectedOptions(
  { field, options }: SalaryCondition,
  changes: SalaryChanges
) {
  if (field === "CERTIFICATE") {
    const selectedIds = new Set(changes.addCertificateIds);

    return options.filter(({ changes: optionChanges }) => {
      const ids = optionChanges.addCertificateIds ?? [];
      return ids.length > 0 && ids.every((id) => selectedIds.has(id));
    });
  }

  if (field === "EXPERIENCE") return [];

  const key = changeKeyByField[field];
  const change = changes[key];

  if (change == null) return [];

  return options.filter((option) =>
    sameSalaryChanges(option.changes, { [key]: change })
  );
}

function SalaryTitle({ comparing }: { comparing: boolean }) {
  return (
    <header className="mb-[18px] flex flex-col">
      <p className="pt-[7px] text-[10px] leading-[15px] font-extrabold tracking-[1.6px] text-brand-strong uppercase">
        {comparing ? "Option Comparison" : "Salary Simulator"}
      </p>
      <h1 className="mt-2 text-[30px] leading-[37.5px] font-extrabold tracking-[-0.6px] text-text-primary">
        {comparing
          ? "설정한 조건과 AI 추천 선택지를 비교해보세요"
          : "조건을 바꾸면, 연봉은 얼마나 달라질까요?"}
      </h1>
      <p className="mt-2 text-[15.5px] leading-6 text-text-secondary">
        {comparing
          ? "연봉 상승폭만이 아니라 준비 기간과 비용, 실제 활용도를 함께 확인하세요."
          : "궁금한 조건을 켜고 끄며 예상 변화와 준비 비용을 함께 살펴보세요."}
      </p>
    </header>
  );
}

function SalarySimulator() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isComparing = searchParams.get("view") === "compare";
  const [companyGroup, setCompanyGroup] = useState<"SMB_SOLUTION" | "LARGE">(
    "SMB_SOLUTION"
  );
  const [openCondition, setOpenCondition] = useState<SalaryCondition | null>(
    null
  );
  const [changes, setChanges] = useState<SalaryChanges>({});

  const hasChanges = !sameSalaryChanges(changes, {});

  const closeComparison = () => {
    if (location.state?.fromSalarySimulator === true) {
      navigate(-1);
      return;
    }

    const next = new URLSearchParams(searchParams);
    next.delete("view");
    setSearchParams(next, { replace: true, preventScrollReset: true });
  };

  const applyCondition = (options: SalaryConditionOption[]) => {
    if (!openCondition) return;

    const key = changeKeyByField[openCondition.field];
    const applied = buildSalaryChanges(options);

    setChanges((previous) => {
      const next = { ...previous };
      delete next[key];

      return { ...next, ...applied };
    });

    setOpenCondition(null);
  };

  const applyExperiences = (experiences: SalaryChanges["experiences"]) => {
    setChanges((previous) => {
      const next = { ...previous };
      delete next.experience;
      delete next.experiences;
      return experiences?.length ? { ...next, experiences } : next;
    });
    setOpenCondition(null);
  };

  if (isComparing) {
    const sampleChanges = salarySimulationRequestMock.changes;
    const matchesMock =
      companyGroup === salarySimulationRequestMock.companyGroupScale &&
      sameSalaryChanges(changes, sampleChanges);

    return (
      <>
        <SalaryTitle comparing />
        {matchesMock ? (
          <SalaryOptions
            comparison={salaryTargetSaveResponseMock.data}
            onBack={closeComparison}
          />
        ) : (
          <div className="rounded-xl border border-border px-6 py-12 text-center">
            <p role="status" className="text-[14px] text-text-secondary">
              현재 설정한 조건에 해당하는 비교 Mock 데이터가 없어요.
            </p>
            <p className="mt-2 text-[12px] text-text-muted">
              실제 API 연동 전까지는 백엔드 명세의 인턴 6개월 예시만 확인할 수
              있어요.
            </p>
            <button
              type="button"
              onClick={closeComparison}
              className="mt-6 cursor-pointer text-[13px] font-bold text-brand-strong"
            >
              조건 변경으로 돌아가기
            </button>
          </div>
        )}
      </>
    );
  }

  const compareParams = new URLSearchParams(searchParams);
  compareParams.set("view", "compare");

  const result = getSalarySimulationMock(changes);
  const changedSalary = result.startingSalary;
  const startingSalary = result.base.find(
    ({ annual }) => annual === 0
  )?.incomeExpected;
  const chartData = result.base.map(({ annual, incomeExpected }) => ({
    year: annual,
    salary: incomeExpected,
  }));
  const comparisonData = changedSalary
    ? [{ year: 0, salary: changedSalary.incomeExpected }]
    : null;

  let previewMessage = "이 조건 조합에 해당하는 변경 후 Mock 예시가 없어요.";

  if (changedSalary) {
    previewMessage = changedSalary.combined
      ? "조건별 초봉 상승폭을 단순 합산한 Mock 예시입니다."
      : "변경 후 수치는 첫 취업 초봉 예시만 제공돼요.";
  }

  return (
    <div className="w-full lg:-mb-8">
      <SalaryTitle comparing={false} />

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
                setCompanyGroup(
                  event.target.value === "LARGE" ? "LARGE" : "SMB_SOLUTION"
                )
              }
              className="h-10 min-w-[190px] cursor-pointer appearance-none rounded-lg bg-bg-section pr-10 pl-4 text-[13px] font-semibold"
            >
              <option value="SMB_SOLUTION">중견 IT 서비스</option>
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
                {startingSalary === undefined
                  ? "–"
                  : formatManwon(startingSalary)}
                {startingSalary !== undefined && (
                  <span className="ml-0.5 text-[13px] tracking-normal">
                    만 원
                  </span>
                )}
              </p>
            </div>

            <span aria-hidden="true" className="pb-1 text-[17px]">
              →
            </span>

            <div>
              <p className="text-[13px] text-text-secondary">
                변경 후 예상 초봉
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-[26px] font-bold text-brand-strong sm:text-[34px]">
                  {changedSalary
                    ? formatManwon(changedSalary.incomeExpected)
                    : "–"}
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

          <div className="border-t border-border pt-4 sm:min-h-[63px]">
            <p className="text-[12px] text-text-secondary">
              해석할 때 유의할 점
            </p>
            <p
              role="status"
              className="mt-1 text-[13px] leading-5 text-text-secondary"
            >
              {hasChanges
                ? previewMessage
                : `기업군 공통 Mock 예시 연봉입니다. ${result.notice}`}
            </p>
          </div>
        </section>

        <section
          aria-labelledby="salary-conditions-title"
          className="rounded-[18px] border border-border px-6 py-[26px]"
        >
          <div className="flex items-center justify-between gap-3 border-b-2 border-border pb-5">
            <h2
              id="salary-conditions-title"
              className="text-[17px] font-medium"
            >
              변경할 조건 선택
            </h2>
            <button
              type="button"
              disabled={!hasChanges}
              onClick={() => setChanges({})}
              className="text-[12px] text-text-secondary enabled:cursor-pointer enabled:hover:text-brand-strong disabled:text-text-disabled"
            >
              초기화
            </button>
          </div>

          {salaryConditions.map((condition) => {
            const selected = getSelectedOptions(condition, changes);
            const summary =
              condition.field === "EXPERIENCE"
                ? (changes.experiences?.map((item) => item.title).join(", ") ??
                  "")
                : selected
                    .map((option) => option.summary ?? option.label)
                    .join(", ");
            const hasFieldChange =
              condition.field === "EXPERIENCE"
                ? !!changes.experiences?.length
                : !sameSalaryChanges(
                    {
                      [changeKeyByField[condition.field]]:
                        changes[changeKeyByField[condition.field]],
                    },
                    {}
                  );

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
                    {summary ||
                      (hasFieldChange
                        ? "변경 조건 적용됨"
                        : condition.defaultSummary)}
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

          <Link
            to={{ pathname: "/salary", search: `?${compareParams.toString()}` }}
            state={{ fromSalarySimulator: true }}
            preventScrollReset
            className="flex w-full items-center justify-between gap-3 py-5 text-left text-[14px] font-bold text-brand-strong transition-[filter] duration-150 hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
          >
            설정한 조건과 AI 추천 선택지 비교 <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>

      {openCondition?.field === "EXPERIENCE" ? (
        <SalaryExperienceDrawer
          selected={changes.experiences ?? []}
          onClose={() => setOpenCondition(null)}
          onApply={applyExperiences}
        />
      ) : openCondition ? (
        <SalaryConditionDrawer
          key={openCondition.field}
          condition={openCondition}
          selected={getSelectedOptions(openCondition, changes)}
          onClose={() => setOpenCondition(null)}
          onApply={applyCondition}
        />
      ) : null}
    </div>
  );
}

export default function SalaryPage() {
  const email = useCurrentUser()?.email;

  return (
    <SalarySimulator key={email === undefined ? "guest" : `user:${email}`} />
  );
}
