import type { ReactNode } from "react";

type StatusBadgeProps = {
  children: ReactNode;
  className?: string;
};

const StatusBadge = ({ children, className = "" }: StatusBadgeProps) => {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-[20px] bg-[#e6f7f3] px-[9px] text-[8px] leading-3 tracking-[0.096px] whitespace-nowrap text-brand-strong ${className}`}
    >
      {children}
    </span>
  );
};

export default StatusBadge;
