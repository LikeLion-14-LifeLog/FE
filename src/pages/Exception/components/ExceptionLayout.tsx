import type { ReactNode } from "react";
import Header from "@/components/Header";
import AuthBackground from "@/pages/Login/components/AuthBackground";

type ExceptionLayoutProps = {
  /** public/exception 의 글래스 배지 아이콘 경로 */
  icon: string;
  title: string;
  /** 줄바꿈은 \n 으로 */
  description: string;
  /** 설명 아래 보조 정보 (예: 점검 일정 칩) */
  extra?: ReactNode;
  actions: ReactNode;
};

/* 예외 페이지 공통 레이아웃 (404 · 500 · 네트워크 · 로그인 필요 · 점검 · 분석 불가) */
const ExceptionLayout = ({
  icon,
  title,
  description,
  extra,
  actions,
}: ExceptionLayoutProps) => {
  return (
    // 배지 중심을 배경 원형 라인 중심에 맞추기 위해 상단 고정 (Figma: 배지 top 286.5)
    <AuthBackground
      header={<Header />}
      variant="exception"
      mainClassName="pt-[222px] pb-16"
    >
      <section className="flex w-full max-w-[520px] flex-col items-center text-center">
        {/* 배지 SVG는 그림자 여백 포함 320px, 실제 원은 220px */}
        <img
          src={icon}
          alt=""
          aria-hidden
          className="pointer-events-none -mx-[50px] -mt-[30px] -mb-[70px] size-[320px] max-w-none select-none"
        />

        <h1 className="mt-9 text-[28px] leading-[1.2] font-bold tracking-[-0.02em] break-keep text-[#0f172a] md:text-[34px]">
          {title}
        </h1>

        <p className="mt-3.5 text-[16px] leading-[1.6] break-keep whitespace-pre-line text-[#64748b]">
          {description}
        </p>

        {extra && <div className="mt-[18px]">{extra}</div>}

        <div className="mt-9 flex w-full max-w-[343px] flex-col gap-3">
          {actions}
        </div>
      </section>
    </AuthBackground>
  );
};

export default ExceptionLayout;
