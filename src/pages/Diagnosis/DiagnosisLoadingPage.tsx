import diagnosisIllustration from "@/assets/images/diagnosisIllustration.svg";
import DiagnosisProgress from "./components/DiagnosisProgress";

export default function DiagnosisLoadingPage() {
  return (
    <section className="flex min-h-[calc(100dvh-220px)] w-full items-center justify-center bg-bg-page px-5">
      <div className="flex w-full max-w-[780px] flex-col items-center text-center">
        <img
          src={diagnosisIllustration}
          alt=""
          className="h-auto w-[290px] max-w-full sm:w-[330px]"
        />

        <h1 className="mt-8 text-[18px] font-bold leading-relaxed tracking-[-0.04em] text-text-primary sm:mt-4 sm:text-[22px]">
          입력하신 조건을 바탕으로 예상 연봉을 분석하고 있습니다
        </h1>

        <p className="mt-2 text-[13px] leading-3 text-text-secondary">
          청년패널 데이터와 대조하여 시장 기준선을 산출합니다.
        </p>

        <div className="mt-7 w-full sm:mt-8">
          <DiagnosisProgress activeStep={1} />
        </div>
      </div>
    </section>
  );
}