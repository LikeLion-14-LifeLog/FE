import { useState } from "react";
import { getSavedSpecProfileMock } from "@/apis/spec";
import type { SalaryTargetSaveData } from "@/types/salaryApi";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  buildSalaryChanges,
  buildSalarySimulationRequest,
  sameSalaryChanges,
  validateSalaryAdditions,
} from "@/apis/salarySimulation";
import chevronDown from "@/assets/icons/chevronDown.svg";
import SalaryChart from "@/components/SalaryChart";
import { salaryConditions } from "@/mocks/salaryConditions";
import {
  getSalarySimulationMock,
  getSalaryTargetSaveMock,
  salarySimulationRequestMock,
} from "@/mocks/salaryApi";
import { useCurrentUser } from "@/store/authStore";
import type {
  SalaryChanges,
  SalaryCondition,
  SalaryConditionField,
  SalaryConditionOption,
} from "@/types/salary";
import SalaryConditionDrawer from "./components/SalaryConditionDrawer";
import SalaryAcademicDrawer from "./components/SalaryAcademicDrawer";
import SalaryExperienceDrawer from "./components/SalaryExperienceDrawer";
import SalaryOptions from "./components/SalaryOptions";

const changeKeyByField = {
  EXPERIENCE: "experiences",
  CERTIFICATE: "addCertificateIds",
  LANGUAGE: "languageScores",
  ACADEMIC: "academic",
} as const satisfies Record<SalaryConditionField, keyof SalaryChanges>;

const formatManwon = (won: number) =>
  (won / 10_000).toLocaleString("ko-KR", { maximumFractionDigits: 1 });

