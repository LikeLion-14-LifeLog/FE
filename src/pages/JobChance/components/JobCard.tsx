import BookmarkButton from "./BookmarkButton";

export interface JobCardProps {
  category: string;
  dDay: string;
  title: string;
  details: string[];
  salary: string;
  company: string;
  bookmarkCount: number;
  isBookmarked?: boolean;
  onBookmarkClick?: () => void;
  onDetailClick?: () => void;
  className?: string;
}

const TAB_PATH = "M0.5 0.5C0.5 23 30.5 25.5 30.5 50.5C30.5 75.5 0.5 78 0.5 100.5";

export default function JobCard({
  category,
  dDay,
  title,
  details,
  salary,
  company,
  bookmarkCount,
  isBookmarked = false,
  onBookmarkClick,
  onDetailClick,
  className = "",
}: JobCardProps) {
  return (
    <article className={`relative h-54 w-full min-w-0 ${className}`}>
      <div
        className="relative flex h-full w-full flex-col justify-between overflow-clip rounded-3xl border border-[#E2E8F0] px-5.5 pt-5.5 pb-5"
        style={{
          backgroundColor: "#fff",
          backgroundImage:
            "radial-gradient(53% 50% at 50% 50%, rgb(94 234 212 / 0.55) 0%, rgb(153 246 228 / 0.38) 30%, rgb(204 251 241 / 0.18) 65%, rgb(240 253 250 / 0) 100%)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 size-[173px] -translate-1/2 rounded-full border border-[#2DD4BF]/35"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 size-[313px] -translate-1/2 rounded-full border border-[#2DD4BF]/20"
        />

        <div className="relative flex w-full flex-col gap-2 pr-17">
          <div className="flex items-center gap-2">
            <span className="text-xs leading-[18px] font-semibold text-[#64748b]">
              {category}
            </span>
            <span className="rounded-md py-px text-[11.5px] font-bold text-[#334155]">
              {dDay}
            </span>
          </div>
          <h3 className="truncate text-base leading-[21.6px] font-extrabold tracking-[-0.3px] text-[#0f172a]">
            {title}
          </h3>
          <div className="text-[12.5px] leading-[18.75px] text-[#64748b]">
            {details.map((line) => (
              <p key={line} className="truncate">
                {line}
              </p>
            ))}
          </div>
        </div>

        <p className="relative text-[14.5px] leading-[21.75px] font-bold tracking-[-0.145px] text-[#0d9488]">
          {salary}
        </p>

        <p className="relative truncate text-[13.5px] leading-[20.25px] font-bold text-[#334155]">
          {company}
        </p>

        <BookmarkButton
          count={bookmarkCount}
          isBookmarked={isBookmarked}
          onClick={onBookmarkClick}
          className="absolute top-[-1px] right-7.5"
        />
      </div>

      <svg
        aria-hidden
        className="pointer-events-none absolute top-[92px] -right-7.5"
        width="31"
        height="101"
        viewBox="0 0 31 101"
        fill="none"
      >
        <path d={`${TAB_PATH}H0V0.5Z`} fill="#fff" />
        <path d={TAB_PATH} stroke="#E2E8F0" />
      </svg>

      <button
        type="button"
        onClick={onDetailClick}
        className="absolute top-[132px] right-[-20.6px] flex cursor-pointer items-center gap-0.5 text-[12.5px] leading-[18.75px] font-bold whitespace-nowrap text-[#0d9488] hover:opacity-80"
      >
        상세 요건 확인
        <img src="/jobs/mintArrow.svg" alt="" className="size-4" />
      </button>
    </article>
  );
}
