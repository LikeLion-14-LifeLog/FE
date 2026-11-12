import checkIcon from "@/assets/icons/check.svg";
import salaryPreview from "@/assets/images/salaryPreview.svg";

const badges = ["48만 건 패널 데이터", "120개 직무 세분화"];

export default function ValueSection() {
  return (
    <section
      id="value"
      className="relative flex h-full snap-start items-center justify-center bg-bg-page"
    >
      <div className="mx-auto grid w-full max-w-[1000px] grid-cols-2 items-center gap-14 px-6">
        <div>
          <p className="text-[11px] font-extrabold tracking-[1.6px] text-brand-strong">
            WHAT YOU GET
          </p>

          <h2 className="mt-4 text-[32px] leading-[1.25] font-extrabold tracking-[-1.2px] text-text-primary">
            연봉 하나가 아니라,
            <br />
            선택의 기준을 보여드려요.
          </h2>

          <p className="mt-4 ml-1 text-[12px] leading-5 text-text-secondary">
            단순한 평균값이 아닌 한국고용정보원 청년패널조사 실제 데이터를
            바탕으로,
            <br />
            내가 추가로 쌓을 스펙과 시간 투자에 따른 실제 연봉 성장 곡선을
            예측합니다.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            {badges.map((label) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border-2 border-brand/15 bg-brand-soft/50 px-3 py-1.5 text-[11px] font-semibold text-brand-strong"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-brand/60">
                  <img src={checkIcon} alt="" className="h-3 w-3" />
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>

        <img
          src={salaryPreview}
          alt="5년간 예상 연봉 변화와 조건별 연봉 비교 예시"
          className="h-auto w-full max-w-[483px]"
        />
      </div>

      <a
        href="#steps"
        className="absolute bottom-5 flex flex-col items-center gap-1 text-[10px] text-text-muted"
      >
        진단 과정 보기
        <span aria-hidden="true" className="text-base">
          ↓
        </span>
      </a>
    </section>
  );
}
