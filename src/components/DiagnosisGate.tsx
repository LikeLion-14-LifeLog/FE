import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  completedDiagnosis,
  useLatestDiagnosis,
} from "@/hooks/useLatestDiagnosis";

type DiagnosisGateProps = {
  children: ReactNode;
  /** 잠금 안내 제목 */
  title?: string;
  /** 잠금 안내 설명 */
  description: string;
};

/**
 * 완료된 스펙 진단이 있어야 쓸 수 있는 화면을 감싼다 (연봉 시뮬레이터와 같은 잠금 화면).
 * 진단 전이면 내용을 흐리게·조작 불가로 두고 가운데에 "스펙 진단하러 가기"를 띄운다.
 * 진단 상태를 확인하는 동안에는 안내 없이 흐리게만 둔다.
 */
const DiagnosisGate = ({
  children,
  title = "스펙 진단이 먼저 필요해요",
  description,
}: DiagnosisGateProps) => {
  const navigate = useNavigate();
  const latest = useLatestDiagnosis();
  const checking = latest.status === "loading";
  const locked = !checking && !completedDiagnosis(latest);
  const blocked = checking || locked;

  return (
    <div className="relative">
      <div
        inert={blocked}
        aria-busy={checking || undefined}
        className={
          blocked ? "pointer-events-none select-none opacity-35" : undefined
        }
      >
        {children}
      </div>
      {locked && (
        <div className="absolute inset-0 z-30 flex items-start justify-center px-4 pt-[160px]">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
              <svg
                width="27"
                height="27"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="5" y="10" width="14" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </div>
            <h2 className="mt-5 text-[20px] font-bold text-text-primary">
              {title}
            </h2>
            <p className="mt-2 text-[13px] text-text-secondary">
              {description}
            </p>
            <button
              type="button"
              onClick={() => navigate("/spec")}
              className="mt-6 min-h-11 cursor-pointer rounded-lg bg-brand px-6 text-[13px] font-bold text-white hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
            >
              스펙 진단하러 가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosisGate;
