import type { ReactNode } from "react";

type AuthCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  /** 로그인 16px(md) / 회원가입 약관 15px(sm) */
  size?: "md" | "sm";
  /** 필수 항목 미동의 오류 */
  invalid?: boolean;
  className?: string;
};

/** 민트 체크박스 — Figma 3:121 / 3:410 */
const AuthCheckbox = ({
  checked,
  onChange,
  children,
  size = "md",
  invalid = false,
  className = "",
}: AuthCheckboxProps) => {
  const box = size === "md" ? "size-4 text-[11px]" : "size-[15px] text-[10px]";
  const boxColor = checked
    ? "border-[#0d9488] bg-[#0d9488]"
    : invalid
      ? "border-[#0f172a] bg-white"
      : "border-[#e2e8f0] bg-white";

  return (
    <label
      className={`flex cursor-pointer items-center gap-2 select-none ${className}`}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-invalid={invalid}
      />
      <span
        aria-hidden
        className={`flex shrink-0 items-center justify-center rounded-[3px] border font-extrabold text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#5eead4] ${box} ${boxColor}`}
      >
        {checked && "✓"}
      </span>
      {children}
    </label>
  );
};

export default AuthCheckbox;
