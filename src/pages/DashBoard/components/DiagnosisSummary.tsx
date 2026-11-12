import type { CardProfile, DiagnosisResult } from "@/types/dashboard";
import NeckCard from "./NeckCard";
import CheckChip from "./CheckChip";
import StatusBadge from "./StatusBadge";
import TextLink from "./TextLink";

type DiagnosisSummaryProps = {
  profile: CardProfile;
  diagnosis: DiagnosisResult;
  editSpecPath?: string;
};

const HERO_BACKGROUND =
  "radial-gradient(circle at 14% 52%, rgba(39,184,162,0.11) 0%, rgba(39,184,162,0) 250px), linear-gradient(122deg, #f2faf8 7.7%, #ffffff 73.7%)";

const DiagnosisSummary = ({
  profile,
  diagnosis,
  editSpecPath = "/spec",
}: DiagnosisSummaryProps) => {
  const { expectedSalary, topPercent, specs } = diagnosis;

  return (
    <section
      className="grid min-h-[350px] grid-cols-1 items-center gap-[52px] rounded-[22px] px-6 pt-[26px] pb-[30px] md:grid-cols-[270px_1fr] md:pr-[52px] md:pl-[26px]"
      style={{ backgroundImage: HERO_BACKGROUND }}
    >
      <div className="flex justify-center">
        <NeckCard
          profile={profile}
          className="drop-shadow-[10px_18px_40px_rgba(22,48,42,0.16)]"
        />
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="pt-[2.5px]">
          <StatusBadge>진단 완료</StatusBadge>
        </div>

        <h1 className="mt-[14px] text-[25px] leading-[37.5px] tracking-[-0.8px] text-text-primary">
          현재 스펙 기반 예상 초봉
        </h1>

        <p className="mt-[5px] tracking-[-1.16px]">
          <strong className="text-[29px] leading-[43.5px] font-bold text-brand-strong">
            {expectedSalary.toLocaleString()}만 원
          </strong>{" "}
          <span className="text-[17px] leading-[25.5px] font-bold text-text-primary">
            (비교 집단 상위 {topPercent}%)
          </span>
        </p>

        <p className="mt-[13px] text-[10px] leading-[17px] tracking-[0.096px] text-[#788580]">
          한국고용정보원 청년패널 및 IT 기업 채용 데이터를 기반으로, 현재 조건과
          유사한 취업자의 실제 첫 연봉을 추정했습니다.
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <h2 className="text-[9px] leading-[13.5px] font-bold tracking-[0.096px] text-text-primary">
            현재 산출에 반영된 핵심 스펙
          </h2>
          <TextLink to={editSpecPath}>내 스펙 입력·수정</TextLink>
        </div>

        <ul className="mt-[10px] flex flex-wrap gap-2">
          {specs.map((spec) => (
            <li key={spec}>
              <CheckChip>{spec}</CheckChip>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default DiagnosisSummary;
