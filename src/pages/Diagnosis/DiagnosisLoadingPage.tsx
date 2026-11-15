import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import diagnosisIllustration from "@/assets/images/diagnosisIllustration.svg";
import {
  DIAGNOSIS_CANCEL_DELAY_MS, cancelMockDiagnosis,
  getMockDiagnosisRun, getMockDiagnosisStatus, getMockDiagnosisStep,
  markDiagnosisCompleted,
} from "@/mocks/diagnosis";
import { useCurrentUser } from "@/store/authStore";
import DiagnosisProgress from "./components/DiagnosisProgress";

export default function DiagnosisLoadingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useCurrentUser();
  const email = user?.email;
  const runId = Number(searchParams.get("runId"));
  const [now, setNow] = useState(Date.now);
  const [cancelled, setCancelled] = useState(false);
  const run = email && Number.isSafeInteger(runId) && runId > 0
    ? getMockDiagnosisRun(email, runId) : null;
  const status = run ? getMockDiagnosisStatus(run) : null;
  const elapsed = run ? Math.max(0, now - run.startedAt) : 0;
  const completed = status === "COMPLETED";
  const isCancelled = cancelled || status === "CANCELED";
  const activeStep = status === "IN_PROGRESS" || completed
    ? getMockDiagnosisStep(elapsed) : 0;

  useEffect(() => {
    if (status !== "IN_PROGRESS") return;
    const timer = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [status, runId]);

  useEffect(() => {
    if (!completed || !email) return;
    markDiagnosisCompleted(email);
    const timer = window.setTimeout(() => {
      navigate(`/diagnosis/result?runId=${runId}`, { replace: true });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [completed, email, runId, navigate]);

  const handleCancel = () => {
    if (!email || !run) return;
    if (cancelMockDiagnosis(email, run.runId)) {
      setCancelled(true);
      setNow(Date.now());
    }
  };

  const title = isCancelled ? "스펙 분석이 취소되었습니다" :
    !run ? "진행 중인 스펙 분석이 없습니다" :
    status === "FAILED" ? "스펙 분석에 실패했습니다" :
    completed ? "예상 연봉 분석이 완료되었습니다" :
    "입력하신 조건을 바탕으로 예상 연봉을 분석하고 있습니다";
  const description = isCancelled || status === "FAILED"
    ? "스펙 등록 페이지에서 다시 진단할 수 있습니다."
    : !run ? "스펙 등록을 완료한 후 진단을 시작해 주세요."
      : completed ? "분석 결과 페이지로 이동합니다."
        : "API 예시 데이터를 바탕으로 Mock 분석을 진행합니다.";
  const showCancel = status === "IN_PROGRESS" && elapsed >= DIAGNOSIS_CANCEL_DELAY_MS;

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
          <DiagnosisProgress activeStep={activeStep} cancelled={isCancelled || !run || status === "FAILED"} />
        </div>
        <div className="mt-6 flex h-10 items-center justify-center">
          {isCancelled || !run || status === "FAILED" ? (
            <button type="button" onClick={() => navigate("/spec?edit=1")}
              className="h-10 cursor-pointer rounded-lg border border-border px-5 text-[12px] font-medium text-text-secondary transition-colors hover:border-text-primary hover:text-text-primary">
              스펙 등록으로 돌아가기
            </button>
          ) : showCancel ? (
            <button type="button" onClick={handleCancel}
              className="h-10 cursor-pointer rounded-lg border border-border px-5 text-[12px] font-medium text-text-secondary transition-colors hover:border-text-primary hover:text-text-primary">
              분석 취소하기
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}