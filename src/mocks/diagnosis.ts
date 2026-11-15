import type { SpecProfileDraft } from "@/apis/spec";
import type {
  MockDiagnosisResult, DiagnosisStatus, MockAnalysisRunResult,
} from "@/types/diagnosis";

export const DIAGNOSIS_CANCEL_DELAY_MS = 15_000;
export const DIAGNOSIS_COMPLETE_DELAY_MS = 26_000;
const STORAGE_PREFIX = "lifelog:diagnosis:runs:";
const MAX_RUNS = 5;

export type MockDiagnosisRun = {
  runId: number;
  startedAt: number;
  status: "ACTIVE" | "CANCELED" | "FAILED";
  profile: SpecProfileDraft;
};

const key = (email: string) =>
  `${STORAGE_PREFIX}${email.trim().toLowerCase()}`;

function loadRuns(email: string): MockDiagnosisRun[] {
  try {
    const raw = sessionStorage.getItem(key(email));
    if (!raw) return [];
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is MockDiagnosisRun =>
      item && typeof item === "object" &&
      Number.isSafeInteger(item.runId) && item.runId > 0 &&
      Number.isFinite(item.startedAt) && item.startedAt <= Date.now() &&
      ["ACTIVE", "CANCELED", "FAILED"].includes(item.status) &&
      item.profile && typeof item.profile === "object" &&
      item.profile.basicInfo && Array.isArray(item.profile.educations),
    );
  } catch {
    return [];
  }
}

function saveRuns(email: string, runs: MockDiagnosisRun[]): void {
  sessionStorage.setItem(key(email), JSON.stringify(runs.slice(-MAX_RUNS)));
}

export function getMockDiagnosisStatus(run: MockDiagnosisRun): DiagnosisStatus {
  if (run.status === "CANCELED") return "CANCELED";
  if (run.status === "FAILED") return "FAILED";
  return Date.now() - run.startedAt >= DIAGNOSIS_COMPLETE_DELAY_MS
    ? "COMPLETED" : "IN_PROGRESS";
}

export function getMockDiagnosisRun(
  email: string,
  runId: number,
): MockDiagnosisRun | null {
  return loadRuns(email).find((run) => run.runId === runId) ?? null;
}

export function getActiveMockDiagnosis(email: string): MockDiagnosisRun | null {
  return loadRuns(email).find((run) =>
    getMockDiagnosisStatus(run) === "IN_PROGRESS") ?? null;
}

/** 최근 완료된 분석 실행. /spec 재진입 시 결과 복원에 사용한다. */
export function getLatestCompletedMockDiagnosis(email: string): MockDiagnosisRun | null {
  return loadRuns(email)
    .filter((run) => getMockDiagnosisStatus(run) === "COMPLETED")
    .at(-1) ?? null;
}

export function startMockDiagnosis(
  profile: SpecProfileDraft,
  email: string,
): MockDiagnosisRun {
  if (getActiveMockDiagnosis(email)) {
    throw new Error("ANALYSIS_ALREADY_RUNNING");
  }
  const runs = loadRuns(email);
  const runId = Math.max(Date.now(), ...runs.map((run) => run.runId + 1));
  const run: MockDiagnosisRun = {
    runId,
    startedAt: Date.now(),
    status: "ACTIVE",
    profile: structuredClone(profile),
  };
  saveRuns(email, [...runs, run]);
  return run;
}

export function cancelMockDiagnosis(email: string, runId: number): boolean {
  const runs = loadRuns(email);
  const run = runs.find((item) => item.runId === runId);
  if (!run || getMockDiagnosisStatus(run) !== "IN_PROGRESS") return false;
  run.status = "CANCELED";
  saveRuns(email, runs);
  return true;
}

export function getMockDiagnosisStep(elapsedMs: number): 0 | 1 | 2 | 3 {
  if (elapsedMs >= DIAGNOSIS_COMPLETE_DELAY_MS) return 3;
  if (elapsedMs >= 18_000) return 2;
  if (elapsedMs >= 6_000) return 1;
  return 0;
}

/** 명세의 예시 연봉. 사용자 입력으로 실제 연봉을 예측하지 않음. */
function makeMockResult(profile: SpecProfileDraft): MockDiagnosisResult {
  return {
    summary: "입력 스펙의 스냅샷과 API 명세 예시 연봉을 표시합니다 (Mock).",
    salaryResults: [
      { annual: 0, annualIncomeMin: 34000000, annualIncomeExpected: 36000000, annualIncomeMax: 38000000, topPercent: 28 },
      { annual: 3, annualIncomeMin: 41000000, annualIncomeExpected: 44500000, annualIncomeMax: 48000000, topPercent: null },
      { annual: 5, annualIncomeMin: 50000000, annualIncomeExpected: 54500000, annualIncomeMax: 60000000, topPercent: null },
    ],
    comparisonGroup: {
      jobSubCategoryCode: "133",
      jobSubCategoryName: "소프트웨어 개발자",
      sampleCount: 120,
      observationYears: [2021, 2022, 2023, 2024],
      description: "API 명세 예시 비교 집단이며, 선택한 직무에 따라 실제로 산출된 통계가 아닙니다.",
    },
    appliedSpecs: structuredClone(profile),
    statistics: {
      sampleCount: 120, annualSalaryMinKrw: 20000000,
      annualSalaryMaxKrw: 60000000, annualSalaryMeanKrw: 36000000,
      annualSalaryModesKrw: [35000000], modeFrequency: 8,
      annualSalaryP25Krw: 30000000, annualSalaryMedianKrw: 35000000,
      annualSalaryP75Krw: 42000000,
    },
    recommendation: "프로젝트 경험을 직무 성과 중심으로 구체화하고 배포·운영 경험을 보완해 보세요.",
    salaryNotice: "Mock 예시값 · KEEPⅡ 비교표본 기반 실제 분석 결과가 아닙니다 · 연차별 금액과 음영은 예시 예측값입니다.",
  };
}

export function getMockAnalysisResult(
  email: string, runId: number,
): MockAnalysisRunResult | null {
  const run = getMockDiagnosisRun(email, runId);
  if (!run) return null;
  const status = getMockDiagnosisStatus(run);
  return {
    runId,
    status,
    result: status === "COMPLETED" ? makeMockResult(run.profile) : null,
  };
}

// 기존 대시보드 Mock 호환 API
const completedKey = (email: string) =>
  `lifelog:diagnosis:completed:${email.trim().toLowerCase()}`;
export function markDiagnosisCompleted(email: string): void {
  try { localStorage.setItem(completedKey(email), "1"); } catch { /* optional */ }
}
export function hasCompletedDiagnosis(email: string | undefined): boolean {
  if (!email) return false;
  if (loadRuns(email).some((run) => getMockDiagnosisStatus(run) === "COMPLETED")) return true;
  try { return localStorage.getItem(completedKey(email)) === "1"; }
  catch { return false; }
}