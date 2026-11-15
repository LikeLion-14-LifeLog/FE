import type { SpecProfileDraft } from "@/apis/spec";
import type { SpecReadData, ApiResponse } from "@/types/spec/api";

export type DiagnosisStatus =
  | "QUEUED" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | "FAILED";
export type AnalysisStepStatus = DiagnosisStatus;
export type SalaryResult = {
  annual: 0 | 3 | 5;
  annualIncomeMin: number;
  annualIncomeExpected: number;
  annualIncomeMax: number;
  topPercent: number | null;
};
export type DiagnosisStep = { code: string; order: number; name: string };
export type AnalysisRunData = {
  runId: number;
  specProfileId: number;
  status: DiagnosisStatus;
  totalSteps: number;
  completedStepCount: number;
  steps: DiagnosisStep[];
  eventsUrl: string;
  resultUrl: string;
  requestedAt: string;
};
export type AnalysisEvent = {
  runId: number;
  eventLogId: number;
  status: DiagnosisStatus;
  totalSteps: number;
  completedStepCount: number;
  currentStepOrder: number | null;
  steps: Array<{ order: number; code: string; status: AnalysisStepStatus }>;
  resultUrl: string | null;
  occurredAt: string;
};
export type AnalysisEventName =
  | "snapshot" | "progress" | "completed" | "failed" | "canceled";
export type ComparisonGroup = {
  jobSubCategoryCode: string;
  jobSubCategoryName: string;
  sampleCount: number;
  observationYears: number[];
  description: string;
};
export type SalaryStatistics = {
  sampleCount: number;
  annualSalaryMinKrw: number;
  annualSalaryMaxKrw: number;
  annualSalaryMeanKrw: number;
  annualSalaryModesKrw: number[];
  modeFrequency: number;
  annualSalaryP25Krw: number;
  annualSalaryMedianKrw: number;
  annualSalaryP75Krw: number;
};
export type DiagnosisResult = {
  summary: string;
  salaryResults: SalaryResult[];
  comparisonGroup: ComparisonGroup;
  appliedSpecs: Pick<SpecReadData,
    "birthYear" | "residenceRegion" | "jobId" | "academicAbilities" |
    "certificates" | "languageExamScores" | "experiences"> & { jobName: string };
  statistics: SalaryStatistics;
  recommendation: string;
  salaryNotice: string;
};
export type AnalysisRunResult = {
  runId: number;
  specProfileId: number;
  status: DiagnosisStatus;
  result: DiagnosisResult | null;
};
export type AnalysisRunResponse = ApiResponse<AnalysisRunData>;
export type AnalysisResultResponse = ApiResponse<AnalysisRunResult>;

/** Mock 전용: 서버 PK를 만들어내지 않고 UI Draft 스냅샷 유지. */
export type MockDiagnosisResult = Omit<DiagnosisResult, "appliedSpecs"> & { appliedSpecs: SpecProfileDraft };
export type MockAnalysisRunResult = Omit<AnalysisRunResult, "result" | "specProfileId"> & { result: MockDiagnosisResult | null };