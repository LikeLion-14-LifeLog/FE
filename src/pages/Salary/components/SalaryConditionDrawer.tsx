import { useEffect, useRef, useState } from "react";
import { getSavedSpecProfileMock } from "@/apis/spec";
import checkIcon from "@/assets/icons/check.svg";
import { useCurrentUser } from "@/store/authStore";
import type {
  SalaryCondition,
  SalaryConditionOption,
  SalaryChanges,
} from "@/types/salary";
import type { LanguageScore } from "@/types/spec/qualification";

type Props = {
  condition: SalaryCondition;
  currentLanguages?: LanguageScore[];
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

export function OptionRow({
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
  currentLanguages = [],
  onClose,
  onApply,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const email = useCurrentUser()?.email;
  const [draft, setDraft] = useState(selected);
  const [keyword, setKeyword] = useState("");

  const isCertificate = condition.field === "CERTIFICATE";
  const isLanguage = condition.field === "LANGUAGE";
  const selectedLanguages = draft.flatMap(
    (item) => item.changes.languageScores ?? [],
  );
  const opicGrades = ["NL", "NM", "NH", "IL", "IM1", "IM2", "IM3", "IH", "AL"];
  const languageError = (
    score: NonNullable<SalaryChanges["languageScores"]>[number],
  ) => {
    const owned = currentLanguages.filter(
      (item) => item.languageExamId === score.languageExamId,
    );
    if (score.languageExamId === 1) {
      return score.scoreNumeric === null ||
        !Number.isInteger(score.scoreNumeric) ||
        score.scoreNumeric < 0 ||
        score.scoreNumeric > 990 ||
        owned.some(
          (item) =>
            item.scoreNumeric !== "" &&
            Number(item.scoreNumeric) >= score.scoreNumeric!,
        )
        ? "현재 점수보다 높고 990점 이하인 목표 점수를 입력해 주세요."
        : null;
    }
    if (score.languageExamId === 7) {
      const rank = opicGrades.indexOf(
        (score.scoreGrade ?? "").trim().toUpperCase(),
      );
      return rank < 0 ||
        owned.some(
          (item) =>
            item.scoreGrade &&
            opicGrades.indexOf(item.scoreGrade.trim().toUpperCase()) >= rank,
        )
        ? "현재 등급보다 높은 유효한 OPIc 등급을 입력해 주세요."
        : null;
    }
    return score.scoreGrade?.trim() ? null : "목표 등급을 입력해 주세요.";
  };
  const invalidLanguage = selectedLanguages.some(
    (score) => !!languageError(score),
  );
  const updateLanguage = (examId: number, value: number | string | null) => {
    setDraft((previous) =>
      previous.map((item) => {
        if (item.changes.languageScores?.[0]?.languageExamId !== examId)
          return item;
        return {
          ...item,
          changes: {
            ...item.changes,
            languageScores: [
              {
                languageExamId: examId,
                scoreNumeric:
                  examId === 1
                    ? typeof value === "number"
                      ? value
                      : null
                    : null,
                scoreGrade:
                  examId === 1
                    ? null
                    : typeof value === "string"
                      ? value
                      : null,
              },
            ],
          },
        };
      }),
    );
  };
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
    if (!isCertificate && !isLanguage) {
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
            <h2
              id="salary-drawer-title"
              className="mt-2 text-[20px] font-medium"
            >
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
              : isLanguage
                ? "추가할 어학 시험을 여러 개 선택할 수 있어요."
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

          {isLanguage &&
            selectedLanguages.map((score) => {
              const isNumeric = score.languageExamId === 1;
              const owned = currentLanguages.filter(
                (item) => item.languageExamId === score.languageExamId,
              );
              const error = languageError(score);
              return (
                <div key={score.languageExamId} className="mb-4">
                  <label className="block text-[12px] font-medium text-text-primary">
                    {isNumeric ? "TOEIC 목표 점수" : "OPIc 목표 등급"}
                    {isNumeric ? (
                      <input
                        type="number"
                        min={0}
                        max={990}
                        step={1}
                        value={score.scoreNumeric ?? ""}
                        onChange={(event) =>
                          updateLanguage(
                            score.languageExamId,
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                          )
                        }
                        placeholder="목표 점수 입력"
                        className="mt-2 h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-brand"
                      />
                    ) : (
                      <select
                        value={score.scoreGrade ?? ""}
                        onChange={(event) =>
                          updateLanguage(
                            score.languageExamId,
                            event.target.value,
                          )
                        }
                        className="mt-2 h-10 w-full rounded-lg border border-border bg-bg-page px-3 text-[13px] outline-brand"
                      >
                        <option value="">목표 등급 선택</option>
                        {opicGrades.map((grade) => (
                          <option key={grade} value={grade}>
                            {grade}
                          </option>
                        ))}
                      </select>
                    )}
                  </label>
                  {owned.length > 0 && (
                    <p className="mt-2 text-[11px] text-text-muted">
                      현재{" "}
                      {owned
                        .map((item) => item.scoreNumeric || item.scoreGrade)
                        .filter(Boolean)
                        .join(", ")}{" "}
                      · 현재보다 높은 목표를 입력해 주세요.
                    </p>
                  )}
                  {error && (
                    <p role="alert" className="mt-2 text-[12px] text-red-500">
                      {error}
                    </p>
                  )}
                </div>
              );
            })}

          <fieldset className="border-t border-border-strong/80">
            <legend className="sr-only">{condition.label} 선택</legend>

            {!query && (
              <OptionRow
                label={condition.defaultSummary}
                type={isCertificate || isLanguage ? "checkbox" : "radio"}
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
                  type={isCertificate || isLanguage ? "checkbox" : "radio"}
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
            disabled={invalidLanguage}
            className="min-h-[46px] w-full cursor-pointer rounded-[9px] bg-text-primary px-4 text-[13px] font-bold text-white hover:bg-text-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            조건 적용
          </button>
        </footer>
      </div>
    </dialog>
  );
}
