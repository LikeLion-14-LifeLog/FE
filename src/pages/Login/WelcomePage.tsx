import { useLocation, useNavigate } from "react-router-dom";
import AuthBackground from "./components/AuthBackground";
import AuthCapsule from "./components/AuthCapsule";
import Header from "@/components/Header";
import PrimaryButton from "./components/PrimaryButton";
import type { WelcomeState } from "./validation";
import { useCurrentUser } from "@/store/authStore";

/** 로그인 성공 후 시작 페이지 — Figma 3:713 */
const WelcomePage = () => {
  const navigate = useNavigate();
  const state = useLocation().state as WelcomeState | null;
  const user = useCurrentUser();
  const nickname = user?.nickname || state?.nickname || "회원";
  const email = user?.email ?? state?.email;

  return (
    <AuthBackground header={<Header />}>
      <AuthCapsule cardName={nickname} cardEmail={email}>
        <h1 className="mb-6 h-8 text-center text-[24px] leading-[31.2px] font-bold tracking-[-0.5px] text-[#0f172a]">
          {nickname}님 환영합니다!
        </h1>
        <p className="pt-1.5 pb-[22px] text-center text-[14px] leading-[1.55] text-[#64748b]">
          로그인에 성공했어요.
          <br />
          오늘의 스펙부터 함께 진단해 볼까요?
        </p>
        <div className="h-[18px]" aria-hidden />
        <PrimaryButton className="mb-5" onClick={() => navigate("/")}>
          스펙 진단 바로 시작하기&nbsp;&nbsp;→
        </PrimaryButton>
      </AuthCapsule>
    </AuthBackground>
  );
};

export default WelcomePage;
