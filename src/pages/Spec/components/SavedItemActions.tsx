type Props = {
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export default function SavedItemActions({
  disabled,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="flex shrink-0 items-center gap-2 text-[11px] font-semibold">
      <button
        type="button"
        disabled={disabled}
        onClick={onEdit}
        className="cursor-pointer text-brand-strong disabled:cursor-not-allowed disabled:opacity-40"
      >
        수정
      </button>
      <span aria-hidden="true" className="text-border-strong">|</span>
      <button
        type="button"
        disabled={disabled}
        onClick={onDelete}
        className="cursor-pointer text-text-secondary disabled:cursor-not-allowed disabled:opacity-40"
      >
        삭제
      </button>
    </div>
  );
}