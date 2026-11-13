import type { Experience } from "@/types/spec/experience";
import chevronDown from "@/assets/icons/chevronDown.svg";

type Props = {
  value: Experience;
  canSave: boolean;
  onChange: (changes: Partial<Experience>) => void;
  onSave: () => void;
  onCancel: () => void;
};

const fieldClass =
  "h-10 w-full rounded-lg border border-border bg-white px-3 text-[12px] outline-none focus:border-brand focus:ring-1 focus:ring-brand";

const labelClass =
  "flex flex-col gap-2 text-[12px] font-medium text-text-primary";

export default function ExperienceForm({
  value,
  canSave,
  onChange,
  onSave,
  onCancel,
}: Props) {
  const invalidPeriod =
    value.startedYearMonth !== "" &&
    value.endedYearMonth !== "" &&
    value.startedYearMonth > value.endedYearMonth;

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="grid grid-cols-2 gap-4">
        <label className={`${labelClass} col-span-2`}>
          활동 유형
          <div className="relative">
            <select
              value={value.type}
              onChange={(e) => onChange({ type: e.target.value })}
              className={`${fieldClass} appearance-none pr-10`}
            >
              <option value="" disabled>
                선택해 주세요
              </option>
              <option value="INTERNSHIP">인턴</option>
            </select>
            <img
              src={chevronDown}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
            />
          </div>
        </label>

        <label className={`${labelClass} col-span-2`}>
          활동명
          <input
            value={value.title}
            onChange={(e) => onChange({ title: e.target.value })}
            maxLength={255}
            placeholder="활동명을 입력해 주세요"
            className={fieldClass}
          />
        </label>

        <label className={labelClass}>
          시작 연월
          <input
            type="month"
            value={value.startedYearMonth}
            onChange={(e) =>
              onChange({ startedYearMonth: e.target.value })
            }
            className={fieldClass}
          />
        </label>

        <label className={labelClass}>
          종료 연월
          <input
            type="month"
            value={value.endedYearMonth}
            onChange={(e) =>
              onChange({ endedYearMonth: e.target.value })
            }
            className={fieldClass}
          />
        </label>

        {invalidPeriod && (
          <p
            role="alert"
            className="col-span-2 text-[11px] text-text-secondary"
          >
            종료 연월은 시작 연월보다 빠를 수 없습니다.
          </p>
        )}

        <label className={`${labelClass} col-span-2`}>
          활동 내용
          <textarea
            value={value.description}
            onChange={(e) =>
              onChange({ description: e.target.value })
            }
            maxLength={300}
            rows={4}
            placeholder="활동 내용을 입력해 주세요"
            className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2.5 text-[12px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
          <span className="self-end text-[10px] font-normal text-text-muted">
            {value.description.length}/300
          </span>
        </label>

        <fieldset className="col-span-2">
          <legend className="text-[12px] font-medium text-text-primary">
            수상 여부
          </legend>
          <div className="mt-3 flex gap-4 text-[12px] text-text-primary">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`awarded-${value.localId}`}
                checked={!value.awarded}
                onChange={() =>
                  onChange({
                    awarded: false,
                    organizerName: "",
                    awardGrade: "",
                  })
                }
                className="accent-brand"
              />
              미수상
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`awarded-${value.localId}`}
                checked={value.awarded}
                onChange={() => onChange({ awarded: true })}
                className="accent-brand"
              />
              수상
            </label>
          </div>
        </fieldset>

        {value.awarded && (
          <>
            <label className={labelClass}>
              주관 기관명
              <input
                value={value.organizerName}
                onChange={(e) =>
                  onChange({ organizerName: e.target.value })
                }
                placeholder="기관명 입력"
                className={fieldClass}
              />
            </label>

            <label className={labelClass}>
              수상 등급
              <input
                value={value.awardGrade}
                onChange={(e) =>
                  onChange({ awardGrade: e.target.value })
                }
                placeholder="수상 등급 입력"
                className={fieldClass}
              />
            </label>
          </>
        )}
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
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