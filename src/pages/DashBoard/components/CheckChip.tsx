import type { ReactNode } from "react";

type CheckChipProps = {
  children: ReactNode;
  className?: string;
};

const CheckChip = ({ children, className = "" }: CheckChipProps) => {
  return (
    <span
      className={`inline-flex h-[30px] items-center gap-1 rounded-[7px] border-[1.067px] border-[#dfe8e5] bg-[rgba(255,255,255,0.82)] px-4 text-[9px] leading-[13.5px] font-semibold tracking-[0.096px] whitespace-nowrap text-[#51605b] ${className}`}
    >
      {children}
    </span>
  );
};

export default CheckChip;
