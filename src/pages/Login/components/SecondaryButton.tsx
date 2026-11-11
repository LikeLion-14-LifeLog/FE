import type { ButtonHTMLAttributes } from "react";

type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/* 뉴모피즘 서브 버튼  */
const SecondaryButton = ({
  className = "",
  type = "button",
  children,
  ...props
}: SecondaryButtonProps) => {
  return (
    <button
      type={type}
      className={`relative flex h-[54px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-[1.5px] border-white bg-[#f4f7f9] px-6 py-2.5 text-[15px] font-bold whitespace-nowrap text-[#0f766e] shadow-[-5px_-5px_14px_0px_rgba(255,255,255,0.95),6px_8px_18px_0px_rgba(15,23,42,0.13)] transition active:shadow-[inset_0px_3px_6px_0px_rgba(15,23,42,0.08)] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_-3px_6px_0px_rgba(15,23,42,0.05),inset_0px_2px_2px_0px_rgba(255,255,255,0.9)]"
      />
    </button>
  );
};

export default SecondaryButton;
