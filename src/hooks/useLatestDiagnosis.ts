import { useEffect, useState } from "react";
import {
  getDiagnosisView,
  getLatestAnalysisRunId,
  type DiagnosisViewState,
} from "@/apis/diagnosis";
import { useCurrentUser } from "@/store/authStore";
import type { DiagnosisView } from "@/utils/diagnosisMapper";

export type LatestDiagnosisState =
  | { status: "loading" }
  /** view 가 null 이면 진단 이력 없음 (조회 실패도 이력 없음으로 본다) */
  | { status: "done"; view: DiagnosisViewState | null };

/** 로그인 사용자의 최신 연봉 분석 (QUEUED·IN_PROGRESS·COMPLETED 중 최신 실행) */
export function useLatestDiagnosis(): LatestDiagnosisState {
  const user = useCurrentUser();
  const email = user?.email;
  const key = `${email ?? ""}:${user?.accessToken ?? ""}`;
  const [result, setResult] = useState<{
    key: string;
    view: DiagnosisViewState | null;
  } | null>(null);

  useEffect(() => {
    if (!email) return;
    let active = true;
    getLatestAnalysisRunId()
      .then((runId) => getDiagnosisView(email, runId))
      .then((view) => {
        if (active) setResult({ key, view });
      })
      // 실행 이력이 없으면(404) 서버가 오류로 응답한다
      .catch(() => {
        if (active) setResult({ key, view: null });
      });
    return () => {
      active = false;
    };
  }, [email, key]);

  if (!email) return { status: "done", view: null };
  return result?.key === key
    ? { status: "done", view: result.view }
    : { status: "loading" };
}

/** 완료된 최신 진단 결과만 (진행 중이거나 없으면 null) */
export const completedDiagnosis = (
  state: LatestDiagnosisState,
): DiagnosisView | null =>
  state.status === "done" && state.view?.status === "completed"
    ? state.view.data
    : null;
