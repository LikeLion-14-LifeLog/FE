import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthBackground from "./components/AuthBackground";
import AuthCapsule from "./components/AuthCapsule";
import AuthCheckbox from "./components/AuthCheckbox";
import Header from "@/components/Header";
import AuthInput from "./components/AuthInput";
import PrimaryButton from "./components/PrimaryButton";
import SocialButton from "./components/SocialButton";
import {
  MESSAGES,
  isValidEmail,
  isValidPassword,
  type WelcomeState,
} from "./validation";
import { findNickname, isRegistered } from "./mockAccounts";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const getEmailError = () => {
    if (!isValidEmail(email)) return MESSAGES.emailInvalid;
    if (!isRegistered(email)) return MESSAGES.emailNotRegistered;
    return undefined;
  };
  const emailError = submitted ? getEmailError() : undefined;
  const passwordError =
    submitted && !isValidPassword(password)
      ? MESSAGES.passwordInvalid
      : undefined;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    const nickname = findNickname(email);
    if (!isValidEmail(email) || !nickname || !isValidPassword(password)) {
      return;
    }

    // TODO: 로그인 API 연동 (비밀번호 확인, keepLoggedIn 포함)
    const state: WelcomeState = { nickname, email: email.trim() };
    navigate("/welcome", { state });
  };

  return (
    <AuthBackground header={<Header />}>
      <AuthCapsule onSubmit={handleSubmit}>
        <h1 className="mb-6 h-8 text-center text-[24px] leading-[31.2px] font-extrabold tracking-[-0.5px] text-[#0f172a]">
          LifeLog 로그인
        </h1>

        <div className="flex flex-col gap-4 pb-[26px]">
          <AuthInput
            label="이메일 주소"
            type="email"
            autoComplete="email"
            placeholder="@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
          />
          <AuthInput
            // Figma: 비밀번호 라벨 영역만 30px 높이
            className="[&>label]:pt-[5px] [&>label]:pb-[5.5px]"
            label="비밀번호 (8자 이상, 영문·숫자 포함)"
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
          />
        </div>

        <div className="flex items-center justify-between pb-6">
          <AuthCheckbox checked={keepLoggedIn} onChange={setKeepLoggedIn}>
            <span className="text-[13px] leading-[19.5px] text-[#334155]">
              로그인 상태 유지
            </span>
          </AuthCheckbox>
          <Link
            to="/password-reset"
            className="text-[12px] leading-[18px] font-bold text-[#0d9488]"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </div>

        <PrimaryButton type="submit">로그인</PrimaryButton>

        <SocialButton
          className="mt-5"
          // TODO: Google OAuth 연동
        >
          Google 계정으로 계속하기
        </SocialButton>

        <p className="mt-6 flex items-center justify-center gap-[25px] border-t border-[#f8fafc] pt-4 text-[13px] leading-[19.5px]">
          <span className="text-[#64748b]">
            아직 LifeLog 계정이 없으신가요?
          </span>
          <Link
            to="/signup"
            className="font-extrabold text-[#0d9488] underline"
          >
            회원가입
          </Link>
        </p>
      </AuthCapsule>
    </AuthBackground>
  );
};

export default LoginPage;
