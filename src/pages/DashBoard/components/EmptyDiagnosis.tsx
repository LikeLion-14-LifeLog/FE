import { Link } from "react-router-dom";

type EmptyDiagnosisProps = {
  registerSpecPath?: string;
};

const EmptyDiagnosis = ({
  registerSpecPath = "/spec",
}: EmptyDiagnosisProps) => {
  return (
    <section className="grid min-h-[330px] grid-cols-1 items-center gap-10 rounded-[22px] bg-linear-[162deg] from-[#f2faf8] to-[#f7f9f8] px-6 py-[55px] md:grid-cols-[minmax(0,520px)_312px] md:justify-between md:gap-20 md:px-16">
      <div className="flex flex-col">
        <p className="text-[10px] leading-[15px] font-extrabold tracking-[1.6px] text-brand-strong">
          MY CAREER BASELINE
        </p>
        <h1 className="mt-[14px] text-[31px] leading-[46.5px] tracking-[-0.992px] text-text-primary">
          아직 진단 결과가 없어요.
        </h1>
        <p className="mt-3 text-[12px] leading-[18px] tracking-[0.096px] text-[#73807c]">
          스펙을 등록하면 예상 연봉과 추천 공고를 확인할 수 있어요.
        </p>
        <Link
          to={registerSpecPath}
          className="mt-[25px] inline-flex h-[46px] w-fit min-w-[155px] items-center justify-center gap-2 rounded-[9px] bg-text-primary px-5 text-[13px] leading-[19.5px] font-bold tracking-[0.096px] text-white transition hover:brightness-125"
        >
          내 스펙 등록하기
          {/* 흰 화살표 아이콘이 없어 검정 화살표를 반전해서 사용 */}
          <img
            src="/dashboard/blackArrow.svg"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="h-auto w-3 shrink-0 brightness-0 invert"
          />
        </Link>
      </div>

      <div className="flex flex-col border-[#dce6e3] md:border-l-[1.067px] md:pl-[55px]">
        <p className="text-[10px] leading-[15px] tracking-[0.096px] text-[#7f8c88]">
          예상 초봉
        </p>
        <p
          aria-label="결과 없음"
          className="mt-[7px] text-[50px] leading-[75px] font-bold text-[#b7c2be]"
        >
          —
        </p>
        <p className="mt-[7px] text-[9px] leading-[14.4px] tracking-[0.096px] text-[#8b9793]">
          첫 진단 후 비교 집단 내 위치와 성장 전망이 표시됩니다.
        </p>
      </div>
    </section>
  );
};

export default EmptyDiagnosis;
