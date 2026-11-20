import type { FormEventHandler, ReactNode } from "react";
import EmployeeCardWindow from "./EmployeeCardWindow";

type AuthCapsuleProps = {
  children: ReactNode;
  windowSize?: number;
  cardName?: string;
  cardEmail?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

const AuthCapsule = ({
  children,
  windowSize = 366,
  cardName,
  cardEmail,
  onSubmit,
}: AuthCapsuleProps) => {
  const isSmall = windowSize < 366;
  const bodyClass = `flex w-full flex-col px-2.5 ${isSmall ? "pt-2" : "pt-2.5"}`;

  return (
    <section
      className={`flex w-full max-w-[390px] shrink-0 flex-col items-center overflow-hidden rounded-[195px] border-[1.5px] border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.42)] px-3 pb-[92px] shadow-[0px_24px_60px_0px_rgba(15,118,110,0.14)] backdrop-blur-[14px] ${isSmall ? "pt-10" : "pt-3"}`}
    >
      <EmployeeCardWindow size={windowSize} name={cardName} email={cardEmail} />
      {onSubmit ? (
        <form onSubmit={onSubmit} noValidate className={bodyClass}>
          {children}
        </form>
      ) : (
        <div className={bodyClass}>{children}</div>
      )}
    </section>
  );
};

export default AuthCapsule;
