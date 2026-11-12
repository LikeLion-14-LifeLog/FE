import listChecks from "@/assets/icons/listChecks.svg";
import chartNoAxesCombined from "@/assets/icons/chartNoAxesCombined.svg";
import target from "@/assets/icons/target.svg";
import SectionScrollLink from "./SectionScrollLink";

const steps = [
  {
    number: "01",
    icon: listChecks,
    title: "현재 조건 입력",
    description: "학력·전공·경험과 희망 직무를 알려주세요.",
  },
  {
    number: "02",
    icon: chartNoAxesCombined,
    title: "예상 연봉 확인",
    description: "초봉부터 5년 차까지의 범위와 근거를 확인해요.",
  },
  {
    number: "03",
    icon: target,
    title: "다음 목표 선택",
    description: "준비 기간과 비용, 연봉 변화를 비교해 결정해요.",
  },
];

export default function StepsSection() {
  return (
    <section
      id="steps"
      className="relative flex h-full snap-start items-center justify-center overflow-hidden bg-bg-page"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[5%] left-[8%] h-[480px] w-[480px] rounded-full bg-brand/8 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[5%] bottom-[10%] h-[420px] w-[420px] rounded-full bg-brand/8 blur-[100px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1100px] px-6">
        <div className="text-center">
          <p className="text-[11px] font-extrabold tracking-[1.6px] text-brand-strong">
            HOW IT WORKS
          </p>

          <h2 className="mt-4 text-[32px] leading-[1.25] font-extrabold tracking-[-1.2px] text-text-primary">
            입력부터 목표 선택까지,
            <br />
            세 단계면 충분해요.
          </h2>

          <p className="mt-5 text-[13px] text-text-secondary">
            입력한 정보는 진단과 추천을 위해서만 사용됩니다.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-5">
          {steps.map(({ number, icon, title, description }) => (
            <div
              key={number}
              className="relative flex h-[190px] flex-col rounded-xl border border-border bg-white p-6 shadow-sm"
            >
              <span className="absolute top-5 right-5 text-[24px] font-bold text-border-strong/60">
                {number}
              </span>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft">
                <span
                  aria-hidden="true"
                  className="h-5 w-5 bg-brand-strong"
                  style={{
                    mask: `url("${icon}") center / contain no-repeat`,
                  }}
                />
              </div>

              <h3 className="mt-8 text-[16px] font-bold text-text-primary">
                {title}
              </h3>

              <p className="mt-2 text-[12px] text-text-secondary">
                {description}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-[10px] text-text-muted">
          <span>고용노동부·한국고용정보원 공개 데이터 기반</span>
          <span aria-hidden="true">·</span>
          <span>결과는 통계적 추정치이며 실제와 다를 수 있습니다.</span>
        </p>
      </div>

      <SectionScrollLink label="처음으로" target="hero" direction="up" />
    </section>
  );
}
