import type {
  AnalysisEvent,
  AnalysisEventName,
  AnalysisRunData,
} from "@/types/diagnosis";
import type { ApiResponse } from "@/types/spec/api";
import { getMockAnalysisResult } from "@/mocks/diagnosis";
import { fromMockDiagnosis, type DiagnosisView } from "@/utils/diagnosisMapper";

export type DiagnosisViewState =
  | { status: "completed"; data: DiagnosisView }
  | { status: "pending" | "canceled" | "failed" | "not-found"; data: null };

/** 실제 GET 분석 실행 조회로 교체할 단일 진입점. 전송 오류는 throw한다. */
export async function getDiagnosisView(
  email: string,
  runId: number
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

const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "");

function apiUrl(path: string): string {
  if (!baseUrl) throw new Error("API 기본 주소가 설정되지 않았습니다.");
  return `${baseUrl}${path}`;
}

async function checkResponse<T>(response: Response): Promise<T> {
  const body = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok || !body?.success) {
    if (body?.code === "ANALYSIS_ALREADY_RUNNING")
      throw new Error("이미 진행 중인 분석이 있습니다.");
    if (body?.code === "RUN_NOT_STOPPABLE")
      throw new Error("이미 완료되거나 실패한 분석은 취소할 수 없습니다.");
    throw new Error(body?.message || `요청 실패 (HTTP ${response.status})`);
  }
  return body.data;
}

export async function startAnalysis(token: string): Promise<AnalysisRunData> {
  const response = await fetch(apiUrl("/api/spec-profile/analyzation/run"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return checkResponse<AnalysisRunData>(response);
}

export async function stopAnalysis(
  runId: number,
  token: string
): Promise<void> {
  const response = await fetch(
    apiUrl(`/api/spec-profile/analyzation/runs/${runId}/stop`),
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  await checkResponse(response);
}

/** JWT와 Last-Event-ID 헤더를 사용하기 위해 fetch로 SSE를 구독한다. */
export async function subscribeAnalysis(
  runId: number,
  token: string,
  lastEventId: string,
  onEvent: (
    name: AnalysisEventName,
    event: AnalysisEvent,
    eventId: string
  ) => void,
  signal: AbortSignal
): Promise<void> {
  const response = await fetch(
    apiUrl(`/api/spec-profile/analyzation/runs/${runId}/events`),
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
        ...(lastEventId ? { "Last-Event-ID": lastEventId } : {}),
      },
      signal,
    }
  );
  if (!response.ok) {
    await checkResponse(response);
    throw new Error(`분석 진행 상태 연결 실패 (HTTP ${response.status})`);
  }
  if (
    !response.body ||
    !response.headers.get("content-type")?.includes("text/event-stream")
  ) {
    throw new Error("서버가 SSE 형식으로 응답하지 않았습니다.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let eventName = "";
  let eventId = "";
  let data: string[] = [];

  const dispatch = () => {
    if (
      data.length &&
      ["snapshot", "progress", "completed", "failed", "canceled"].includes(
        eventName
      )
    ) {
      try {
        const event = JSON.parse(data.join("\n")) as AnalysisEvent;
        if (event.runId === runId && Number.isSafeInteger(event.eventLogId)) {
          onEvent(
            eventName as AnalysisEventName,
            event,
            eventId || String(event.eventLogId)
          );
        }
      } catch {
        // 잘못된 이벤트 한 건으로 SSE 연결을 끊지 않는다.
      }
    }
    eventName = "";
    eventId = "";
    data = [];
  };

  const processLine = (line: string) => {
    if (!line) {
      dispatch();
      return;
    }
    if (line.startsWith(":")) return;

    const separator = line.indexOf(":");
    const field = separator < 0 ? line : line.slice(0, separator);
    const rawValue = separator < 0 ? "" : line.slice(separator + 1);
    const value = rawValue.startsWith(" ") ? rawValue.slice(1) : rawValue;

    if (field === "event") eventName = value;
    if (field === "id" && !value.includes("\0")) eventId = value;
    if (field === "data") data.push(value);
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r\n|\n|\r(?!$)/);
      buffer = lines.pop() ?? "";
      for (const line of lines) processLine(line);
    }

    buffer += decoder.decode();
    if (buffer) processLine(buffer.replace(/\r$/, ""));
    dispatch();
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
