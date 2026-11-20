import { apiClient, toApiError } from "@/apis/client";
import { getAccessToken } from "@/store/authStore";
import type { ApiResponse } from "@/types/spec/api";
import type {
  AnalysisEvent,
  AnalysisEventName,
  AnalysisRunData,
  AnalysisRunResult,
} from "@/types/diagnosis";
import { fromApiDiagnosis, type DiagnosisView } from "@/utils/diagnosisMapper";

const RUN_NOT_FOUND = "RUN_NOT_FOUND";
export const ANALYSIS_ALREADY_RUNNING = "ANALYSIS_ALREADY_RUNNING";

const unwrap = <T>(body: ApiResponse<T>, fallback: string): T => {
  if (!body.success || body.data == null) throw new Error(body.message ?? fallback);
  return body.data;
};

const isNotFound = (error: unknown) => {
  const { status, code } = toApiError(error);
  return status === 404 || code === RUN_NOT_FOUND;
};

/** POST /api/spec-profile/analyzation/run — 저장된 CURRENT 스펙으로 연봉 분석 요청 (진행 중이면 409 ANALYSIS_ALREADY_RUNNING) */
export async function startDiagnosis(): Promise<AnalysisRunData> {
  const { data } = await apiClient.post<ApiResponse<AnalysisRunData>>(
    "/api/spec-profile/analyzation/run",
  );
  return unwrap(data, "연봉 분석을 요청하지 못했습니다.");
}

/** GET /api/spec-profile/runs/latest — 최신 QUEUED·IN_PROGRESS·COMPLETED 실행 ID (없으면 null) */
export async function getLatestDiagnosisRunId(
  options: { signal?: AbortSignal } = {},
): Promise<number | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<{ runId: number }>>(
      "/api/spec-profile/runs/latest",
      { signal: options.signal },
    );
    return unwrap(data, "최신 분석을 불러오지 못했습니다.").runId;
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

/** GET /api/spec-profile/analyzation/runs/{runId} — 실행 상태와 (완료 시) 결과. 없거나 타인 실행이면 null */
export async function getDiagnosisRun(
  runId: number,
  options: { signal?: AbortSignal } = {},
): Promise<AnalysisRunResult | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<AnalysisRunResult>>(
      `/api/spec-profile/analyzation/runs/${runId}`,
      { signal: options.signal },
    );
    return unwrap(data, "분석 결과를 불러오지 못했습니다.");
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

/** PATCH /api/spec-profile/analyzation/runs/{runId}/stop — 대기·진행 중 분석 중단 (완료·실패면 409 RUN_NOT_STOPPABLE) */
export async function stopDiagnosis(runId: number): Promise<void> {
  const { data } = await apiClient.patch<ApiResponse<unknown>>(
    `/api/spec-profile/analyzation/runs/${runId}/stop`,
  );
  if (!data.success) throw new Error(data.message ?? "분석을 중단하지 못했습니다.");
}

export type DiagnosisViewState =
  | { status: "completed"; data: DiagnosisView }
  | { status: "pending" | "canceled" | "failed" | "not-found"; data: null };

/** 실행 상태·결과 → 결과 화면 상태 */
export function toDiagnosisViewState(
  run: AnalysisRunResult | null,
): DiagnosisViewState {
  if (!run) return { status: "not-found", data: null };
  if (run.status === "COMPLETED")
    return run.result
      ? { status: "completed", data: fromApiDiagnosis(run.result) }
      : { status: "failed", data: null };
  if (run.status === "FAILED") return { status: "failed", data: null };
  if (run.status === "CANCELED") return { status: "canceled", data: null };
  return { status: "pending", data: null };
}

/** 결과 화면용 — 전송 오류는 throw */
export async function getDiagnosisView(runId: number): Promise<DiagnosisViewState> {
  return toDiagnosisViewState(await getDiagnosisRun(runId));
}

/** 최신 실행 (대시보드·스펙 진입·연봉 시뮬레이터 잠금용). 실행이 없으면 null */
export async function getLatestDiagnosis(
  options: { signal?: AbortSignal } = {},
): Promise<AnalysisRunResult | null> {
  const runId = await getLatestDiagnosisRunId(options);
  return runId === null ? null : getDiagnosisRun(runId, options);
}

const TERMINAL_EVENTS: AnalysisEventName[] = ["completed", "failed", "canceled"];

/**
 * GET /api/spec-profile/analyzation/runs/{runId}/events — 진행 상태 SSE 구독.
 * EventSource 는 Authorization 헤더를 보낼 수 없어 fetch 스트림으로 읽는다.
 * 종료 이벤트(completed·failed·canceled) 없이 연결이 끊기면 Last-Event-ID 로 다시 붙는다.
 * 반환 함수를 부르면 구독을 끊는다 (분석 취소 아님).
 */
export function subscribeDiagnosisEvents(
  runId: number,
  onEvent: (name: AnalysisEventName, event: AnalysisEvent) => void,
  onError: (error: unknown) => void,
): () => void {
  const controller = new AbortController();
  const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
  let lastEventId: string | null = null;
  let failures = 0;

  const connect = async (): Promise<boolean> => {
    const token = getAccessToken();
    const response = await fetch(
      `${baseUrl}/api/spec-profile/analyzation/runs/${runId}/events`,
      {
        headers: {
          Accept: "text/event-stream",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(lastEventId && { "Last-Event-ID": lastEventId }),
        },
        signal: controller.signal,
      },
    );
    if (!response.ok || !response.body)
      throw new Error(`진행 상태 구독 실패 (HTTP ${response.status})`);

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return false;
      failures = 0;
      buffer += value.replace(/\r\n?/g, "\n");
      let end: number;
      while ((end = buffer.indexOf("\n\n")) !== -1) {
        const block = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        let name = "message";
        let id: string | null = null;
        const data: string[] = [];
        for (const line of block.split("\n")) {
          if (!line || line.startsWith(":")) continue; // heartbeat 주석
          const colon = line.indexOf(":");
          const field = colon === -1 ? line : line.slice(0, colon);
          const text = colon === -1 ? "" : line.slice(colon + 1).replace(/^ /, "");
          if (field === "event") name = text;
          else if (field === "id") id = text;
          else if (field === "data") data.push(text);
        }
        if (!data.length) continue;
        if (id) lastEventId = id;
        const eventName = name as AnalysisEventName;
        onEvent(eventName, JSON.parse(data.join("\n")) as AnalysisEvent);
        if (TERMINAL_EVENTS.includes(eventName)) return true;
      }
    }
  };

  void (async () => {
    while (!controller.signal.aborted) {
      try {
        if (await connect()) break;
      } catch (error) {
        if (controller.signal.aborted) break;
        if (++failures >= 3) {
          onError(error);
          break;
        }
      }
      // 끊겼으면 잠시 뒤 재접속
      await new Promise((resolve) => setTimeout(resolve, 1_000 * (failures + 1)));
    }
  })();

  return () => controller.abort();
}
