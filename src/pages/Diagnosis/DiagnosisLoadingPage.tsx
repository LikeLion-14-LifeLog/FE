import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import diagnosisIllustration from "@/assets/images/diagnosisIllustration.svg";
import {
  DIAGNOSIS_CANCEL_DELAY_MS,
  DIAGNOSIS_STORAGE_KEY,
  clearMockDiagnosisSession,
  getMockDiagnosisSession,
  getMockDiagnosisStep,
  markDiagnosisCompleted,
} from "@/mocks/diagnosis";
import { useCurrentUser } from "@/store/authStore";
import DiagnosisProgress from "./components/DiagnosisProgress";

function getInitialSession() {
  const preview =
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get("preview") === "1";

  return preview ? { startedAt: Date.now() } : getMockDiagnosisSession();
}

export default function DiagnosisLoadingPage() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [session, setSession] = useState(getInitialSession);
  const [now, setNow] = useState(Date.now);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);

    if (!import.meta.env.DEV || url.searchParams.get("preview") !== "1") {
      return;
    }

    if (session) {
      try {
        sessionStorage.setItem(
          DIAGNOSIS_STORAGE_KEY,
          JSON.stringify(session),
        );
      } catch {
        // 저장소를 사용할 수 없으면 새로고침 복원은 지원하지 않습니다.
      }
    }

    url.searchParams.delete("preview");
    window.history.replaceState(
      window.history.state,
      "",
      url.pathname + url.search + url.hash,
    );
  }, [session]);

  const elapsed = session ? Math.max(0, now - session.startedAt) : 0;
  const activeStep = session ? getMockDiagnosisStep(elapsed) : 0;
  const completed = activeStep === 3;

  // 분석이 끝나면 완료 기록을 남겨 대시보드에서 결과 화면을 보여 준다
  useEffect(() => {
    if (completed && user) markDiagnosisCompleted(user.email);
  }, [completed, user]);

  useEffect(() => {
    if (!session || completed) return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 500);

    return () => window.clearInterval(timer);
  }, [session, completed]);

  const showCancel =
    session !== null &&
    !completed &&
    elapsed >= DIAGNOSIS_CANCEL_DELAY_MS;

  const handleCancel = () => {
    clearMockDiagnosisSession();
    setSession(null);
    setCancelled(true);
  };

  const title = cancelled
    ? "스펙 분석이 취소되었습니다"
    : !session
      ? "진행 중인 스펙 분석이 없습니다"
      : completed
        ? "예상 연봉 분석이 완료되었습니다"
        : "입력하신 조건을 바탕으로 예상 연봉을 분석하고 있습니다";

  const description = cancelled
    ? "스펙 등록 페이지에서 다시 진단할 수 있습니다."
    : !session
      ? "스펙 등록을 완료한 후 진단을 시작해 주세요."
      : completed
        ? "진단 결과 페이지 연결 후 분석 결과를 확인할 수 있습니다."
        : "청년패널 데이터와 대조하여 시장 기준선을 산출합니다.";

  return (
    <section className="flex min-h-[calc(100dvh/var(--page-zoom)-160px)] w-full items-center justify-center bg-bg-page px-5 py-10">
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
            cancelled={cancelled || !session}
          />
        </div>

        <div className="mt-6 flex h-10 items-center justify-center">
          {cancelled ? (
            <button
              type="button"
              onClick={() => navigate("/spec")}
              className="h-10 cursor-pointer rounded-lg border border-border px-5 text-[12px] font-medium text-text-secondary transition-colors hover:border-text-primary hover:text-text-primary"
            >
              스펙 등록으로 돌아가기
            </button>
          ) : showCancel ? (
            <button
              type="button"
              onClick={handleCancel}
              className="h-10 cursor-pointer rounded-lg border border-border px-5 text-[12px] font-medium text-text-secondary transition-colors hover:border-text-primary hover:text-text-primary"
            >
              분석 취소하기
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}