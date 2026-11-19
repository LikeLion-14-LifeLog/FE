import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getRedirect, withRedirect } from "@/utils/redirect";
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
  NICKNAME_MAX_LENGTH,
  type LoginState,
} from "./validation";
import { checkEmailAvailable, signup } from "@/apis/auth";
import { ApiError } from "@/apis/client";
import { TERM_IDS } from "@/constants/terms";

const SignupPage = () => {
  const navigate = useNavigate();
  const redirect = getRedirect(useLocation().search);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [loading, setLoading] = useState(false);
  /** 서버에서 409(이미 가입된 이메일)를 받은 이메일 */
  const [duplicatedEmail, setDuplicatedEmail] = useState<string>();
  /** 중복 확인 API에서 사용 가능하다고 받은 이메일 */
  const [availableEmail, setAvailableEmail] = useState<string>();
  const emailCheckRef = useRef<AbortController | null>(null);
  useEffect(() => () => emailCheckRef.current?.abort(), []);

  const normalizedEmail = email.trim().toLowerCase();
  const isDuplicated = duplicatedEmail === normalizedEmail;
  const isAvailable = availableEmail === normalizedEmail && !isDuplicated;

  /** 이메일 입력을 마치면(blur) 중복 여부를 미리 확인한다. 실패하면 가입 시 서버 검증에 맡긴다. */
  const checkEmail = async () => {
    const target = normalizedEmail;
    if (!isValidEmail(email) || target === duplicatedEmail || target === availableEmail)
      return;
    emailCheckRef.current?.abort();
    const controller = new AbortController();
    emailCheckRef.current = controller;
    try {
      const { available } = await checkEmailAvailable(email.trim(), controller.signal);
      if (available) setAvailableEmail(target);
      else setDuplicatedEmail(target);
    } catch {
      // 네트워크 오류·취소 등은 무시 (회원가입 요청에서 다시 검증됨)
    }
  };

  const trimmedNickname = nickname.trim();
  const passwordMatch =
    passwordConfirm.length > 0 && password === passwordConfirm;

  const errors = {
    nickname:
      trimmedNickname.length < 2
        ? MESSAGES.nicknameRequired
        : trimmedNickname.length > NICKNAME_MAX_LENGTH
          ? MESSAGES.nicknameTooLong
          : undefined,
    email: !isValidEmail(email)
      ? MESSAGES.emailInvalid
      : isDuplicated
        ? MESSAGES.emailAlreadyRegistered
        : undefined,
    password: !isValidPassword(password) ? MESSAGES.passwordInvalid : undefined,
    passwordConfirm: !passwordMatch ? MESSAGES.passwordMismatch : undefined,
    terms: !agreeTerms ? MESSAGES.termsRequired : undefined,
  };
  const show = (message?: string) => (submitted ? message : undefined);
  const termsError = show(errors.terms);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setSubmitted(true);
    setSaveError(undefined);
    if (Object.values(errors).some(Boolean)) return;

    setLoading(true);
    try {
      await signup({
        nickname: trimmedNickname,
        email: email.trim(),
        password,
        passwordConfirm,
        agreedTermIds: [
          ...TERM_IDS.required,
          ...(agreeMarketing ? [TERM_IDS.marketing] : []),
        ],
      });
    } catch (error) {
      const { status, message } =
        error instanceof ApiError ? error : { status: null, message: undefined };
      if (status === 409) {
        setDuplicatedEmail(email.trim().toLowerCase());
      } else if (status === 400) {
        setSaveError(message ?? MESSAGES.signupInvalidRequest);
      } else if (status === null) {
        setSaveError(MESSAGES.networkError);
      } else {
        setSaveError(MESSAGES.signupFailed);
      }
      return;
    } finally {
      setLoading(false);
    }

    // 가입 후에는 로그인 화면으로 보내 직접 로그인하게 한다 (이메일은 미리 채움)
    const state: LoginState = { email: email.trim(), fromSignup: true };
    navigate(withRedirect("/login", redirect), { replace: true, state });
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
            maxLength={NICKNAME_MAX_LENGTH}
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
            onBlur={checkEmail}
            status={
              isAvailable && <span className="text-[#0f172a]">✓ 사용 가능</span>
            }
            // 이미 가입된 이메일은 제출 전에도 바로 알려준다
            error={isDuplicated ? errors.email : show(errors.email)}
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

        {saveError && (
          <p
            role="alert"
            className="pb-3 text-center text-[12px] leading-[18px] font-semibold text-[#e11d48]"
          >
            {saveError}
          </p>
        )}
        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "가입 처리 중..." : "회원가입 완료"}
        </PrimaryButton>

        <p className="mt-4 flex h-[34.5px] items-start justify-center gap-[25px] pt-[15px] text-[13px] leading-[19.5px]">
          <span className="text-[#64748b]">
            이미 LifeLog 계정이 있으신가요?
          </span>
          <Link
            to={withRedirect("/login", redirect)}
            className="font-extrabold text-[#0d9488] underline"
          >
            로그인
          </Link>
        </p>
      </AuthCapsule>
    </AuthBackground>
  );
};

export default SignupPage;
