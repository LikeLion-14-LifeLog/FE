import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import diagnosisIllustration from "@/assets/images/diagnosisIllustration.svg";
import {
  getDiagnosisRun,
  stopDiagnosis,
  subscribeDiagnosisEvents,
} from "@/apis/diagnosis";
import { toApiError } from "@/apis/client";
import { useCurrentUser } from "@/store/authStore";
import type { DiagnosisStatus } from "@/types/diagnosis";
import DiagnosisProgress from "./components/DiagnosisProgress";

/** 분석 시작 후 이 시간이 지나야 취소 버튼을 보여 준다 */
const CANCEL_DELAY_MS = 15_000;
/** SSE 가 끊겼을 때 상태 조회 간격 */
const POLL_INTERVAL_MS = 3_000;
/** 화면의 진행 단계 수 (서버 9단계를 3단계로 묶어 표시) */
const UI_STEPS = 3;

type RunState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: DiagnosisStatus; completedSteps: number; totalSteps: number };

const isRunning = (status: string) =>
  status === "QUEUED" || status === "IN_PROGRESS";

export default function DiagnosisLoadingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loggedIn = !!useCurrentUser();
  const runId = Number(searchParams.get("runId"));
  const validRunId = Number.isSafeInteger(runId) && runId > 0;
  const [state, setState] = useState<RunState>({ status: "loading" });
  const [startedAt] = useState(Date.now);
  const [now, setNow] = useState(Date.now);
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const status = !validRunId || !loggedIn ? "not-found" : state.status;

  // 현재 상태를 먼저 조회하고, 진행 중이면 SSE 로 진행 단계를 받는다 (SSE 실패 시 폴링)
  useEffect(() => {
    if (!validRunId || !loggedIn) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;
    let pollTimer: number | undefined;

    const poll = () => {
      pollTimer = window.setTimeout(async () => {
        const run = await getDiagnosisRun(runId).catch(() => undefined);
        if (!active) return;
        if (run === null) return setState({ status: "not-found" });
        if (run)
          setState((prev) => ({
            status: run.status,
            completedSteps: "completedSteps" in prev ? prev.completedSteps : 0,
            totalSteps: "totalSteps" in prev ? prev.totalSteps : 0,
          }));
        if (!run || isRunning(run.status)) poll();
      }, POLL_INTERVAL_MS);
    };

    getDiagnosisRun(runId)
      .then((run) => {
        if (!active) return;
        if (!run) return setState({ status: "not-found" });
        setState({ status: run.status, completedSteps: 0, totalSteps: 0 });
        if (!isRunning(run.status)) return;
        unsubscribe = subscribeDiagnosisEvents(
          runId,
          (_, event) => {
            if (!active) return;
            setState({
              status: event.status,
              completedSteps: event.completedStepCount ?? 0,
              totalSteps: event.totalSteps,
            });
          },
          () => {
            if (active) poll();
          },
        );
      })
      .catch(() => {
        if (active) poll();
      });

    return () => {
      active = false;
      unsubscribe?.();
      window.clearTimeout(pollTimer);
    };
  }, [runId, validRunId, loggedIn]);

  const running = isRunning(status);
  const completed = status === "COMPLETED";
  const isCancelled = status === "CANCELED";
  const stopped = isCancelled || status === "FAILED" || status === "not-found";

  // 취소 버튼 노출 시점 계산용 시계
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!completed) return;
    const timer = window.setTimeout(() => {
      navigate(`/diagnosis/result?runId=${runId}`, { replace: true });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [completed, runId, navigate]);

  const activeStep = completed
    ? UI_STEPS
    : "totalSteps" in state && state.totalSteps > 0
      ? Math.min(
          UI_STEPS - 1,
          Math.floor((state.completedSteps / state.totalSteps) * UI_STEPS),
        )
      : 0;

  const handleCancel = async () => {
    if (canceling) return;
    setCanceling(true);
    setCancelError("");
    try {
      await stopDiagnosis(runId);
      setState((prev) =>
        "totalSteps" in prev ? { ...prev, status: "CANCELED" } : prev,
      );
    } catch (error) {
      setCancelError(
        toApiError(error).message ??
          "분석을 취소하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setCanceling(false);
    }
  };

  const title = isCancelled ? "스펙 분석이 취소되었습니다" :
    status === "not-found" ? "진행 중인 스펙 분석이 없습니다" :
    status === "FAILED" ? "스펙 분석에 실패했습니다" :
    completed ? "예상 연봉 분석이 완료되었습니다" :
    "입력하신 조건을 바탕으로 예상 연봉을 분석하고 있습니다";
  const description = isCancelled || status === "FAILED"
    ? "스펙 등록 페이지에서 다시 진단할 수 있습니다."
    : status === "not-found" ? "스펙 등록을 완료한 후 진단을 시작해 주세요."
      : completed ? "분석 결과 페이지로 이동합니다."
        : status === "loading" ? "분석 상태를 확인하고 있습니다."
          : "청년패널 비교 표본과 입력하신 스펙으로 연봉을 분석합니다.";
  const showCancel = running && now - startedAt >= CANCEL_DELAY_MS;

  return (
    <section className="flex min-h-[calc(100dvh/var(--page-zoom)-160px)] w-full items-center justify-center bg-bg-page px-5 py-10">
      <div className="flex w-full max-w-[960px] flex-col items-center text-center">
        <img src={diagnosisIllustration} alt="" className="h-auto w-[340px] max-w-full sm:w-[390px]" />
        <h1 className="mt-8 text-[20px] font-bold leading-relaxed tracking-[-0.04em] text-text-primary sm:mt-4 sm:text-[26px]">
          {title}
        </h1>
        <p aria-live="polite" className="mt-2 text-[14px] leading-6 text-text-secondary">
          {description}
        </p>
        <div className="mt-7 w-full sm:mt-8">
          <DiagnosisProgress activeStep={activeStep} cancelled={stopped} />
        </div>
        {cancelError && (
          <p role="alert" className="mt-4 text-[12px] text-red-500">{cancelError}</p>
        )}
        <div className="mt-6 flex h-10 items-center justify-center">
          {stopped ? (
            <button type="button" onClick={() => navigate("/spec?edit=1")}
              className="h-10 cursor-pointer rounded-lg border border-border px-5 text-[12px] font-medium text-text-secondary transition-colors hover:border-text-primary hover:text-text-primary">
              스펙 등록으로 돌아가기
            </button>
          ) : showCancel ? (
            <button type="button" onClick={handleCancel} disabled={canceling}
              className="h-10 cursor-pointer rounded-lg border border-border px-5 text-[12px] font-medium text-text-secondary transition-colors hover:border-text-primary hover:text-text-primary disabled:cursor-default disabled:opacity-60">
              {canceling ? "취소하는 중…" : "분석 취소하기"}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
