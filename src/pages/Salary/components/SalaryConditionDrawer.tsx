import { useEffect, useRef, useState } from "react";
import { getSavedSpecProfileMock } from "@/apis/spec";
import checkIcon from "@/assets/icons/check.svg";
import { useCurrentUser } from "@/store/authStore";
import type {
  SalaryCondition,
  SalaryConditionOption,
} from "@/types/salary";

type Props = {
  condition: SalaryCondition;
  selected: SalaryConditionOption[];
  onClose: () => void;
  onApply: (options: SalaryConditionOption[]) => void;
};

type OptionRowProps = {
  label: string;
  description?: string;
  type: "radio" | "checkbox";
  checked: boolean;
  onChange: () => void;
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[\s()/.-]+/g, "");

function OptionRow({
  label,
  description,
  type,
  checked,
  onChange,
}: OptionRowProps) {
  return (
    <label className="relative flex min-h-[62px] cursor-pointer items-center justify-between gap-4 border-b border-border/90 px-0.5 py-4 hover:bg-bg-section/65 has-[:focus-visible]:bg-bg-section/65 has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-brand-strong">
      <input
        type={type}
        name="salary-condition"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />

      <span className="min-w-0">
        <span
          className={`block text-[13px] font-bold leading-5 ${
            checked ? "text-brand-strong" : "text-text-primary"
          }`}
        >
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-[11px] leading-4 text-text-muted">
            {description}
          </span>
        )}
      </span>

      <span
        aria-hidden="true"
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
          checked
            ? "border-transparent bg-brand/90"
            : "border-border-strong/65 bg-bg-page"
        }`}
      >
        {checked && (
          <img
            src={checkIcon}
            alt=""
            className="size-[11px] brightness-0 invert"
          />
        )}
      </span>
    </label>
  );
}

export default function SalaryConditionDrawer({
  condition,
  selected,
  onClose,
  onApply,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const email = useCurrentUser()?.email;
  const [draft, setDraft] = useState(selected);
  const [keyword, setKeyword] = useState("");

  const isCertificate = condition.field === "CERTIFICATE";
  const query = keyword.trim();
  const normalizedQuery = normalize(query);
  const isShortQuery = isCertificate && query.length === 1;
  const ownedCertificates =
    isCertificate && email
      ? (getSavedSpecProfileMock(email)?.certificates ?? [])
      : [];

  const options = condition.options.filter((option) => {
    if (!isCertificate) return true;

    const names = [option.label, ...(option.keywords ?? [])].map(normalize);
    const isOwned = ownedCertificates.some(
      ({ certificateId, certificateName }) =>
        (certificateId !== null &&
          option.changes.addCertificateIds?.includes(certificateId)) ||
        names.includes(normalize(certificateName)),
    );
    const matchesQuery =
      !query ||
      (normalizedQuery.length > 0 &&
        names.some((name) => name.includes(normalizedQuery)));

    return !isOwned && matchesQuery;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const chooseOption = (option: SalaryConditionOption) => {
    if (!isCertificate) {
      setDraft([option]);
      return;
    }

    setDraft((previous) =>
      previous.some((item) => item.optionValue === option.optionValue)
        ? previous.filter((item) => item.optionValue !== option.optionValue)
        : [...previous, option],
    );
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="salary-drawer-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-y-0 right-0 left-auto m-0 h-[calc(100dvh/var(--page-zoom,1))] max-h-none w-full max-w-[411px] translate-x-0 overflow-hidden border-l border-border/90 bg-bg-page p-0 text-text-primary shadow-xl backdrop:bg-text-primary/30 motion-safe:transition-transform motion-safe:duration-300 motion-safe:starting:translate-x-full"
    >
      <div className="flex h-full flex-col">
        <header className="flex min-h-[109px] shrink-0 items-start justify-between gap-4 border-b border-border/90 px-[25px] pt-8 pb-5">
          <div>
            <p className="text-[10px] font-bold text-brand-strong">조건 변경</p>
            <h2 id="salary-drawer-title" className="mt-2 text-[20px] font-medium">
              {condition.label}
            </h2>
          </div>
          <button
            type="button"
            aria-label="조건 선택 닫기"
            onClick={onClose}
            className="grid size-8 cursor-pointer place-items-center text-[22px] leading-none text-text-muted hover:text-text-primary"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-[25px] py-6">
          <p className="mb-5 text-[12px] leading-4 text-text-secondary">
            {isCertificate
              ? "추가할 자격증을 여러 개 선택할 수 있어요."
              : "변경할 조건을 선택해 주세요."}
          </p>

          {isCertificate && (
            <input
              type="search"
              aria-label="자격증 검색"
              placeholder="자격증 검색"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="mb-4 h-10 w-full rounded-lg border border-border px-3 text-[12px] outline-brand"
            />
          )}

          <fieldset className="border-t border-border-strong/80">
            <legend className="sr-only">{condition.label} 선택</legend>

            {!query && (
              <OptionRow
                label={condition.defaultSummary}
                type={isCertificate ? "checkbox" : "radio"}
                checked={draft.length === 0}
                onChange={() => setDraft([])}
              />
            )}

            {isShortQuery ? (
              <p role="status" className="py-4 text-[12px] text-text-secondary">
                검색어를 두 글자 이상 입력해 주세요.
              </p>
            ) : options.length === 0 ? (
              <p role="status" className="py-4 text-[12px] text-text-secondary">
                선택할 수 있는 옵션이 없습니다.
              </p>
            ) : (
              options.map((option) => (
                <OptionRow
                  key={option.optionValue}
                  label={option.label}
                  description={option.description}
                  type={isCertificate ? "checkbox" : "radio"}
                  checked={draft.some(
                    (item) => item.optionValue === option.optionValue,
                  )}
                  onChange={() => chooseOption(option)}
                />
              ))
            )}
          </fieldset>
        </div>

        <footer className="shrink-0 border-t border-border/90 px-[25px] py-[17px]">
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="min-h-[46px] w-full cursor-pointer rounded-[9px] bg-text-primary px-4 text-[13px] font-bold text-white hover:bg-text-primary/90"
          >
            {isCertificate ? "자격증 추가" : "조건 적용"}
          </button>
        </footer>
      </div>
    </dialog>
  );
}