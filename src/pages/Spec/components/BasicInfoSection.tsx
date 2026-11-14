import { useState } from "react";
import type { BasicInfo, RegionOption } from "@/types/spec/profile";
import chevronDown from "@/assets/icons/chevronDown.svg";
import SearchModal from "./SearchModal";
import { isValidBirthYear } from "../utils/specValidation";

type Props = {
  value: BasicInfo;
  onChange: (value: BasicInfo) => void;
  residentialAreas: RegionOption[];
};

const fieldClass =
  "h-10 w-full rounded-lg border border-border bg-white px-3 text-[12px] outline-none focus:border-brand focus:ring-1 focus:ring-brand";

export default function BasicInfoSection({
  value,
  onChange,
  residentialAreas,
}: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const invalidYear =
    value.birthYear !== "" && !isValidBirthYear(value.birthYear);

  return (
    <section className="border-b border-border pb-8">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-[10px] font-bold text-brand-strong">
          01
        </span>
        <h2 className="text-[15px] font-medium text-text-primary">
          기본 정보 <span className="text-brand">*</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-[12px] font-medium text-text-primary">
          출생년도
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={value.birthYear}
            onChange={(e) =>
              onChange({
                ...value,
                birthYear: e.target.value.replace(/\D/g, ""),
              })
            }
            aria-invalid={invalidYear}
            aria-describedby={invalidYear ? "birth-year-error" : undefined}
            placeholder="예: 1999"
            className={`${fieldClass} ${
              invalidYear ? "border-red-400 focus:border-red-400 focus:ring-red-400" : ""
            }`}
          />
          {invalidYear && (
            <span
              id="birth-year-error"
              className="text-[11px] font-normal text-red-500"
            >
              1900년부터 {new Date().getFullYear()}년까지 입력해 주세요.
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2 text-[12px] font-medium text-text-primary">
          거주지역
          <div className="relative">
            <select
              value={value.residenceRegion}
              onChange={(e) =>
                onChange({ ...value, residenceRegion: e.target.value })
              }
              className={`${fieldClass} cursor-pointer appearance-none pr-10`}
            >
              <option value="" disabled>
                선택해 주세요
              </option>
              {residentialAreas.map((area) => (
                <option key={area.code} value={area.code}>
                  {area.name}
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

        <div className="col-span-2 flex flex-col gap-2">
          <span className="text-[12px] font-medium text-text-primary">
            희망 직무
          </span>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 text-left transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-brand"
          >
            <span
              className={`min-w-0 truncate text-[12px] ${
                value.jobName ? "text-text-primary" : "text-text-muted"
              }`}
            >
              {value.jobName || "직무를 검색해 선택해 주세요"}
            </span>
            <span className="shrink-0 text-[11px] font-semibold text-brand-strong">
              검색
            </span>
          </button>
        </div>
      </div>

      {searchOpen && (
        <SearchModal
          kind="job"
          onSelect={(item) =>
            onChange({
              ...value,
              jobId: null,
              jobName: item.name,
            })
          }
          onClose={() => setSearchOpen(false)}
        />
      )}
    </section>
  );
}