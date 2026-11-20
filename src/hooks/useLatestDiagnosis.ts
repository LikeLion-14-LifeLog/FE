import { useEffect, useState } from "react";
import { getLatestDiagnosis } from "@/apis/diagnosis";
import { useCurrentUser } from "@/store/authStore";
import type { AnalysisRunResult } from "@/types/diagnosis";

export type LatestDiagnosisState =
  | { status: "loading" }
  /** run 이 null 이면 진단 이력 없음 (조회 실패도 이력 없음으로 본다) */
  | { status: "done"; run: AnalysisRunResult | null };

/** 로그인 사용자의 최신 연봉 분석 실행 (QUEUED·IN_PROGRESS·COMPLETED 중 최신) */
export function useLatestDiagnosis(): LatestDiagnosisState {
  const user = useCurrentUser();
  const key = `${user?.email ?? ""}:${user?.accessToken ?? ""}`;
  const loggedIn = !!user?.accessToken;
  const [result, setResult] = useState<{
    key: string;
    run: AnalysisRunResult | null;
  } | null>(null);

  useEffect(() => {
    if (!loggedIn) return;
    const controller = new AbortController();
    getLatestDiagnosis({ signal: controller.signal })
      .then((run) => setResult({ key, run }))
      .catch(() => {
        if (!controller.signal.aborted) setResult({ key, run: null });
      });
    return () => controller.abort();
  }, [key, loggedIn]);

  if (!loggedIn) return { status: "done", run: null };
  return result?.key === key
    ? { status: "done", run: result.run }
    : { status: "loading" };
}

/** 완료된 최신 실행만 (진행 중이거나 없으면 null) */
export const completedRun = (state: LatestDiagnosisState) =>
  state.status === "done" &&
  state.run?.status === "COMPLETED" &&
  state.run.result
    ? state.run
    : null;
