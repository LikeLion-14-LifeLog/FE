import { Link } from "react-router-dom";
import EmployeeCardVisual from "./EmployeeCardVisual";
import SectionScrollLink from "./SectionScrollLink";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex h-full snap-start flex-col items-center justify-center bg-bg-page"
    >
      <div className="flex -translate-y-7 flex-col items-center text-center">
        <EmployeeCardVisual />

        <h1 className="mt-1 text-[36px] leading-[1.2] font-extrabold tracking-[-1.5px] text-text-primary">
          막연했던 커리어,
          <br />
          <span className="text-brand-strong">숫자로 선명하게.</span>
        </h1>

        <Link
          to="/spec"
          className="group mt-7 inline-flex items-center gap-3 text-[12px] font-bold text-brand transition-colors duration-300 hover:text-brand-strong"
        >
          내 연봉 진단하기
          <span
            aria-hidden="true"
            className="transition-transform duration-300 ease-out group-hover:translate-x-1"
          >
            →
          </span>
        </Link>

        <p className="mt-5 flex items-center gap-2 text-[9px] tracking-[-0.2px] text-text-muted">
          <span>공공 고용 데이터 기반</span>
          <span>·</span>
          <span>3분 진단</span>
          <span>·</span>
          <span>무료 이용</span>
        </p>
      </div>

      <SectionScrollLink label="서비스 알아보기" target="value" />
    </section>
  );
}
