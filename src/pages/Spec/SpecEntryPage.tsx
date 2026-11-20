import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { getLatestDiagnosis } from "@/apis/diagnosis";
import { useCurrentUser } from "@/store/authStore";
import SpecPage from "./SpecPage";

/** 최신 분석 실행 기준 이동할 곳 — null 이면 스펙 등록 화면 */
type Redirect = { key: string; to: string | null };

export default function SpecEntryPage() {
  const user = useCurrentUser();
  const [params] = useSearchParams();
  const editing = params.get("edit") === "1";
  const key = user?.email ?? "";
  const [redirect, setRedirect] = useState<Redirect | null>(null);

  useEffect(() => {
    if (!user || editing) return;
    const controller = new AbortController();
    getLatestDiagnosis({ signal: controller.signal })
      .then((run) => {
        const to =
          run?.status === "QUEUED" || run?.status === "IN_PROGRESS"
            ? `/diagnosis/loading?runId=${run.runId}`
            : run?.status === "COMPLETED"
              ? `/diagnosis/result?runId=${run.runId}`
              : null;
        setRedirect({ key, to });
      })
      // 조회 실패 시 등록 화면으로
      .catch(() => {
        if (!controller.signal.aborted) setRedirect({ key, to: null });
      });
    return () => controller.abort();
  }, [user, editing, key]);

  // 명시적으로 스펙을 수정하거나 재진단할 때만 등록 화면으로 진입
  if (!user) {
    return <Navigate to="/error/login-required" replace />;
  }

  if (editing) return <SpecPage />;

  if (redirect?.key !== key) {
    return (
      <p role="status" className="py-12 text-center text-[12px] text-text-secondary">
        진단 상태를 확인하는 중입니다.
      </p>
    );
  }

  return redirect.to ? <Navigate to={redirect.to} replace /> : <SpecPage />;
}
