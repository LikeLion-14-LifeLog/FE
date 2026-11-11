import type { ButtonHTMLAttributes, ReactNode } from "react";

type SocialButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
};

/* 반투명 글래스 버튼 (Google 계정으로 계속하기)*/
const SocialButton = ({
  icon,
  className = "",
  type = "button",
  children,
  ...props
}: SocialButtonProps) => {
  return (
    <button
      type={type}
      className={`flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] border-[1.2px] border-[rgba(255,255,255,0.95)] bg-[rgba(255,255,255,0.55)] px-[22px] py-2.5 text-[13px] leading-[19.5px] font-semibold whitespace-nowrap text-[#334155] transition hover:bg-[rgba(255,255,255,0.75)] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {icon && <span className="flex h-5 shrink-0 items-center">{icon}</span>}
      {children}
    </button>
  );
};

export default SocialButton;
