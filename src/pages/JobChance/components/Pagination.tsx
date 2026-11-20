interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** 한 번에 보여줄 페이지 번호 개수 (1~5, 6~10 … 묶음 단위) */
const GROUP_SIZE = 5;

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const current = Math.min(Math.max(1, page), totalPages);
  const groupStart = Math.floor((current - 1) / GROUP_SIZE) * GROUP_SIZE + 1;
  const groupEnd = Math.min(groupStart + GROUP_SIZE - 1, totalPages);
  const pages = Array.from(
    { length: groupEnd - groupStart + 1 },
    (_, i) => groupStart + i
  );

  const hasPrevGroup = groupStart > 1;
  const hasNextGroup = groupEnd < totalPages;

  return (
    <nav aria-label="페이지" className="flex items-center justify-center gap-7 pt-16">
      <button
        type="button"
        aria-label="이전 페이지 묶음"
        disabled={!hasPrevGroup}
        onClick={() => onChange(groupStart - GROUP_SIZE)}
        className="flex h-8 cursor-pointer items-center pr-4 disabled:cursor-default disabled:opacity-50"
      >
        <img src="/jobs/chevronLeft.svg" alt="" className="size-5.5" />
      </button>

      {pages.map((n) => (
        <button
          key={n}
          type="button"
          aria-current={n === current ? "page" : undefined}
          onClick={() => onChange(n)}
          className={`flex size-8 cursor-pointer items-center justify-center rounded-md text-[16.25px] ${
            n === current ? "font-bold text-[#0d9488]" : "font-semibold text-[#64748b] hover:text-[#0f172a]"
          }`}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        aria-label="다음 페이지 묶음"
        disabled={!hasNextGroup}
        onClick={() => onChange(groupEnd + 1)}
        className="flex h-8 cursor-pointer items-center pl-4 disabled:cursor-default disabled:opacity-50"
      >
        <img src="/jobs/chevronRight.svg" alt="" className="size-5.5" />
      </button>
    </nav>
  );
}
