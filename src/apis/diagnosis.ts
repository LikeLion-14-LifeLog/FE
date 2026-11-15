import { getMockAnalysisResult } from "@/mocks/diagnosis";
import { fromMockDiagnosis, type DiagnosisView } from "@/utils/diagnosisMapper";

export type DiagnosisViewState =
  | { status: "completed"; data: DiagnosisView }
  | { status: "pending" | "canceled" | "failed" | "not-found"; data: null };

/** 실제 GET 분석 실행 조회로 교체할 단일 진입점. 전송 오류는 throw한다. */
export async function getDiagnosisView(
  email: string,
  runId: number,
): Promise<DiagnosisViewState> {
  const response = getMockAnalysisResult(email, runId);
  if (!response) return { status: "not-found", data: null };

  if (response.status === "COMPLETED" && response.result) {
    return { status: "completed", data: fromMockDiagnosis(response.result) };
  }
  if (response.status === "FAILED") return { status: "failed", data: null };
  if (response.status === "CANCELED") return { status: "canceled", data: null };
  return { status: "pending", data: null };
}