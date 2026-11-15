import { useState } from "react";
import type {
  Certificate,
  LanguageScore,
  QualificationDraft,
} from "@/types/spec/qualification";
import { mockSearchItems } from "@/mocks/specSearch";
import chevronDown from "@/assets/icons/chevronDown.svg";
import SearchModal from "./SearchModal";
import YearMonthField from "./YearMonthField";
import {
  fieldClass,
  labelClass,
  cancelClass,
  saveClass,
  dateClass,
} from "./formStyles";
import {
  currentYearMonth,
  isValidYearMonth,
} from "../utils/specValidation";

type Props = {
  draft: QualificationDraft;
  canSave: boolean;
  canSwitchKind: boolean;
  onSwitchKind: (kind: QualificationDraft["kind"]) => void;
  onChange: (draft: QualificationDraft) => void;
  onSave: () => void;
  onCancel: () => void;
};

const arrow = (
  <img
    src={chevronDown}
    alt=""
    aria-hidden="true"
    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
  />
);

export default function QualificationForm({
  draft,
  canSave,
  canSwitchKind,
  onSwitchKind,
  onChange,
  onSave,
  onCancel,
}: Props) {
  const [searchOpen, setSearchOpen] = useState(false);

  const updateCertificate = (changes: Partial<Certificate>) => {
    if (draft.kind === "certificate") {
      onChange({
        kind: "certificate",
        value: { ...draft.value, ...changes },
      });
    }
  };

  const updateLanguage = (changes: Partial<LanguageScore>) => {
    if (draft.kind === "language") {
      onChange({
        kind: "language",
        value: { ...draft.value, ...changes },
      });
    }
  };

  const invalidScore =
    draft.kind === "language" &&
    !!draft.value.scoreNumeric.trim() &&
    !/^\d+(\.\d+)?$/.test(draft.value.scoreNumeric.trim());

  const invalidExpiry =
    draft.kind === "language" &&
    !!draft.value.expiresYearMonth &&
    !isValidYearMonth(draft.value.expiresYearMonth);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="flex gap-6 border-b border-border px-5">
        {(["certificate", "language"] as const).map((kind) => (
          <button
            key={kind}
            type="button"
            aria-pressed={draft.kind === kind}
            disabled={!canSwitchKind && draft.kind !== kind}
            onClick={() => {
              if (draft.kind !== kind) onSwitchKind(kind);
            }}
            className={`cursor-pointer border-b-2 py-3 text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
              draft.kind === kind
                ? "border-brand text-text-primary"
                : "border-transparent text-text-muted"
            }`}
          >
            {kind === "certificate" ? "자격증" : "어학"}
          </button>
        ))}
      </div>

      <div className="p-5">
        <div className="mb-5 border-b border-border pb-4">
          <h3 className="text-[13px] font-semibold text-text-primary">
            {draft.kind === "certificate" ? "자격증 정보" : "어학 정보"}
          </h3>
          <p className="mt-1.5 text-[11px] text-text-muted">
            {draft.kind === "certificate"
              ? "국가자격과 민간 자격을 검색해 등록하세요."
              : "시험 종류와 점수, 유효기간을 입력해 주세요."}
          </p>
        </div>

        {draft.kind === "certificate" ? (
          <div className="space-y-4">
            <div className={labelClass}>
              <span>자격증명</span>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 text-left transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-brand"
              >
                <span className={`min-w-0 truncate text-[12px] ${
                  draft.value.certificateName
                    ? "text-text-primary"
                    : "text-text-muted"
                }`}>
                  {draft.value.certificateName ||
                    "자격증을 검색해 선택해 주세요"}
                </span>
                <span className="shrink-0 text-[11px] font-semibold text-brand-strong">
                  검색
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              {["자격 구분", "발급 기관"].map((title) => (
                <div
                  key={title}
                  className="flex min-h-12 items-center justify-between gap-2 py-3 sm:px-3 sm:first:pl-0 sm:last:pr-0"
                >
                  <span className="shrink-0 text-[11px] text-text-muted">
                    {title}
                  </span>
                  <span className="text-right text-[11px] font-medium text-text-secondary">
                    자격증 선택 시 자동 표시
                  </span>
                </div>
              ))}
            </div>

            <YearMonthField
              label="취득 시기"
              value={draft.value.acquiredYearMonth}
              max={currentYearMonth()}
              onChange={(acquiredYearMonth) =>
                updateCertificate({ acquiredYearMonth })
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className={labelClass}>
              <label htmlFor="language-exam">시험 종류</label>
              <div className="relative">
                <select
                  id="language-exam"
                  value={draft.value.languageExamName}
                  onChange={(event) =>
                    updateLanguage({
                      languageExamId: null,
                      languageExamName: event.target.value,
                      scoreType: "",
                      scoreNumeric: "",
                      scoreGrade: "",
                    })
                  }
                  className={`${fieldClass} cursor-pointer appearance-none pr-9`}
                >
                  <option value="">선택</option>
                  {mockSearchItems.language.map((item) => (
                    <option key={item.key} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {arrow}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                점수
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={draft.value.scoreNumeric}
                  onChange={(event) =>
                    updateLanguage({ scoreNumeric: event.target.value })
                  }
                  aria-invalid={invalidScore}
                  placeholder="예: 865"
                  className={`${fieldClass} ${
                    invalidScore ? "border-red-400" : ""
                  }`}
                />
                {invalidScore && (
                  <span className="text-[11px] font-normal text-red-500">
                    0 이상의 점수를 입력해 주세요.
                  </span>
                )}
              </label>

              <label className={labelClass}>
                등급
                <input
                  type="text"
                  value={draft.value.scoreGrade}
                  onChange={(event) =>
                    updateLanguage({ scoreGrade: event.target.value })
                  }
                  placeholder="예: IH"
                  className={fieldClass}
                />
              </label>
            </div>

            <label className={labelClass}>
              유효기간 만료일
              <input
                type="month"
                min="1900-01"
                value={draft.value.expiresYearMonth}
                onChange={(event) =>
                  updateLanguage({ expiresYearMonth: event.target.value })
                }
                onClick={(event) => event.currentTarget.showPicker?.()}
                aria-invalid={invalidExpiry}
                className={`${dateClass} ${
                  invalidExpiry ? "border-red-400" : ""
                }`}
              />
              {invalidExpiry && (
                <span className="text-[11px] font-normal text-red-500">
                  유효한 연월을 선택해 주세요.
                </span>
              )}
            </label>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <button type="button" onClick={onCancel} className={cancelClass}>
            취소
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className={saveClass}
          >
            저장
          </button>
        </div>
      </div>

      {searchOpen && draft.kind === "certificate" && (
        <SearchModal
          kind="certificate"
          onSelect={(item) =>
            updateCertificate({
              certificateId: null,
              certificateName: item.name,
            })
          }
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
}