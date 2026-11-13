export default function QualificationSection() {
  return (
    <section className="border-b border-border pb-6">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-[10px] font-bold text-brand-strong">
          03
        </span>
        <h2 className="text-[15px] font-semibold text-text-primary">
          자격 및 어학
        </h2>
        <span className="text-[11px] text-text-muted">선택</span>

        <button
          type="button"
          disabled
          className="ml-auto text-[11px] font-semibold text-brand-strong disabled:cursor-not-allowed"
        >
          + 자격·어학 추가
        </button>
      </div>
    </section>
  );
}