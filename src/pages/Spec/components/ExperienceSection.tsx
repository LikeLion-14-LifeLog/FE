export default function ExperienceSection() {
  return (
    <section className="border-b border-border pb-6">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-[10px] font-bold text-brand-strong">
          04
        </span>
        <h2 className="text-[15px] font-semibold text-text-primary">
          대외활동 및 실무 경험
        </h2>
        <span className="text-[11px] text-text-muted">선택</span>

        <button
          type="button"
          disabled
          className="ml-auto text-[11px] font-semibold text-brand-strong disabled:cursor-not-allowed"
        >
          + 새 활동 등록
        </button>
      </div>
    </section>
  );
}