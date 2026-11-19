import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/store/authStore";
import SpecPage from "./SpecPage";

export default function SpecEntryPage() {
  const user = useCurrentUser();

  if (!user) {
    return <Navigate to="/error/login-required" replace />;
  }

  return <SpecPage />;
}
