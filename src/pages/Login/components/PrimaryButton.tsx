import type { ButtonHTMLAttributes } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** 민트 그라데이션 버튼  */
const PrimaryButton = ({
  className = "",
  type = "button",
  children,
  ...props
}: PrimaryButtonProps) => {
  return (
    <button
      type={type}
      className={`flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[14px] bg-linear-to-r/srgb from-[#5eead4] via-[#14b8a6] via-45% to-[#0f766e] px-6 py-2.5 text-[15px] leading-[22.5px] font-bold whitespace-nowrap text-white drop-shadow-[0px_10px_12px_rgba(13,148,136,0.3)] transition hover:brightness-105 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
