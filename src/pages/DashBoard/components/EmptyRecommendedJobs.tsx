import TextLink from "./TextLink";

type EmptyRecommendedJobsProps = {
  /** "진단 시작하기" 이동 경로 */
  startDiagnosisPath?: string;
};

/** 진단 전 – 추천 공고 자리 안내 */
const EmptyRecommendedJobs = ({
  startDiagnosisPath = "/spec",
}: EmptyRecommendedJobsProps) => {
  return (
    <section className="mt-[52px] flex flex-wrap items-center justify-between gap-4 border-y-[1.067px] border-text-primary px-[3px] py-[30px]">
      <div className="flex flex-col">
        <p className="text-[9px] leading-[13.5px] tracking-[0.096px] text-brand-strong">
          맞춤 채용 공고
        </p>
        <h2 className="mt-[9px] text-[18px] leading-[27px] tracking-[-0.576px] text-text-primary">
          내 조건에 맞는 공고를 준비하고 있어요.
        </h2>
        <p className="mt-[7px] text-[10px] leading-[15px] tracking-[0.096px] text-[#83908c]">
          첫 진단을 완료하면 등록한 정보를 기준으로 추천 공고를 확인할 수
          있어요.
        </p>
      </div>
      <TextLink
        to={startDiagnosisPath}
        className="gap-[9px] text-[10px] leading-[15px]"
        arrowClassName="w-3"
      >
        진단 시작하기
      </TextLink>
    </section>
  );
};

export default EmptyRecommendedJobs;
