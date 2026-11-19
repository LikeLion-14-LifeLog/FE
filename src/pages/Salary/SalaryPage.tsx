import { useEffect, useMemo, useRef, useState } from "react";
import {
  getCurrentSpecProfileId,
  getSpecProfile,
  type SpecProfileDraft,
} from "@/apis/spec";
import { getAccessToken } from "@/store/authStore";
import { getDiagnosisView, getLatestAnalysisRunId } from "@/apis/diagnosis";
import type {
  SalaryCompanyScale,
  SalaryTargetSaveData,
  SalarySimulationData,
} from "@/types/salaryApi";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  buildSalaryChanges,
  buildSalarySimulationRequest,
  simulateSalary,
  saveSalaryTarget,
  sameSalaryChanges,
  validateSalaryAdditions,
} from "@/apis/salarySimulation";
import chevronDown from "@/assets/icons/chevronDown.svg";
import SalaryChart from "@/components/SalaryChart";
import { salaryConditions } from "@/mocks/salaryConditions";
import { useCurrentUser } from "@/store/authStore";
import type { SalaryResult as DiagnosisSalaryResult } from "@/types/diagnosis";
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

  if (field === "LANGUAGE") {
    return (changes.languageScores ?? []).flatMap((score) => {
      const option = options.find(
        (item) =>
          item.changes.languageScores?.[0]?.languageExamId ===
          score.languageExamId
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
        (option) => option.changes.academic?.type === changes.academic?.type
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
    sameSalaryChanges(option.changes, { [key]: change })
  );
}

function SalaryChartSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="w-full animate-pulse motion-reduce:animate-none"
    >
      <div className="flex justify-end gap-4 pr-[5.7%]">
        <span className="h-2 w-14 rounded-full bg-[#F0F1F2]" />
        <span className="h-2 w-16 rounded-full bg-[#F0F1F2]" />
      </div>
      <svg viewBox="0 0 970 365" className="mt-2 block h-auto w-full">
        {[65, 130, 195, 260].map((y) => (
          <g key={y}>
            <rect
              x="20"
              y={y - 3}
              width="32"
              height="6"
              rx="3"
              fill="#F0F1F2"
            />
            <line
              x1="76"
              x2="915"
              y1={y}
              y2={y}
              stroke="#EDEEF0"
              strokeWidth="1.5"
              strokeDasharray="5 10"
            />
          </g>
        ))}
        <path
          d="M 76 220 C 240 219, 290 172, 495 162 S 760 115, 915 103"
          fill="none"
          stroke="#E7E8EA"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {[
          { x: 76, y: 220 },
          { x: 495, y: 162 },
          { x: 915, y: 103 },
        ].map(({ x, y }) => (
          <circle key={x} cx={x} cy={y} r="7" fill="#E3E5E7" />
        ))}
        {[76, 495, 915].map((x) => (
          <rect
            key={x}
            x={x - 43}
            y="294"
            width="86"
            height="8"
            rx="4"
            fill="#EFF0F1"
          />
        ))}
      </svg>
    </div>
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

function SalarySimulator({ locked = false }: { locked?: boolean }) {
  const location = useLocation();
  const email = useCurrentUser()?.email;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isComparing = searchParams.get("view") === "compare";
  const [companyGroup, setCompanyGroup] = useState<SalaryCompanyScale>(null);
  const [openCondition, setOpenCondition] = useState<SalaryCondition | null>(
    null
  );
  const [changes, setChanges] = useState<SalaryChanges>({});
  const [comparisonCache, setComparisonCache] = useState<{
    key: string;
    data: SalaryTargetSaveData;
  } | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  const [currentSpec, setCurrentSpec] = useState<{
    email: string;
    id: number;
    profile: SpecProfileDraft;
  } | null>(null);
  const [profileError, setProfileError] = useState(false);
  const [simulationRetry, setSimulationRetry] = useState(0);
  const [settledRequests, setSettledRequests] = useState(0);
  const simulationCache = useRef(new Map<string, SalarySimulationData>());
  const inFlight = useRef(false);
  const lastAttempt = useRef<string | null>(null);
  const lastSeenKey = useRef<string | null>(null);
  const currentRequestKey = useRef<string | null>(null);
  const mounted = useRef(false);
  const [simulation, setSimulation] = useState<{
    key: string;
    data: SalarySimulationData | null;
    error: boolean;
  } | null>(null);

  useEffect(() => {
    if (!email || locked) return;
    let active = true;
    const token = getAccessToken();
    if (!token) return;

    Promise.all([getSpecProfile(token), getCurrentSpecProfileId()])
      .then(([profile, id]) => {
        if (active) setCurrentSpec({ email, id, profile });
      })
      .catch(() => {
        if (active) setProfileError(true);
      });
    return () => {
      active = false;
    };
  }, [email, locked]);

  const profile = currentSpec?.email === email ? currentSpec.profile : null;
  const profileId = currentSpec?.email === email ? currentSpec.id : null;
  const hasChanges = !sameSalaryChanges(changes, {});
  const conditionError = hasChanges
    ? validateSalaryAdditions(changes, profile)
    : null;
  const request = useMemo(
    () =>
      profileId && profile && !locked && !conditionError
        ? buildSalarySimulationRequest(
            changes,
            companyGroup,
            profileId,
            profile.educations
          )
        : null,
    [changes, companyGroup, profileId, profile, locked, conditionError]
  );
  const requestKey = request ? JSON.stringify(request) : null;

  useEffect(() => {
    currentRequestKey.current = requestKey;
  }, [requestKey]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!request || !requestKey) return;
    if (lastSeenKey.current !== requestKey) {
      lastSeenKey.current = requestKey;
      lastAttempt.current = null;
    }

    const cached = simulationCache.current.get(requestKey);
    if (cached) {
      if (simulation?.key !== requestKey || simulation.error) {
        setSimulation({ key: requestKey, data: cached, error: false });
      }
      return;
    }

    const attemptKey = `${requestKey}:${simulationRetry}`;
    if (inFlight.current || lastAttempt.current === attemptKey) return;

    const timer = window.setTimeout(() => {
      if (inFlight.current) return;
      inFlight.current = true;
      lastAttempt.current = attemptKey;

      void simulateSalary(request)
        .then((data) => {
          const cache = simulationCache.current;
          if (cache.size >= 6) cache.delete(cache.keys().next().value!);
          cache.set(requestKey, data);

          if (mounted.current && currentRequestKey.current === requestKey) {
            setSimulation({ key: requestKey, data, error: false });
          }
        })
        .catch(() => {
          if (!mounted.current) return;
          if (currentRequestKey.current === requestKey) {
            setSimulation({ key: requestKey, data: null, error: true });
          } else if (lastAttempt.current === attemptKey) {
            lastAttempt.current = null;
          }
        })
        .finally(() => {
          inFlight.current = false;
          if (mounted.current) setSettledRequests((count) => count + 1);
        });
    }, 900);

    return () => window.clearTimeout(timer);
  }, [
    request,
    requestKey,
    simulationRetry,
    settledRequests,
    simulation?.key,
    simulation?.error,
  ]);

  const result = simulation?.key === requestKey ? simulation.data : null;
  const simulationLoading = !!requestKey && simulation?.key !== requestKey;
  const simulationError = simulation?.key === requestKey && simulation.error;
  const previewLoading =
    !locked && !profileError && (!profile || simulationLoading);
  const comparisonKey = requestKey;
  const compareParams = new URLSearchParams(searchParams);
  compareParams.set("view", "compare");

  const openComparison = async () => {
    if (locked || comparisonLoading) return;

    if (conditionError) {
      setComparisonError(conditionError);
      return;
    }
    if (!request || !comparisonKey || !result?.simulated) {
      setComparisonError("목표 조건의 예상 연봉을 먼저 확인해 주세요.");
      return;
    }

    const showComparison = () =>
      navigate(
        { pathname: "/salary", search: `?${compareParams.toString()}` },
        { state: { fromSalarySimulator: true }, preventScrollReset: true }
      );

    if (comparisonCache?.key === comparisonKey) {
      showComparison();
      return;
    }

    setComparisonLoading(true);
    setComparisonError(null);
    try {
      const data = await saveSalaryTarget(request);
      if (
        data.options.length !== 3 ||
        data.options.filter((item) => item.selected).length !== 1
      ) {
        throw new Error("비교 결과의 선택지 구성이 올바르지 않습니다.");
      }
      setComparisonCache({ key: comparisonKey, data });
      showComparison();
    } catch {
      setComparisonError("목표 스펙을 저장하지 못했어요. 다시 시도해 주세요.");
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

  if (isComparing && !locked) {
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
              현재 조건의 비교 결과가 없어요.
            </p>
            <p className="mt-2 text-[12px] text-text-muted">
              조건을 다시 선택하고 비교를 진행해 주세요.
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
    ({ annual }) => annual === 0
  )?.annualIncomeExpected;
  const changedSalary = simulatedResults.find(
    ({ annual }) => annual === 0
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
    ? simulatedResults.map(({ annual, annualIncomeExpected }) => ({
        year: annual,
        salary: annualIncomeExpected,
      }))
    : null;
  const previewMessage = profileError
    ? "현재 스펙을 불러오지 못했습니다. 페이지를 새로고침해 주세요."
    : (conditionError ??
      (!request && hasChanges && profile
        ? "선택한 조건을 요청 데이터로 변환할 수 없습니다. 입력값을 확인해 주세요."
        : simulationError
          ? "예상 연봉을 조회하지 못했습니다. 조건을 변경하거나 다시 시도해 주세요."
          : simulationLoading || !profile
            ? "예상 연봉을 계산하고 있습니다."
            : result?.simulated
              ? [
                  result.preparationPeriod,
                  result.estimatedCost,
                  result.decisionCriteria,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : "현재 스펙 기준 예상 연봉입니다. 조건을 추가하면 비교할 수 있어요."));

  return (
    <div className="w-full lg:-mb-8">
      <SalaryTitle comparing={false} />

      <div className="relative">
        <div
          inert={locked}
          className={
            locked ? "pointer-events-none select-none opacity-35" : undefined
          }
        >
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
                  value={companyGroup ?? ""}
                  onChange={(event) => {
                    setCompanyGroup(
                      (event.target.value || null) as SalaryCompanyScale
                    );
                    setComparisonError(null);
                  }}
                  className="h-10 min-w-[190px] cursor-pointer appearance-none rounded-lg bg-bg-section pr-10 pl-4 text-[13px] font-semibold"
                >
                  <option value="">선택</option>
                  <option value="STARTUP">스타트업</option>
                  <option value="SMALL">소기업</option>
                  <option value="MIDDLE">중기업</option>
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
                <h2
                  id="salary-projection-title"
                  className="text-[15px] font-bold"
                >
                  조건 변경에 따른 예상 변화
                </h2>
                <span className="text-[12px] text-text-secondary">
                  AI 예측 연봉
                </span>
              </div>

              <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-end gap-4 pb-6 sm:gap-8">
                <div>
                  <p className="text-[13px] text-text-secondary">
                    현재 예상 초봉
                  </p>
                  {previewLoading ? (
                    <div
                      aria-hidden="true"
                      className="mt-3 h-7 w-28 animate-pulse rounded-lg bg-[#F0F1F2] motion-reduce:animate-none sm:h-8"
                    />
                  ) : (
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
                  )}
                </div>

                <span aria-hidden="true" className="pb-1 text-[17px]">
                  →
                </span>

                <div>
                  <p className="text-[13px] text-text-secondary">
                    변경 후 예상 초봉
                  </p>
                  {previewLoading ? (
                    <div
                      aria-hidden="true"
                      className="mt-3 h-7 w-28 animate-pulse rounded-lg bg-[#F0F1F2] motion-reduce:animate-none sm:h-8"
                    />
                  ) : (
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
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-5 pb-3">
                <div className="mx-auto max-w-[920px]">
                  {previewLoading ? (
                    <SalaryChartSkeleton />
                  ) : (
                    <SalaryChart
                      data={chartData}
                      comparisonData={comparisonData}
                      wide
                    />
                  )}
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
                  {previewLoading
                    ? "AI가 예상 연봉을 분석하고 있어요. 결과가 나올 때까지 이 화면에서 확인할 수 있어요."
                    : previewMessage}
                </p>
                {simulationError && (
                  <button
                    type="button"
                    onClick={() => setSimulationRetry((value) => value + 1)}
                    className="mt-2 text-[12px] font-semibold text-brand-strong hover:underline"
                  >
                    다시 시도
                  </button>
                )}
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
                    ? (changes.experiences
                        ?.map((item) => item.title)
                        .join(", ") ?? "")
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
                disabled={
                  !hasChanges ||
                  !!conditionError ||
                  comparisonLoading ||
                  simulationLoading ||
                  !!simulationError ||
                  !result?.simulated
                }
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
        </div>
        {locked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
                <svg
                  width="27"
                  height="27"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="5" y="10" width="14" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </div>
              <h2 className="mt-5 text-[20px] font-bold text-text-primary">
                스펙 진단이 먼저 필요해요
              </h2>
              <p className="mt-2 text-[13px] text-text-secondary">
                진단을 완료하면 조건별 예상 연봉을 비교할 수 있어요.
              </p>
              <button
                type="button"
                onClick={() => navigate("/spec")}
                className="mt-6 min-h-11 cursor-pointer rounded-lg bg-brand px-6 text-[13px] font-bold text-white hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
              >
                스펙 진단하러 가기
              </button>
            </div>
          </div>
        )}
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
                item.type === "GRADUATE_SCHOOL_DOCTORAL"
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
  const location = useLocation();
  const diagnosisState = location.state as {
    diagnosisRunId?: number;
    diagnosisSalaryResults?: DiagnosisSalaryResult[];
  } | null;
  const fromDiagnosis = Boolean(
    diagnosisState?.diagnosisRunId &&
    diagnosisState.diagnosisSalaryResults?.length === 3
  );
  const [access, setAccess] = useState<{
    email: string;
    status: "ready" | "locked" | "error";
  } | null>(null);

  useEffect(() => {
    if (!email || fromDiagnosis) return;
    let active = true;
    getLatestAnalysisRunId()
      .then((runId) => getDiagnosisView(email, runId))
      .then((result) => {
        if (active)
          setAccess({
            email,
            status: result.status === "completed" ? "ready" : "locked",
          });
      })
      .catch(() => {
        if (active) setAccess({ email, status: "error" });
      });
    return () => {
      active = false;
    };
  }, [email, fromDiagnosis]);

  if (!email) return <p className="py-12 text-center">로그인이 필요합니다.</p>;
  if (
    !fromDiagnosis &&
    (access?.email !== email || access.status === "error")
  ) {
    return (
      <p
        role="status"
        className="py-12 text-center text-[13px] text-text-secondary"
      >
        {access?.email === email
          ? "진단 상태를 확인하지 못했습니다. 페이지를 새로고침해 주세요."
          : "진단 상태를 확인하는 중입니다."}
      </p>
    );
  }
  return (
    <SalarySimulator
      key={`user:${email}`}
      locked={!fromDiagnosis && access?.status !== "ready"}
    />
  );
}
