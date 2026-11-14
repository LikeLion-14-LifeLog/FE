import { Fragment } from "react";
import checkIcon from "@/assets/icons/check.svg";

const steps = [
  "동일 전공·학력 비교 집단 매칭",
  "보유 자격 및 어학 점수 가중치 계산",
  "연차별 예상 연봉선 생성 대기",
] as const;

type DiagnosisProgressProps = {
  activeStep?: number;
  cancelled?: boolean;
};

export default function DiagnosisProgress({
  activeStep = 1,
  cancelled = false,
}: DiagnosisProgressProps) {
  return (
    <div
      role="list"
      aria-label="스펙 분석 진행 단계"
      className="grid w-full grid-cols-1 items-center gap-y-4 border-y border-border/40 py-5 sm:grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)_20px_minmax(0,1fr)] sm:gap-x-4 sm:py-4"
    >
      {steps.map((step, index) => {
        const completed = !cancelled && index < activeStep;
        const active = !cancelled && index === activeStep;

        return (
          <Fragment key={step}>
            <div
              role="listitem"
              aria-current={active ? "step" : undefined}
              className="flex min-w-0 items-center justify-center gap-3"
            >
              <span
                className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors duration-700 ease-in-out motion-reduce:transition-none ${
                  completed
                    ? "bg-brand/50"
                    : active
                      ? "bg-brand"
                      : "bg-border/60"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute translate-y-[1px] text-[10px] font-semibold transition-opacity duration-500 motion-reduce:transition-none ${
                    completed ? "opacity-0" : "opacity-100"
                  } ${active ? "text-white" : "text-text-muted"}`}
                >
                  {index + 1}
                </span>

                <img
                  src={checkIcon}
                  alt=""
                  className={`absolute h-3 w-3 brightness-0 invert transition-opacity duration-500 motion-reduce:transition-none ${
                    completed ? "opacity-100" : "opacity-0"
                  }`}
                />
              </span>

              <span
                className={`min-w-0 text-left text-[13px] font-semibold leading-5 transition-colors duration-700 ease-in-out motion-reduce:transition-none ${
                  completed
                    ? "text-brand/70"
                    : active
                      ? "text-brand"
                      : "text-text-muted"
                }`}
              >
                {step}
              </span>

              <span className="sr-only">
                {cancelled
                  ? "분석 취소됨"
                  : completed
                    ? "완료"
                    : active
                      ? "진행 중"
                      : "진행 전"}
              </span>
            </div>

            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={`hidden text-center text-[14px] transition-colors duration-700 ease-in-out motion-reduce:transition-none sm:block ${
                  completed
                    ? "text-brand/70"
                    : active
                      ? "text-brand"
                      : "text-text-muted"
                }`}
              >
                →
              </span>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}