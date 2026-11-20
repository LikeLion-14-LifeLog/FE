import type {
  AnalysisEvent,
  AnalysisEventName,
  AnalysisRunData,
  AnalysisRunResult,
} from "@/types/diagnosis";
import type { ApiResponse } from "@/types/spec/api";
import { getAccessToken } from "@/store/authStore";
import { fromApiDiagnosis, type DiagnosisView } from "@/utils/diagnosisMapper";

export type DiagnosisViewState =
  | { status: "completed"; data: DiagnosisView }
  | { status: "pending" | "canceled" | "failed" | "not-found"; data: null };

/** 기존 결과 페이지 호출부 호환. email 인자는 화면 연동 시 제거한다. */
export async function getDiagnosisView(
  _email: string,
  runId: number
): Promise<DiagnosisViewState> {
  const token = getAccessToken();
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await fetch(
    apiUrl(`/api/spec-profile/analyzation/runs/${runId}`),
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const body = (await response.json().catch(() => null)) as ApiResponse<AnalysisRunResult> | null;

  if (body?.code === "RUN_NOT_FOUND" && response.status === 404) {
    return { status: "not-found", data: null };
  }
  if (!response.ok || !body?.success) {
    throw new Error(body?.message || `결과 조회 실패 (HTTP ${response.status})`);
  }
  if (!body.data || body.data.runId !== runId) {
    throw new Error("분석 결과 응답이 올바르지 않습니다.");
  }

  const { status, result } = body.data;
  if (status === "COMPLETED") {
    if (!result) throw new Error("완료된 분석 결과가 없습니다.");
    return { status: "completed", data: fromApiDiagnosis(result) };
  }
  if (status === "FAILED") return { status: "failed", data: null };
  if (status === "CANCELED") return { status: "canceled", data: null };
  if (status === "QUEUED" || status === "IN_PROGRESS") {
    return { status: "pending", data: null };
  }
  throw new Error("알 수 없는 분석 상태입니다.");
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

/** 최근 대기·진행·완료된 분석의 실행 ID를 서버에서 조회한다. */
export async function getLatestAnalysisRunId(): Promise<number> {
  const token = getAccessToken();
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await fetch(apiUrl("/api/spec-profile/runs/latest"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await checkResponse<{ runId: number }>(response);
  if (!Number.isSafeInteger(data?.runId) || data.runId <= 0) {
    throw new Error("최근 분석 실행 정보가 올바르지 않습니다.");
  }
  return data.runId;
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
