import type { ButtonHTMLAttributes } from "react";
import SecondaryButton from "@/pages/Login/components/SecondaryButton";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const ExceptionPrimaryButton = ({
  className = "",
  ...props
}: ButtonProps) => (
  <SecondaryButton className={`text-[16px] ${className}`} {...props} />
);

export const ExceptionGhostButton = ({
  className = "",
  type = "button",
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={`flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[14px] border border-[#e2e8f0] bg-white/70 px-6 text-[15px] font-medium whitespace-nowrap text-[#334155] backdrop-blur-[12px] transition hover:bg-white active:bg-[#f8fafc] ${className}`}
    {...props}
  />
);
