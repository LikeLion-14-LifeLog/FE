import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { getDiagnosisView, getLatestAnalysisRunId } from "@/apis/diagnosis";
import { useCurrentUser } from "@/store/authStore";
import SpecPage from "./SpecPage";

type Destination = { page: "loading" | "result"; runId: number };

export default function SpecEntryPage() {
  const email = useCurrentUser()?.email;
  const [params] = useSearchParams();
  const editing = params.get("edit") === "1";
  const [destination, setDestination] = useState<{
    email: string;
    value: Destination;
  } | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!email || editing) return;
    let active = true;

    const check = async () => {
      try {
        const runId = await getLatestAnalysisRunId();
        const result = await getDiagnosisView(email, runId);
        if (!active) return;

        if (result.status === "completed") {
          setDestination({ email, value: { page: "result", runId } });
        } else if (result.status === "pending") {
          setDestination({ email, value: { page: "loading", runId } });
        } else {
          setError(true);
        }
      } catch {
        if (active) setError(true);
      }
    };

    void check();
    return () => {
      active = false;
    };
  }, [email, editing, retry]);

  if (!email) return <Navigate to="/error/login-required" replace />;
  if (editing) return <SpecPage />;

  if (error) {
    return (
      <div
        role="alert"
        className="py-12 text-center text-[12px] text-text-secondary"
      >
        진단 상태를 확인하지 못했습니다.
        <button
          type="button"
          className="ml-3 underline"
          onClick={() => {
            setError(false);
            setDestination(null);
            setRetry((value) => value + 1);
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!destination || destination.email !== email) {
    return (
      <p
        role="status"
        className="py-12 text-center text-[12px] text-text-secondary"
      >
        진단 상태를 확인하는 중입니다.
      </p>
    );
  }

  const { page, runId } = destination.value;
  return <Navigate to={`/diagnosis/${page}?runId=${runId}`} replace />;
}
