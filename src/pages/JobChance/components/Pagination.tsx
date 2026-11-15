interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const isFirst = page === 1;
  const isLast = page === totalPages;

  return (
    <nav aria-label="페이지" className="flex items-center justify-center gap-7 pt-16">
      <button
        type="button"
        aria-label="이전 페이지"
        disabled={isFirst}
        onClick={() => onChange(page - 1)}
        className="flex h-8 cursor-pointer items-center pr-4 disabled:cursor-default disabled:opacity-50"
      >
        <img src="/jobs/chevronLeft.svg" alt="" className="size-5.5" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          aria-current={n === page ? "page" : undefined}
          onClick={() => onChange(n)}
          className={`flex size-8 cursor-pointer items-center justify-center rounded-md text-[16.25px] ${
            n === page ? "font-bold text-[#0d9488]" : "font-semibold text-[#64748b] hover:text-[#0f172a]"
          }`}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        aria-label="다음 페이지"
        disabled={isLast}
        onClick={() => onChange(page + 1)}
        className="flex h-8 cursor-pointer items-center pl-4 disabled:cursor-default disabled:opacity-50"
      >
        <img src="/jobs/chevronRight.svg" alt="" className="size-5.5" />
      </button>
    </nav>
  );
}
