import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import diagnosisIllustration from "@/assets/images/diagnosisIllustration.svg";
import { stopAnalysis, subscribeAnalysis } from "@/apis/diagnosis";
import { getAccessToken } from "@/store/authStore";
import type { AnalysisEvent, DiagnosisStatus } from "@/types/diagnosis";
import DiagnosisProgress from "./components/DiagnosisProgress";

const CANCEL_DELAY_MS = 15_000;
const MAX_RETRIES = 5;

const isFinished = (status: DiagnosisStatus) =>
  status === "COMPLETED" || status === "FAILED" || status === "CANCELED";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "요청 처리에 실패했습니다.";

const isRunNotFound = (message: string) =>
  message.includes("RUN_NOT_FOUND") ||
  message.includes("분석 실행 이력을 찾을 수 없습니다");

function waitForRetry(delay: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const timer = setTimeout(finish, delay);
    signal.addEventListener("abort", finish, { once: true });
  });
}

export default function DiagnosisLoadingPage() {
  const [params] = useSearchParams();
  const runIdParam = params.get("runId");
  const runId = runIdParam ? Number(runIdParam) : NaN;

  return <DiagnosisLoadingRun key={runIdParam ?? "missing"} runId={runId} />;
}

function DiagnosisLoadingRun({ runId }: { runId: number }) {
  const navigate = useNavigate();
  const validRunId = Number.isSafeInteger(runId) && runId > 0;
  const [progress, setProgress] = useState<AnalysisEvent | null>(null);
  const [status, setStatus] = useState<DiagnosisStatus>("QUEUED");
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const lastEventId = useRef("");
  const connection = useRef<AbortController | null>(null);
  const finished = useRef(false);
  const cancelPending = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!validRunId) return;
    const timer = setTimeout(() => setShowCancel(true), CANCEL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [validRunId]);

  useEffect(() => {
    if (!validRunId || notFound || finished.current) return;

    const controller = new AbortController();
    connection.current = controller;
    let failures = 0;
    setCanRetry(false);

    const connect = async () => {
      while (!controller.signal.aborted && !finished.current) {
        try {
          const token = getAccessToken();
          if (!token) {
            setError("로그인이 필요합니다.");
            break;
          }

          await subscribeAnalysis(
            runId,
            token,
            lastEventId.current,
            (name, event, eventId) => {
              if (controller.signal.aborted || finished.current) return;
              if (event.eventLogId < Number(lastEventId.current || 0)) return;

              lastEventId.current = eventId;
              failures = 0;
              setProgress(event);
              setError("");

              const nextStatus: DiagnosisStatus =
                name === "completed"
                  ? "COMPLETED"
                  : name === "failed"
                    ? "FAILED"
                    : name === "canceled"
                      ? "CANCELED"
                      : event.status;

              setStatus(nextStatus);
              if (isFinished(nextStatus)) {
                finished.current = true;
                controller.abort();
                if (nextStatus === "COMPLETED") {
                  navigate(`/diagnosis/result?runId=${runId}`, {
                    replace: true,
                  });
                }
              }
            },
            controller.signal
          );

          if (!controller.signal.aborted && !finished.current) {
            throw new Error("분석 진행 상태 연결이 종료되었습니다.");
          }
        } catch (cause) {
          if (controller.signal.aborted || finished.current) break;

          const message = getErrorMessage(cause);
          setError(message);
          if (isRunNotFound(message)) {
            setNotFound(true);
            break;
          }

          failures += 1;
          if (failures >= MAX_RETRIES) {
            setCanRetry(true);
            break;
          }
          await waitForRetry(
            Math.min(failures * 1000, 5000),
            controller.signal
          );
        }
      }
    };

    void connect();
    return () => {
      controller.abort();
      if (connection.current === controller) connection.current = null;
    };
  }, [runId, validRunId, notFound, retryKey, navigate]);

  const handleCancel = async () => {
    if (!validRunId || notFound || finished.current || cancelPending.current)
      return;

    cancelPending.current = true;
    setCanceling(true);
    setError("");

    try {
      const token = getAccessToken();
      if (!token) throw new Error("로그인이 필요합니다.");
      await stopAnalysis(runId, token);
      if (!mounted.current || finished.current) return;

      finished.current = true;
      connection.current?.abort();
      setStatus("CANCELED");
    } catch (cause) {
      if (!mounted.current || finished.current) return;

      const message = getErrorMessage(cause);
      setError(message);
      if (isRunNotFound(message)) {
        connection.current?.abort();
        setNotFound(true);
      }
    } finally {
      cancelPending.current = false;
      if (mounted.current) setCanceling(false);
    }
  };

  const unavailable = !validRunId || notFound;
  const completed = status === "COMPLETED";
  const canceled = status === "CANCELED";
  const failed = status === "FAILED";
  const ended = isFinished(status);
  const activeStep = completed
    ? 3
    : Math.min(2, Math.floor((progress?.completedStepCount ?? 0) / 3));

  const title = unavailable
    ? "진행 중인 스펙 분석이 없습니다"
    : canceled
      ? "스펙 분석이 취소되었습니다"
      : failed
        ? "스펙 분석에 실패했습니다"
        : completed
          ? "예상 연봉 분석이 완료되었습니다"
          : "입력하신 조건을 바탕으로 예상 연봉을 분석하고 있습니다";

  const description = unavailable
    ? "스펙 등록을 완료한 후 진단을 시작해 주세요."
    : canceled || failed
      ? "스펙 등록 페이지에서 다시 진단할 수 있습니다."
      : completed
        ? "분석이 완료되었습니다. 진단 결과를 확인해 주세요."
        : "입력하신 스펙 정보를 분석하고 있습니다.";

  const buttonClass =
    "h-10 cursor-pointer rounded-lg border border-border px-5 text-[12px] font-medium text-text-secondary transition-colors hover:border-text-primary hover:text-text-primary disabled:opacity-50";

  return (
    <section className="flex h-[calc(100dvh-171px)] w-full items-center justify-center overflow-hidden bg-bg-page px-5">
      <div className="flex w-full max-w-[960px] flex-col items-center text-center">
        <img
          src={diagnosisIllustration}
          alt=""
          className="h-auto w-[340px] max-w-full sm:w-[390px]"
        />
        <h1 className="mt-8 text-[20px] font-bold leading-relaxed tracking-[-0.04em] text-text-primary sm:mt-4 sm:text-[26px]">
          {title}
        </h1>
        <p
          aria-live="polite"
          className="mt-2 text-[14px] leading-6 text-text-secondary"
        >
          {description}
        </p>
        <div className="mt-7 w-full sm:mt-8">
          <DiagnosisProgress
            activeStep={activeStep}
            cancelled={unavailable || canceled || failed}
          />
        </div>
        {error && (
          <p role="alert" className="mt-4 text-[12px] text-red-500">
            {error}
          </p>
        )}
        {canRetry && !unavailable && !ended && (
          <button
            type="button"
            onClick={() => {
              setError("");
              setCanRetry(false);
              setRetryKey((value) => value + 1);
            }}
            className="mt-3 text-[12px] font-medium text-text-primary underline"
          >
            연결 다시 시도
          </button>
        )}
        <div className="mt-6 flex h-10 items-center justify-center">
          {unavailable || canceled || failed ? (
            <button
              type="button"
              onClick={() => navigate("/spec?edit=1")}
              className={buttonClass}
            >
              스펙 등록으로 돌아가기
            </button>
          ) : showCancel && !ended ? (
            <button
              type="button"
              disabled={canceling}
              onClick={() => void handleCancel()}
              className={buttonClass}
            >
              {canceling ? "취소 요청 중..." : "분석 취소하기"}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