function getSelectedOptions(
  { field, options }: SalaryCondition,
  changes: SalaryChanges,
) {
  if (field === "CERTIFICATE") {
    const selectedIds = new Set(changes.addCertificateIds);

    return options.filter(({ changes: optionChanges }) => {
      const ids = optionChanges.addCertificateIds ?? [];
      return ids.length > 0 && ids.every((id) => selectedIds.has(id));
    });
  }

  if (field === "EXPERIENCE") return [];

  if (field === "LANGUAGE") {
    return (changes.languageScores ?? []).flatMap((score) => {
      const option = options.find(
        (item) =>
          item.changes.languageScores?.[0]?.languageExamId ===
          score.languageExamId,
      );
      if (!option) return [];
      return [
        {
          ...option,
          summary: `${option.label} ${score.scoreNumeric !== null ? `${score.scoreNumeric}점` : (score.scoreGrade ?? "")}`,
          changes: { languageScores: [score] },
        },
      ];
    });
  }

  if (field === "ACADEMIC") {
    return options
      .filter(
        (option) => option.changes.academic?.type === changes.academic?.type,
      )
      .map((option) => ({
        ...option,
        summary:
          changes.academic?.type === "UNIVERSITY"
            ? `학점 ${changes.academic.universityGrade}로 상향`
            : option.summary,
        changes: { academic: changes.academic },
      }));
  }

  const key = changeKeyByField[field];
  const change = changes[key];

  if (change == null) return [];

  return options.filter((option) =>
    sameSalaryChanges(option.changes, { [key]: change }),
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
  const email = useCurrentUser()?.email;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isComparing = searchParams.get("view") === "compare";
  const [companyGroup, setCompanyGroup] = useState<"SMALL" | "LARGE">("LARGE");
  const [openCondition, setOpenCondition] = useState<SalaryCondition | null>(
    null,
  );
  const [changes, setChanges] = useState<SalaryChanges>({});
  const [comparisonCache, setComparisonCache] = useState<{
    key: string;
    data: SalaryTargetSaveData;
  } | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  const profile = email ? getSavedSpecProfileMock(email) : null;
  const hasChanges = !sameSalaryChanges(changes, {});
  const conditionError = hasChanges
    ? validateSalaryAdditions(changes, profile)
    : null;
  const request = buildSalarySimulationRequest(
    changes,
    companyGroup,
    salarySimulationRequestMock.baseSpecProfileId,
    profile?.educations ?? [],
  );
  const result = request ? getSalarySimulationMock(request) : null;
  const comparisonKey = request ? JSON.stringify(request) : null;
  const compareParams = new URLSearchParams(searchParams);
  compareParams.set("view", "compare");

  const openComparison = async () => {
    if (comparisonLoading) return;

    if (conditionError) {
      setComparisonError(conditionError);
      return;
    }
    if (!request || !comparisonKey) {
      setComparisonError(
        "현재 조건에 대응하는 비교 Mock이 없어요. 실제 API 연동 후 이용할 수 있습니다.",
      );
      return;
    }

    const showComparison = () =>
      navigate(
        { pathname: "/salary", search: `?${compareParams.toString()}` },
        { state: { fromSalarySimulator: true }, preventScrollReset: true },
      );

    if (comparisonCache?.key === comparisonKey) {
      showComparison();
      return;
    }

    setComparisonLoading(true);
    setComparisonError(null);
    try {
      const data = await getSalaryTargetSaveMock(request);
      if (!data) {
        setComparisonError(
          "현재 조건에 대응하는 비교 Mock이 없어요. 실제 API 연동 후 이용할 수 있습니다.",
        );
        return;
      }
      setComparisonCache({ key: comparisonKey, data });
      showComparison();
    } catch {
      setComparisonError("비교 결과를 불러오지 못했어요. 다시 시도해 주세요.");
    } finally {
      setComparisonLoading(false);
    }
  };

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

    setComparisonError(null);
    setOpenCondition(null);
  };

  const applyExperiences = (experiences: SalaryChanges["experiences"]) => {
    setChanges((previous) => {
      const next = { ...previous };
      delete next.experience;
      delete next.experiences;
      return experiences?.length ? { ...next, experiences } : next;
    });
    setComparisonError(null);
    setOpenCondition(null);
  };

  if (isComparing) {
    const comparison =
      comparisonCache?.key === comparisonKey ? comparisonCache.data : null;

    return (
      <>
        <SalaryTitle comparing />
        {comparison ? (
          <SalaryOptions comparison={comparison} onBack={closeComparison} />
        ) : (
          <div className="rounded-xl border border-border px-6 py-12 text-center">
            <p role="status" className="text-[14px] text-text-secondary">
              현재 설정한 조건에 해당하는 비교 Mock 데이터가 없어요.
            </p>
            <p className="mt-2 text-[12px] text-text-muted">
              Mock은 명세에 제시된 백엔드 개발 인턴 예시와 입력 내용이 일치할
              때만 제공됩니다.
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

  const baseResults = result?.base.salaryResults ?? [];
  const simulatedResults = result?.simulated?.salaryResults ?? [];
  const startingSalary = baseResults.find(
    ({ annual }) => annual === 0,
  )?.annualIncomeExpected;
  const changedSalary = simulatedResults.find(
    ({ annual }) => annual === 0,
  )?.annualIncomeExpected;
  const salaryDelta =
    startingSalary !== undefined && changedSalary !== undefined
      ? changedSalary - startingSalary
      : null;
  const chartData = baseResults.map((item) => ({
    year: item.annual,
    salary: item.annualIncomeExpected,
    lower: item.annualIncomeMin,
    upper: item.annualIncomeMax,
  }));
  const comparisonData = result?.simulated
    ? simulatedResults
        .filter(({ annual }) => annual === 0)
        .map(({ annual, annualIncomeExpected }) => ({
          year: annual,
          salary: annualIncomeExpected,
        }))
    : null;
  const previewMessage =
    conditionError ??
    (!request && changes.academic?.type === "UNIVERSITY"
      ? "학점 변경은 현재 스펙에 유효한 학사 정보가 하나 등록되어 있어야 적용할 수 있어요."
      : !result
        ? "현재 입력한 조건에 대응하는 예측 Mock이 없어요. 입력 내용은 유지되며, 실제 예측은 API 연동 후 제공됩니다."
        : result.simulated
          ? [
              result.preparationPeriod,
              result.estimatedCost,
              result.decisionCriteria,
            ]
              .filter(Boolean)
              .join(" · ")
          : "현재 스펙 기준 예상 연봉입니다. 조건을 추가하면 비교할 수 있어요.");

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
              disabled={comparisonLoading}
              value={companyGroup}
              onChange={(event) => {
                setCompanyGroup(
                  event.target.value === "LARGE" ? "LARGE" : "SMALL",
                );
                setComparisonError(null);
              }}
              className="h-10 min-w-[190px] cursor-pointer appearance-none rounded-lg bg-bg-section pr-10 pl-4 text-[13px] font-semibold"
            >
              <option value="SMALL">중소기업</option>
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
              AI 예측 연봉
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
                  {changedSalary === undefined
                    ? "–"
                    : formatManwon(changedSalary)}
                  {changedSalary !== undefined && (
                    <span className="ml-0.5 text-[13px]">만 원</span>
                  )}
                </p>
                {salaryDelta !== null && (
                  <span className="rounded-full bg-brand-soft px-2.5 py-1.5 text-[11px] text-brand-strong">
                    {salaryDelta > 0 ? "+" : ""}
                    {formatManwon(salaryDelta)}만 원
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
              {previewMessage}
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
              disabled={!hasChanges || comparisonLoading}
              onClick={() => {
                setChanges({});
                setComparisonError(null);
              }}
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
                    {},
                  );

            return (
              <button
                key={condition.field}
                type="button"
                aria-haspopup="dialog"
                disabled={comparisonLoading}
                onClick={() => setOpenCondition(condition)}
                className="group flex min-h-[88px] w-full cursor-pointer items-center justify-between gap-3 border-b border-border py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong disabled:cursor-not-allowed disabled:opacity-40"
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

          <button
            type="button"
            onClick={openComparison}
            disabled={!hasChanges || !!conditionError || comparisonLoading}
            className="flex w-full items-center justify-between gap-3 py-5 text-left text-[14px] font-bold text-brand-strong transition-[filter] duration-150 enabled:cursor-pointer enabled:hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong disabled:cursor-not-allowed disabled:opacity-40"
          >
            {comparisonLoading
              ? "비교 결과 불러오는 중..."
              : "설정한 조건과 AI 추천 선택지 비교"}
            <span aria-hidden="true">→</span>
          </button>
          {conditionError && (
            <p role="alert" className="pb-4 text-[12px] text-red-500">
              {conditionError}
            </p>
          )}
          {comparisonError && (
            <p role="alert" className="pb-4 text-[12px] text-red-500">
              {comparisonError}
            </p>
          )}
        </section>
      </div>

      {openCondition?.field === "ACADEMIC" ? (
        <SalaryAcademicDrawer
          condition={openCondition}
          selected={getSelectedOptions(openCondition, changes)}
          currentBachelor={
            profile?.educations.find((item) => item.type === "UNIVERSITY") ??
            null
          }
          bachelorCount={
            profile?.educations.filter((item) => item.type === "UNIVERSITY")
              .length ?? 0
          }
          hasGraduateDegree={
            !!profile?.educations.some(
              (item) =>
                item.type === "GRADUATE_SCHOOL_MASTER" ||
                item.type === "GRADUATE_SCHOOL_DOCTORAL",
            )
          }
          onClose={() => setOpenCondition(null)}
          onApply={applyCondition}
        />
      ) : openCondition?.field === "EXPERIENCE" ? (
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
          currentLanguages={profile?.languageScores ?? []}
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
