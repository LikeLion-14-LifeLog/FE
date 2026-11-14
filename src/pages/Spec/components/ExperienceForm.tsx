import type { Experience } from "@/types/spec/experience";
import chevronDown from "@/assets/icons/chevronDown.svg";
import {
  fieldClass,
  labelClass,
  cancelClass,
  saveClass,
} from "./formStyles";

type Props = {
  value: Experience;
  activityNumber: number;
  canSave: boolean;
  onChange: (changes: Partial<Experience>) => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function ExperienceForm({
  value,
  activityNumber,
  canSave,
  onChange,
  onSave,
  onCancel,
}: Props) {
  const invalidPeriod =
    !!value.startedYearMonth &&
    !!value.endedYearMonth &&
    value.startedYearMonth > value.endedYearMonth;

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h3 className="border-b border-border pb-4 text-[13px] font-semibold text-text-primary">
        활동 {String(activityNumber).padStart(2, "0")}
      </h3>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          활동 구분
          <div className="relative">
            <select
              value={value.type}
              onChange={(e) => onChange({ type: e.target.value })}
              className={`${fieldClass} cursor-pointer appearance-none pr-9`}
            >
              <option value="" disabled>선택해 주세요</option>
              <option value="INTERNSHIP">직무 경험</option>
            </select>
            <img
              src={chevronDown}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
            />
          </div>
        </label>

        <label className={labelClass}>
          기관·소속
          <input
            value={value.organizationName ?? ""}
            onChange={(e) =>
              onChange({ organizationName: e.target.value })
            }
            placeholder="회사, 주최 기관 또는 소속"
            className={fieldClass}
          />
        </label>

        <label className={`${labelClass} sm:col-span-2`}>
          활동명
          <input
            value={value.title}
            onChange={(e) => onChange({ title: e.target.value })}
            maxLength={255}
            placeholder="직무명, 수상명 또는 과정명"
            className={fieldClass}
          />
        </label>

        <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
          <span className="text-[12px] font-medium text-text-primary">
            활동 기간
          </span>
          <div className="flex items-center gap-2">
            <input
              type="month"
              aria-label="활동 시작 연월"
              value={value.startedYearMonth}
              onChange={(e) =>
                onChange({ startedYearMonth: e.target.value })
              }
              onClick={(e) => e.currentTarget.showPicker?.()}
              className={`${fieldClass} min-w-0 flex-1 cursor-pointer`}
            />
            <span className="text-[12px] text-text-muted">—</span>
            <input
              type="month"
              aria-label="활동 종료 연월"
              value={value.endedYearMonth}
              min={value.startedYearMonth || undefined}
              onChange={(e) =>
                onChange({ endedYearMonth: e.target.value })
              }
              onClick={(e) => e.currentTarget.showPicker?.()}
              className={`${fieldClass} min-w-0 flex-1 cursor-pointer`}
            />
          </div>

          {invalidPeriod && (
            <p role="alert" className="text-[11px] text-text-secondary">
              종료 연월은 시작 연월보다 빠를 수 없습니다.
            </p>
          )}
        </div>

        <label className={`${labelClass} sm:col-span-2`}>
          주요 역할 및 성과
          <textarea
            value={value.description}
            onChange={(e) =>
              onChange({ description: e.target.value })
            }
            maxLength={300}
            rows={4}
            placeholder="담당 업무, 사용 기술과 구체적인 성과를 입력해 주세요."
            className="min-h-28 w-full resize-none rounded-lg border border-border bg-white px-3 py-2.5 text-[12px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
        <button type="button" onClick={onCancel} className={cancelClass}>
          취소
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave || invalidPeriod}
          className={saveClass}
        >
          저장
        </button>
      </div>
    </div>
  );
}