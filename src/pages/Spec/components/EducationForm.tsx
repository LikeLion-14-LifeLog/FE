import { useState } from "react";
import type { Education } from "@/types/spec/education";
import type { SpecFormOptions } from "@/types/spec/profile";
import chevronDown from "@/assets/icons/chevronDown.svg";
import SearchModal from "./SearchModal";
import YearMonthField from "./YearMonthField";
import {
  fieldClass,
  labelClass,
  cancelClass,
  saveClass,
} from "./formStyles";
import {
  currentYearMonth,
  isValidGrade,
} from "../utils/specValidation";

type Props = {
  value: Education;
  options: SpecFormOptions;
  canSave: boolean;
  onChange: (changes: Partial<Education>) => void;
  onSave: () => void;
  onCancel: () => void;
};

const arrow = (
  <img
    src={chevronDown}
    alt=""
    aria-hidden="true"
    className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
  />
);

export default function EducationForm({
  value,
  options,
  canSave,
  onChange,
  onSave,
  onCancel,
}: Props) {
  const [searchOpen, setSearchOpen] = useState(false);

  const invalidGrade =
    !!value.universityGrade &&
    !!value.universityStandardGrade &&
    !isValidGrade(
      value.universityGrade,
      value.universityStandardGrade,
    );

  const invalidGraduation =
    value.status === "GRADUATED" &&
    !!value.graduatedYearMonth &&
    value.graduatedYearMonth > currentYearMonth();

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          학위 구분
          <div className="relative">
            <select
              value={value.type}
              onChange={(e) => onChange({ type: e.target.value })}
              className={`${fieldClass} cursor-pointer appearance-none pr-9`}
            >
              <option value="" disabled>선택해 주세요</option>
              {options.degreeTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {arrow}
          </div>
        </label>

        <label className={labelClass}>
          학교 소재지
          <div className="relative">
            <select
              value={value.location}
              onChange={(e) => onChange({ location: e.target.value })}
              className={`${fieldClass} cursor-pointer appearance-none pr-9`}
            >
              <option value="" disabled>선택해 주세요</option>
              {options.schoolLocations.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
            {arrow}
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
              className={`${fieldClass} cursor-pointer appearance-none pr-9`}
            >
              <option value="" disabled>선택해 주세요</option>
              {options.majorFields.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {arrow}
          </div>
        </label>

        <div className={labelClass}>
          <span>전공명</span>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            disabled={!value.majorAffiliation}
            className="flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 text-left transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:hover:border-border"
          >
            <span className={`min-w-0 truncate text-[12px] ${
              value.majorName ? "text-text-primary" : "text-text-muted"
            }`}>
              {value.majorName || "전공을 검색해 선택해 주세요"}
            </span>
            <span className={`shrink-0 text-[11px] font-semibold ${
              value.majorAffiliation ? "text-brand-strong" : "text-text-muted"
            }`}>
              검색
            </span>
          </button>
        </div>

        <div className="sm:col-span-2">
          <YearMonthField
            label="졸업(예정) 시기"
            value={value.graduatedYearMonth}
            max={
              value.status === "GRADUATED"
                ? currentYearMonth()
                : undefined
            }
            onChange={(graduatedYearMonth) =>
              onChange({ graduatedYearMonth })
            }
          />
          {invalidGraduation && (
            <p role="alert" className="mt-2 text-[11px] text-red-500">
              졸업 시기는 현재 연월 이후일 수 없습니다.
            </p>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
          <label
            htmlFor={`grade-${value.localId}`}
            className="text-[12px] font-medium text-text-primary"
          >
            졸업 학점
          </label>
          <div className="flex items-center gap-2">
            <input
              id={`grade-${value.localId}`}
              type="number"
              min={0}
              max={value.universityStandardGrade || undefined}
              step="0.01"
              value={value.universityGrade}
              onChange={(e) =>
                onChange({ universityGrade: e.target.value })
              }
              aria-invalid={invalidGrade}
              placeholder="취득 학점"
              className={`${fieldClass} flex-1 ${
                invalidGrade ? "border-red-400" : ""
              }`}
            />
            <span className="text-[12px] text-text-muted">/</span>
            <div className="relative w-24 shrink-0">
              <select
                aria-label="학점 만점 기준"
                value={value.universityStandardGrade}
                onChange={(e) =>
                  onChange({ universityStandardGrade: e.target.value })
                }
                className={`${fieldClass} cursor-pointer appearance-none pr-8`}
              >
                <option value="" disabled>만점</option>
                {options.gradeScales.map((scale) => (
                  <option key={scale} value={scale}>
                    {scale}
                  </option>
                ))}
              </select>
              {arrow}
            </div>
          </div>
          {invalidGrade && (
            <p role="alert" className="text-[11px] text-red-500">
              학점은 0 이상 {value.universityStandardGrade} 이하로
              소수점 둘째 자리까지 입력해 주세요.
            </p>
          )}
        </div>
      </div>

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

      {searchOpen && (
        <SearchModal
          kind="major"
          initialCategory={value.majorAffiliation}
          onSelect={(item) =>
            onChange({
              majorAffiliation: item.category ?? value.majorAffiliation,
              majorId: null,
              majorName: item.name,
            })
          }
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
}