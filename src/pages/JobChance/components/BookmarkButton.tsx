interface BookmarkButtonProps {
  count: number;
  isBookmarked: boolean;
  onClick?: () => void;
  className?: string;
}

export default function BookmarkButton({
  count,
  isBookmarked,
  onClick,
  className = "",
}: BookmarkButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isBookmarked ? "찜 해제" : "찜하기"}
      aria-pressed={isBookmarked}
      className={`flex w-7.5 cursor-pointer flex-col items-center gap-0.5 ${className}`}
    >
      <span className="relative h-[46px] w-7.5">
        {isBookmarked ? (
          <img
            src="/jobs/bookMarkSaved.svg"
            alt=""
            className="absolute top-[-3.7px] left-[-5.2px] h-[56.3px] w-[40.4px] max-w-none"
          />
        ) : (
          <img src="/jobs/bookMark.svg" alt="" className="h-[46px] w-7.5" />
        )}
      </span>
      <span
        className={`text-[11px] ${isBookmarked ? "font-bold text-[#0f766e]" : "font-medium text-[#64748b]"}`}
      >
        {count.toLocaleString()}
      </span>
    </button>
  );
}
