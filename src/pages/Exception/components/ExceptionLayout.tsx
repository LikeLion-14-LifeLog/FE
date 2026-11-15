import type { ReactNode } from "react";
import Header from "@/components/Header";
import AuthBackground from "@/pages/Login/components/AuthBackground";

type ExceptionLayoutProps = {
  icon: string;
  title: string;
  description: string;
  extra?: ReactNode;
  actions: ReactNode;
};

const ExceptionLayout = ({
  icon,
  title,
  description,
  extra,
  actions,
}: ExceptionLayoutProps) => {
  return (
    <AuthBackground
      header={<Header />}
      variant="exception"
      mainClassName="pt-[222px] pb-16"
    >
      <section className="flex w-full max-w-[520px] flex-col items-center text-center">
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
