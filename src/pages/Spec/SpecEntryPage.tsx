import { Navigate, useSearchParams } from "react-router-dom";
import { useCurrentUser } from "@/store/authStore";
import {
  getActiveMockDiagnosis,
  getLatestCompletedMockDiagnosis,
} from "@/mocks/diagnosis";
import SpecPage from "./SpecPage";

export default function SpecEntryPage() {
  const user = useCurrentUser();
  const [params] = useSearchParams();

  // 명시적으로 스펙을 수정하거나 재진단할 때만 등록 화면으로 진입
  if (!user) {
    return <Navigate to="/error/login-required" replace />;
  }

  if (params.get("edit") === "1") {
    return <SpecPage />;
  }

  const active = getActiveMockDiagnosis(user.email);
  if (active) {
    return (
      <Navigate
        to={`/diagnosis/loading?runId=${active.runId}`}
        replace
      />
    );
  }

  const completed = getLatestCompletedMockDiagnosis(user.email);
  if (completed) {
    return (
      <Navigate
        to={`/diagnosis/result?runId=${completed.runId}`}
        replace
      />
    );
  }

  return <SpecPage />;
}