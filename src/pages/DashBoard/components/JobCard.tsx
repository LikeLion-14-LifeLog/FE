type JobCardProps = {
  /** 공고 제목 */
  title: string;
  /** 회사명 */
  company: string;
  /** 근무 지역 */
  location?: string;
  /** 마감까지 남은 일수 (null 이면 상시 채용) */
  dDay?: number | null;
  /** 예상 연봉 문구*/
  salary?: string;
  /** 기술 스택 */
  skills?: string[];
  /** 상세보기 클릭 */
  onDetailClick?: () => void;
  className?: string;
};

const formatDDay = (dDay: number | null) => {
  if (dDay === null) return "상시 채용";
  return dDay <= 0 ? "D-Day" : `D-${dDay}`;
};

/** 대시보드 추천 채용 공고 카드 */
const JobCard = ({
  title,
  company,
  location,
  dDay,
  salary,
  skills = [],
  onDetailClick,
  className = "",
}: JobCardProps) => {
  const meta = [company, location].filter(Boolean).join(" · ");

  return (
    <article
      className={`flex w-full flex-col rounded-[14px] border-[1.067px] border-[#e1e7e5] bg-white px-[22px] pt-[23px] pb-[18px] drop-shadow-[0px_7px_10px_rgba(28,50,44,0.04)] ${className}`}
    >
      <p className="h-3 text-right text-[8px] leading-3 tracking-[0.096px] text-text-muted">
        {dDay !== undefined && formatDDay(dDay)}
      </p>

      <h3 className="mt-[17px] truncate text-[14px] leading-[19.6px] tracking-[-0.448px] text-text-primary">
        {title}
      </h3>

      <p className="mt-[7px] truncate text-[9px] leading-[13.5px] tracking-[0.096px] text-text-muted">
        {meta}
      </p>

      {salary && (
        <p className="mt-[22px] text-[11px] leading-[16.5px] font-bold tracking-[0.096px] text-brand-strong">
          예상 연봉 {salary}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t-[1.067px] border-[#edf1ef] pt-[13px]">
        <small className="truncate text-[8px] leading-3 tracking-[0.096px] text-[#929e9a]">
          {skills.join(" · ")}
        </small>

        <button
          type="button"
          onClick={onDetailClick}
          className="flex shrink-0 cursor-pointer items-center gap-[5px] text-[9px] leading-[13.5px] font-bold tracking-[0.096px] text-text-primary transition-colors hover:text-brand-strong"
        >
          상세보기
          <img
            src="/dashboard/blackArrow.svg"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="h-auto w-2 shrink-0"
          />
        </button>
      </div>
    </article>
  );
};

export default JobCard;
