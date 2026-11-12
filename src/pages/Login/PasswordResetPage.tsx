import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthBackground from "./components/AuthBackground";
import AuthCapsule from "./components/AuthCapsule";
import Header from "@/components/Header";
import AuthInput from "./components/AuthInput";
import SecondaryButton from "./components/SecondaryButton";
import { MESSAGES, isValidEmail } from "./validation";

const PasswordResetPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);

  const emailError =
    submitted && !isValidEmail(email) ? MESSAGES.emailInvalid : undefined;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isValidEmail(email)) return;

    // TODO: 비밀번호 재설정 메일 발송 API 연동
    setSent(true);
  };

  return (
    <AuthBackground header={<Header />}>
      <AuthCapsule onSubmit={handleSubmit}>
        <div className="flex flex-col items-center gap-2 pb-6 text-center">
          <h1 className="text-[22px] leading-[26px] font-bold text-[#0f172a]">
            비밀번호 찾기
          </h1>
          <p className="text-[13px] leading-[1.5] text-[#64748b]">
            가입한 이메일 주소를 입력하면
            <br />
            비밀번호 재설정 링크를 보내드려요.
          </p>
        </div>

        <AuthInput
          className="pb-6"
          label="이메일 주소"
          type="email"
          autoComplete="email"
          placeholder="@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setSent(false);
          }}
          error={emailError}
        />

        <SecondaryButton type="submit">
          {sent ? "링크 다시 보내기" : "재설정 링크 보내기"}
        </SecondaryButton>

        <p
          role="status"
          className={`pt-4 pb-[18px] text-center text-[12px] leading-normal ${sent ? "font-semibold text-[#0d9488]" : "text-[#94a3b8]"}`}
        >
          {sent
            ? "재설정 링크를 보냈어요. 메일함을 확인해 주세요."
            : "메일이 오지 않으면 스팸함을 확인해 주세요."}
        </p>

        <div className="flex h-[36.5px] justify-center border-t border-[#f8fafc] pt-[15px]">
          <Link to="/login" className="text-[13px] font-bold text-[#0d9488]">
            ← 로그인으로 돌아가기
          </Link>
        </div>
      </AuthCapsule>
    </AuthBackground>
  );
};

export default PasswordResetPage;
