import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type TextLinkProps = {
  to: string;
  children: ReactNode;
  className?: string;
  arrowClassName?: string;
};

const TextLink = ({
  to,
  children,
  className = "",
  arrowClassName = "w-2",
}: TextLinkProps) => {
  return (
    <Link
      to={to}
      className={`inline-flex shrink-0 items-center gap-[7px] text-[9px] leading-[13.5px] font-bold tracking-[0.096px] whitespace-nowrap text-brand-strong transition-opacity hover:opacity-75 ${className}`}
    >
      {children}
      <img
        src="/dashboard/mintArrow.svg"
        alt=""
        aria-hidden="true"
        draggable={false}
        className={`h-auto shrink-0 ${arrowClassName}`}
      />
    </Link>
  );
};

export default TextLink;
