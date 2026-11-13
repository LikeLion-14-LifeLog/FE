import type {
  QualificationDraft,
  ScoreType,
} from "@/types/spec/qualification";
import chevronDown from "@/assets/icons/chevronDown.svg";

type Props = {
  draft: QualificationDraft;
  canSave: boolean;
  onChange: (value: QualificationDraft) => void;
  onSave: () => void;
  onCancel: () => void;
};

const fieldClass =
  "h-10 w-full rounded-lg border border-border bg-white px-3 text-[12px] outline-none focus:border-brand focus:ring-1 focus:ring-brand";

const labelClass =
  "flex flex-col gap-2 text-[12px] font-medium text-text-primary";

const scoreTypes: { value: ScoreType; label: string }[] = [
  { value: "NUMERIC", label: "숫자 점수" },
  { value: "GRADE", label: "등급" },
  { value: "NUMERIC_AND_GRADE", label: "숫자 및 등급" },
  { value: "NONE", label: "점수 없음" },
];

export default function QualificationForm({
  draft,
  canSave,
  onChange,
  onSave,
  onCancel,
}: Props) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      {draft.kind === "certificate" ? (
        <div className="grid grid-cols-2 gap-4">
          <div className={`${labelClass} col-span-2`}>
            <label htmlFor="certificate-name">자격증명</label>
            <div className="flex h-10 overflow-hidden rounded-lg border border-border focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
              <input
                id="certificate-name"
                value={draft.value.certificateName}
                onChange={(e) =>
                  onChange({
                    kind: "certificate",
                    value: {
                      ...draft.value,
                      certificateName: e.target.value,
                      certificateId: null,
                    },
                  })
                }
                placeholder="자격증명을 입력해 주세요"
                className="min-w-0 flex-1 bg-white px-3 text-[12px] outline-none"
              />
              {/* TODO: GET /api/certifications 검색 모달 연결 */}
              <button
                type="button"
                disabled
                className="px-3 text-[11px] font-semibold text-text-muted disabled:cursor-not-allowed"
              >
                검색
              </button>
            </div>
          </div>

          <label className={`${labelClass} col-span-2`}>
            취득 연월
            <input
              type="month"
              value={draft.value.acquiredYearMonth}
              onChange={(e) =>
                onChange({
                  kind: "certificate",
                  value: {
                    ...draft.value,
                    acquiredYearMonth: e.target.value,
                  },
                })
              }
              className={fieldClass}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className={`${labelClass} col-span-2`}>
            <label htmlFor="language-exam-name">어학시험명</label>
            <div className="flex h-10 overflow-hidden rounded-lg border border-border focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
              <input
                id="language-exam-name"
                value={draft.value.languageExamName}
                onChange={(e) =>
                  onChange({
                    kind: "language",
                    value: {
                      ...draft.value,
                      languageExamName: e.target.value,
                      languageExamId: null,
                    },
                  })
                }
                placeholder="어학시험명을 입력해 주세요"
                className="min-w-0 flex-1 bg-white px-3 text-[12px] outline-none"
              />
              {/* TODO: GET /api/language-exams 결과의 ID와 scoreType 선택 */}
              <button
                type="button"
                disabled
                className="px-3 text-[11px] font-semibold text-text-muted disabled:cursor-not-allowed"
              >
                검색
              </button>
            </div>
          </div>

          <label className={`${labelClass} col-span-2`}>
            점수 유형 (Mock)
            <div className="relative">
              <select
                value={draft.value.scoreType}
                onChange={(e) => {
                  const scoreType =
                    scoreTypes.find(
                      (item) => item.value === e.target.value,
                    )?.value ?? "";

                  onChange({
                    kind: "language",
                    value: {
                      ...draft.value,
                      scoreType,
                      scoreNumeric: "",
                      scoreGrade: "",
                    },
                  });
                }}
                className={`${fieldClass} appearance-none pr-10`}
              >
                <option value="" disabled>
                  선택해 주세요
                </option>
                {scoreTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <img
                src={chevronDown}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
              />
            </div>
          </label>

          {(draft.value.scoreType === "NUMERIC" ||
            draft.value.scoreType === "NUMERIC_AND_GRADE") && (
            <label className={labelClass}>
              숫자 점수
              <input
                type="number"
                value={draft.value.scoreNumeric}
                onChange={(e) =>
                  onChange({
                    kind: "language",
                    value: {
                      ...draft.value,
                      scoreNumeric: e.target.value,
                    },
                  })
                }
                placeholder="점수 입력"
                className={fieldClass}
              />
            </label>
          )}

          {(draft.value.scoreType === "GRADE" ||
            draft.value.scoreType === "NUMERIC_AND_GRADE") && (
            <label className={labelClass}>
              등급
              <input
                value={draft.value.scoreGrade}
                onChange={(e) =>
                  onChange({
                    kind: "language",
                    value: {
                      ...draft.value,
                      scoreGrade: e.target.value,
                    },
                  })
                }
                placeholder="등급 입력"
                className={fieldClass}
              />
            </label>
          )}

          <label className={labelClass}>
            취득 연월
            <input
              type="month"
              value={draft.value.acquiredYearMonth}
              onChange={(e) =>
                onChange({
                  kind: "language",
                  value: {
                    ...draft.value,
                    acquiredYearMonth: e.target.value,
                  },
                })
              }
              className={fieldClass}
            />
          </label>

          <label className={labelClass}>
            만료 연월
            <input
              type="month"
              value={draft.value.expiresYearMonth}
              onChange={(e) =>
                onChange({
                  kind: "language",
                  value: {
                    ...draft.value,
                    expiresYearMonth: e.target.value,
                  },
                })
              }
              className={fieldClass}
            />
          </label>
        </div>
      )}

      <p className="mt-4 text-[11px] text-text-muted">
        검색 기능 연결 전에는 이 화면에서만 임시 등록됩니다.
      </p>

      <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-5 py-2 text-[12px] text-text-secondary transition-colors hover:border-text-primary hover:text-text-primary"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="rounded-lg bg-text-primary px-5 py-2 text-[12px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-border disabled:text-text-muted"
        >
          저장
        </button>
      </div>
    </div>
  );
}