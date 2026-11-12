import type { ReactNode } from "react";
import GlowEllipse from "./GlowEllipse";

type AuthBackgroundProps = {
  children?: ReactNode;
  header?: ReactNode;
  variant?: "default" | "signup";
};

const BLOBS = {
  default: [
    { size: 460, color: "#ccfbf1", opacity: 0.45, left: 1219, top: 571 },
    { size: 380, color: "#5eead4", opacity: 0.32, left: 980, top: 420 },
    { size: 420, color: "#2dd4bf", opacity: 0.38, left: 560, top: 250 },
    { size: 520, color: "#99f6e4", opacity: 0.35, left: 439, top: 251 },
  ],
  signup: [
    { size: 520, color: "#99f6e4", opacity: 0.35, left: 439, top: 251 },
    { size: 460, color: "#ccfbf1", opacity: 0.45, left: 1219, top: 571 },
    { size: 420, color: "#2dd4bf", opacity: 0.38, left: 559, top: 185 },
    { size: 380, color: "#5eead4", opacity: 0.32, left: 979, top: 355 },
  ],
};

const Dot = ({ left, top }: { left: number; top: number }) => (
  <span
    className="absolute size-[7px] rounded-[3.5px] bg-[#14b8a6] shadow-[0px_0px_10px_0px_rgba(13,148,136,0.6)]"
    style={{ left, top }}
  />
);
/*  로그인/회원가입 공통 배경 */
const AuthBackground = ({
  children,
  header,
  variant = "default",
}: AuthBackgroundProps) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white font-sans">
      <div
        aria-hidden
        className="pointer-events-none absolute top-16 left-1/2 h-[1014px] w-[1918px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse 1200px 704.17px at 959px 300.44px, rgba(240,253,250,1) 0%, rgba(240,253,250,0) 70%)",
        }}
      >
        {BLOBS[variant].map(({ left, top, ...blob }) => (
          <GlowEllipse key={`${left}-${top}`} {...blob} style={{ left, top }} />
        ))}

        <div className="absolute top-[151px] left-[599px] size-[720px]">
          <div className="absolute top-20 left-20 size-[560px] rounded-full border border-dashed border-[rgba(13,148,136,0.22)]">
            <Dot left={491.03} top={83.69} />
            <Dot left={111.59} top={446.39} />
          </div>
          <div className="absolute top-0 left-0 size-[720px] rounded-full border border-dashed border-[rgba(203,213,225,0.4)]">
            <Dot left={703.63} top={323.09} />
            <Dot left={14.36} top={430.8} />
          </div>
        </div>

        <p className="absolute top-[201px] left-[600.5px] text-[260px] leading-[390px] font-extrabold tracking-[-7px] whitespace-nowrap text-[rgba(13,148,136,0.04)] select-none">
          lifelog
        </p>
      </div>

      {header && <div className="relative z-20 shrink-0">{header}</div>}

      <main className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 pt-8 pb-6">
        {children}
      </main>
    </div>
  );
};

export default AuthBackground;
