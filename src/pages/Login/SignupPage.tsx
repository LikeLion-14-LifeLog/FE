import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthBackground from "./components/AuthBackground";
import AuthCapsule from "./components/AuthCapsule";
import AuthCheckbox from "./components/AuthCheckbox";
import Header from "@/components/Header";
import AuthInput from "./components/AuthInput";
import PrimaryButton from "./components/PrimaryButton";
import {
  MESSAGES,
  isValidEmail,
  isValidPassword,
  type WelcomeState,
} from "./validation";
import { isRegistered, saveAccount } from "./mockAccounts";

const SignupPage = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nicknameValid = nickname.trim().length >= 2;
  const passwordMatch =
    passwordConfirm.length > 0 && password === passwordConfirm;

  const errors = {
    nickname: !nicknameValid ? MESSAGES.nicknameRequired : undefined,
    email: !isValidEmail(email)
      ? MESSAGES.emailInvalid
      : isRegistered(email)
        ? MESSAGES.emailAlreadyRegistered
        : undefined,
    password: !isValidPassword(password) ? MESSAGES.passwordInvalid : undefined,
    passwordConfirm: !passwordMatch ? MESSAGES.passwordMismatch : undefined,
    terms: !agreeTerms ? MESSAGES.termsRequired : undefined,
  };
  const show = (message?: string) => (submitted ? message : undefined);
  const termsError = show(errors.terms);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;

    // TODO: 회원가입 API 연동 (agreeMarketing 포함)
    saveAccount(email, nickname.trim());
    const state: WelcomeState = {
      nickname: nickname.trim(),
      email: email.trim(),
    };
    navigate("/welcome", { state });
  };

  return (
    <AuthBackground header={<Header />} variant="signup">
      <AuthCapsule windowSize={200} onSubmit={handleSubmit}>
        <h1 className="pb-[18px] text-center text-[24px] leading-[31.2px] font-extrabold tracking-[-0.5px] text-[#0f172a]">
          LifeLog 회원가입
        </h1>

        <div className="flex min-h-[341.5px] flex-col gap-3.5 pb-[18px]">
          <AuthInput
            size="sm"
            label="닉네임"
            autoComplete="nickname"
            placeholder="닉네임을 입력하세요"
            className="[&_input]:font-bold"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            error={show(errors.nickname)}
          />
          <AuthInput
            size="sm"
            label="이메일 주소"
            type="email"
            autoComplete="email"
            placeholder="@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={show(errors.email)}
          />
          <AuthInput
            size="sm"
            label="비밀번호 (8자 이상, 영문·숫자 포함)"
            type="password"
            autoComplete="new-password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={show(errors.password)}
          />
          <AuthInput
            size="sm"
            label={
              submitted && errors.passwordConfirm
                ? "비밀번호 확인 (필수)"
                : "비밀번호 확인"
            }
            type="password"
            autoComplete="new-password"
            placeholder="비밀번호를 한 번 더 입력하세요"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            status={
              passwordMatch && <span className="text-[#0f172a]">✓ 일치</span>
            }
            error={show(errors.passwordConfirm)}
          />
        </div>

        <div
          className={`mb-[18px] flex flex-col gap-2 rounded-[14px] border px-3.5 py-3 ${
            termsError
              ? "border-[#e11d48] bg-[rgba(255,241,242,0.6)]"
              : "border-[rgba(255,255,255,0.95)] bg-[rgba(255,255,255,0.55)]"
          }`}
        >
          <AuthCheckbox
            size="sm"
            checked={agreeTerms}
            onChange={setAgreeTerms}
            invalid={!!termsError}
          >
            <span
              className={`text-[12px] leading-[18px] text-[#0f172a] ${termsError ? "font-bold" : "font-semibold"}`}
            >
              [필수] 서비스 이용약관 및 개인정보 처리방침 동의
            </span>
          </AuthCheckbox>
          {termsError && (
            <p className="pl-[23px] text-[11px] leading-[16.5px] font-semibold text-[#0f172a]">
              {termsError}
            </p>
          )}
          <AuthCheckbox
            size="sm"
            checked={agreeMarketing}
            onChange={setAgreeMarketing}
          >
            <span
              className={`text-[12px] leading-[18px] ${agreeMarketing ? "text-[#334155]" : "text-[#64748b]"}`}
            >
              [선택] 맞춤 채용 정보 및 커리어 리포트 수신 동의
            </span>
          </AuthCheckbox>
        </div>

        <PrimaryButton type="submit">회원가입 완료</PrimaryButton>

        <p className="mt-4 flex h-[34.5px] items-start justify-center gap-[25px] pt-[15px] text-[13px] leading-[19.5px]">
          <span className="text-[#64748b]">
            이미 LifeLog 계정이 있으신가요?
          </span>
          <Link to="/login" className="font-extrabold text-[#0d9488] underline">
            로그인
          </Link>
        </p>
      </AuthCapsule>
    </AuthBackground>
  );
};

export default SignupPage;
