import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getRedirect, withRedirect } from "@/utils/redirect";
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
  type LoginState,
  type WelcomeState,
} from "./validation";
import { findNickname } from "./mockAccounts";
import { login as saveLogin } from "@/store/authStore";
import { login } from "@/apis/auth";
import { toApiError } from "@/apis/client";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = getRedirect(location.search);
  // 회원가입 직후라면 가입한 이메일을 미리 채워 둔다
  const fromSignup = location.state as LoginState | null;
  const [email, setEmail] = useState(fromSignup?.email ?? "");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>();

  const emailError =
    submitted && !isValidEmail(email) ? MESSAGES.emailInvalid : undefined;
  // 로그인 시에는 형식 대신 입력 여부만 확인 (일치 여부는 서버가 판단)
  const passwordError =
    submitted && !password ? MESSAGES.passwordRequired : undefined;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setSubmitted(true);
    setLoginError(undefined);
    if (!isValidEmail(email) || !password) return;

    const trimmedEmail = email.trim();
    setLoading(true);
    let accessToken: string;
    try {
      ({ accessToken } = await login({ email: trimmedEmail, password }));
    } catch (error) {
      const { status } = toApiError(error);
      setLoginError(
        status === 401
          ? MESSAGES.loginFailed
          : status === 403
            ? MESSAGES.loginForbidden
            : status === undefined
              ? MESSAGES.networkError
              : MESSAGES.serverError,
      );
      return;
    } finally {
      setLoading(false);
    }

    // 로그인 API는 닉네임을 주지 않으므로 가입 시 로컬에 저장한 닉네임을 쓰고,
    // 없으면 이메일 앞부분으로 대신한다. TODO: 회원 정보 조회 API 연동 시 교체
    const nickname = findNickname(trimmedEmail) ?? trimmedEmail.split("@")[0];
    const state: WelcomeState = { nickname, email: trimmedEmail };
    saveLogin({ ...state, accessToken }, keepLoggedIn);
    // 환영 페이지를 거친 뒤 원래 가려던 화면(redirect)으로 이어진다
    navigate(withRedirect("/welcome", redirect), { replace: true, state });
  };

  return (
    <AuthBackground header={<Header />}>
      <AuthCapsule onSubmit={handleSubmit}>
        <h1 className="mb-6 h-8 text-center text-[24px] leading-[31.2px] font-extrabold tracking-[-0.5px] text-[#0f172a]">
          LifeLog 로그인
        </h1>
        {fromSignup?.fromSignup && (
          <p className="-mt-3 mb-4 text-center text-[13px] font-medium text-[#0d9488]">
            회원가입이 완료됐어요. 로그인해 주세요.
          </p>
        )}

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

        {loginError && (
          <p
            role="alert"
            className="-mt-2 pb-3 text-center text-[12px] leading-[18px] font-semibold text-[#e11d48]"
          >
            {loginError}
          </p>
        )}
        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </PrimaryButton>

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
            to={withRedirect("/signup", redirect)}
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
