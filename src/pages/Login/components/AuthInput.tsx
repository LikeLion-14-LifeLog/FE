import { useId, type InputHTMLAttributes, type ReactNode } from "react";

type AuthInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string;
  /** 입력창 오른쪽 상태 표시 (예: ✓ 사용 가능) */
  status?: ReactNode;
  error?: string;
  /** 입력창 높이 — 로그인 44px(md), 회원가입 42px(sm) */
  size?: "md" | "sm";
};

/** 라벨 + 글래스 입력창 — Figma 3:106 / 3:380 */
const AuthInput = ({
  label,
  status,
  error,
  size = "md",
  type = "text",
  className = "",
  ...props
}: AuthInputProps) => {
  const id = useId();
  const errorId = `${id}-error`;
  const isPassword = type === "password";

  return (
    <div className={`flex w-full flex-col ${className}`}>
      <label
        htmlFor={id}
        className={`text-[13px] leading-[19.5px] font-semibold ${error ? "text-[#0f172a]" : "text-[#334155]"}`}
      >
        {label}
      </label>
      <div
        className={`flex w-full items-center justify-between gap-2 rounded-[14px] border-[1.2px] bg-[rgba(255,255,255,0.55)] transition-colors ${
          error
            ? "border-[#e11d48]"
            : "border-[rgba(255,255,255,0.95)] focus-within:border-[#5eead4]"
        } ${size === "md" ? "h-11 px-3" : "h-[42px] px-3.5"}`}
      >
        <input
          id={id}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`h-full min-w-0 flex-1 bg-transparent text-[14px] leading-[21px] text-[#0f172a] outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-[#94a3b8] ${
            isPassword ? "font-normal tracking-[2px]" : "font-medium"
          }`}
          {...props}
        />
        {status && (
          <span className="shrink-0 text-[11px] leading-[16.5px] font-bold whitespace-nowrap">
            {status}
          </span>
        )}
      </div>
      {error && (
        <p
          id={errorId}
          className="pt-1.5 text-[12px] leading-[18px] font-semibold text-[#e11d48]"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default AuthInput;
