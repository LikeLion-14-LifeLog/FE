type Props = {
  saving: boolean;
  canDiagnose: boolean;
  onSave: () => void;
  onDiagnose: () => void;
};

export default function SpecFooter({
  saving,
  canDiagnose,
  onSave,
  onDiagnose,
}: Props) {
  return (
    <footer className="fixed right-0 bottom-0 left-0 z-30 border-t border-border bg-white">
      <div className="mx-auto flex w-full max-w-[1040px] items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div>
          <p className="text-[12px] font-semibold text-text-primary">
            저장한 정보는 커리어 프로필에 반영됩니다.
          </p>
          <p className="mt-1 text-[10px] text-text-muted">
            이 페이지에서 언제든 정보를 수정할 수 있어요.
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-lg border border-text-primary px-4 py-2.5 text-[12px] font-semibold text-text-primary transition-colors hover:bg-bg-page disabled:cursor-wait disabled:opacity-40"
          >
            {saving ? "저장 중..." : "프로필 저장"}
          </button>

          <button
            type="button"
            onClick={onDiagnose}
            disabled={!canDiagnose || saving}
            className="rounded-lg bg-text-primary px-5 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-text-secondary disabled:cursor-not-allowed disabled:bg-border disabled:text-text-muted"
          >
            이 스펙으로 진단하기 →
          </button>
        </div>
      </div>
    </footer>
  );
}