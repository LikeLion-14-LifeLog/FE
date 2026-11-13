import type { Education } from "@/types/spec/education";
import type { SpecFormOptions } from "@/types/spec/profile";
import chevronDown from "@/assets/icons/chevronDown.svg";

type Props = {
  value: Education;
  options: SpecFormOptions;
  canSave: boolean;
  onChange: (changes: Partial<Education>) => void;
  onSave: () => void;
  onCancel: () => void;
};

const fieldClass =
  "h-10 w-full rounded-lg border border-border bg-white px-3 text-[12px] outline-none focus:border-brand focus:ring-1 focus:ring-brand";

const labelClass =
  "flex flex-col gap-2 text-[12px] font-medium text-text-primary";

export default function EducationForm({
  value,
  options,
  canSave,
  onChange,
  onSave,
  onCancel,
}: Props) {
  const {
    degreeTypes,
    academicStatuses,
    schoolLocations,
    majorFields,
    gradeScales,
  } = options;

  const chevron = (
    <img
      src={chevronDown}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
    />
  );

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="grid grid-cols-2 gap-4">
        <label className={labelClass}>
          학력 유형
          <div className="relative">
            <select
              value={value.type}
              onChange={(e) => onChange({ type: e.target.value })}
              className={`${fieldClass} appearance-none pr-10`}
            >
              <option value="" disabled>
                선택해 주세요
              </option>
              {degreeTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {chevron}
          </div>
        </label>

        <label className={labelClass}>
          학적 상태
          <div className="relative">
            <select
              value={value.status}
              onChange={(e) => onChange({ status: e.target.value })}
              className={`${fieldClass} appearance-none pr-10`}
            >
              <option value="" disabled>
                선택해 주세요
              </option>
              {academicStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {chevron}
          </div>
        </label>

        <label className={labelClass}>
          학교 소재지
          <div className="relative">
            <select
              value={value.location}
              onChange={(e) => onChange({ location: e.target.value })}
              className={`${fieldClass} appearance-none pr-10`}
            >
              <option value="" disabled>
                선택해 주세요
              </option>
              {schoolLocations.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
            {chevron}
          </div>
        </label>

        <label className={labelClass}>
          전공 계열
          <div className="relative">
            <select
              value={value.majorAffiliation}
              onChange={(e) =>
                onChange({
                  majorAffiliation: e.target.value,
                  majorId: null,
                  majorName: "",
                })
              }
              className={`${fieldClass} appearance-none pr-10`}
            >
              <option value="" disabled>
                선택해 주세요
              </option>
              {majorFields.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {chevron}
          </div>
        </label>

        <div className="col-span-2 flex flex-col gap-2">
          <label
            htmlFor="major"
            className="text-[12px] font-medium text-text-primary"
          >
            전공명
          </label>
          <div className="flex h-10 overflow-hidden rounded-lg border border-border focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
            <input
              id="major"
              type="text"
              readOnly
              value={value.majorName}
              placeholder="전공을 검색해 선택해 주세요"
              className="min-w-0 flex-1 bg-white px-3 text-[12px] outline-none"
            />
            {/* TODO: GET /api/majors의 majorId, name, mainField 연결 */}
            <button
              type="button"
              disabled
              className="px-3 text-[11px] font-semibold text-brand-strong disabled:cursor-not-allowed"
            >
              검색
            </button>
          </div>
        </div>

        <label className={`${labelClass} col-span-2`}>
          졸업(예정) 시기
          <input
            type="month"
            value={value.graduatedYearMonth}
            onChange={(e) =>
              onChange({ graduatedYearMonth: e.target.value })
            }
            className={fieldClass}
          />
        </label>

        <div className="col-span-2 flex flex-col gap-2">
          <label
            htmlFor="university-grade"
            className="text-[12px] font-medium text-text-primary"
          >
            졸업 학점
          </label>

          <div className="flex gap-3">
            <input
              id="university-grade"
              type="number"
              min="0"
              step="0.01"
              value={value.universityGrade}
              onChange={(e) =>
                onChange({ universityGrade: e.target.value })
              }
              placeholder="취득 학점"
              className={`${fieldClass} min-w-0 flex-1`}
            />

            <div className="relative w-24 shrink-0">
              <select
                value={value.universityStandardGrade}
                onChange={(e) =>
                  onChange({
                    universityStandardGrade: e.target.value,
                  })
                }
                aria-label="학점 만점 기준"
                className={`${fieldClass} appearance-none pr-8`}
              >
                <option value="" disabled>
                  만점
                </option>
                {gradeScales.map((scale) => (
                  <option key={scale} value={scale}>
                    {scale}
                  </option>
                ))}
              </select>
              {chevron}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-6 py-2 text-[12px] text-text-secondary transition-colors hover:border-text-primary hover:text-text-primary"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="rounded-lg bg-text-primary px-8 py-2 text-[12px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-border disabled:text-text-muted"
        >
          저장
        </button>
      </div>
    </div>
  );
}