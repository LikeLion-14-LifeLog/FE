import chevronDown from "@/assets/icons/chevronDown.svg";

export default function EducationSection() {
  return (
    <section className="border-b border-border pb-8">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-[10px] font-bold text-brand-strong">
          02
        </span>
        <h2 className="text-[15px] font-semibold text-text-primary">
          학력 사항 <span className="text-brand">*</span>
        </h2>
        <button
          type="button"
          disabled
          className="ml-auto text-[11px] font-semibold text-brand-strong disabled:cursor-not-allowed"
        >
          + 학력 추가
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white p-5">
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2 text-[12px] font-medium text-text-primary">
            학위 구분
            <div className="relative">
              <select
                defaultValue=""
                className="h-10 w-full appearance-none rounded-lg border border-border bg-white px-3 pr-10 text-[12px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              >
                <option value="" disabled>
                  선택해 주세요
                </option>
                <option value="HIGH_SCHOOL">고등학교</option>
                <option value="UNIVERSITY">대학교</option>
                <option value="MASTER">석사</option>
                <option value="DOCTOR">박사</option>
              </select>
              <img
                src={chevronDown}
                alt=""
                className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
              />
            </div>
          </label>

          <label className="flex flex-col gap-2 text-[12px] font-medium text-text-primary">
            학교 소재지
            <div className="relative">
              <select
                defaultValue=""
                className="h-10 w-full appearance-none rounded-lg border border-border bg-white px-3 pr-10 text-[12px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              >
                <option value="" disabled>
                  선택해 주세요
                </option>
              </select>
              <img
                src={chevronDown}
                alt=""
                className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
              />
            </div>
          </label>

          <label className="flex flex-col gap-2 text-[12px] font-medium text-text-primary">
            전공 계열
            <div className="relative">
              <select
                defaultValue=""
                className="h-10 w-full appearance-none rounded-lg border border-border bg-white px-3 pr-10 text-[12px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              >
                <option value="" disabled>
                  선택해 주세요
                </option>
              </select>
              <img
                src={chevronDown}
                alt=""
                className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
              />
            </div>
          </label>

          <div className="flex flex-col gap-2">
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
                placeholder="전공을 검색해 선택해 주세요"
                className="min-w-0 flex-1 bg-white px-3 text-[12px] outline-none"
              />
              <button
                type="button"
                disabled
                className="px-3 text-[11px] font-semibold text-brand-strong disabled:cursor-not-allowed"
              >
                검색
              </button>
            </div>
          </div>

          <label className="col-span-2 flex flex-col gap-2 text-[12px] font-medium text-text-primary">
            졸업(예정) 시기
            <input
              type="month"
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[12px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
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
                step="0.01"
                placeholder="취득 학점"
                className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-white px-3 text-[12px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />

              <div className="relative w-24 shrink-0">
                <select
                  defaultValue="4.5"
                  aria-label="학점 만점 기준"
                  className="h-10 w-full appearance-none rounded-lg border border-border bg-white px-3 pr-8 text-[12px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                >
                  <option value="4.5">4.5</option>
                  <option value="4.3">4.3</option>
                  <option value="4.0">4.0</option>
                </select>
                <img
                  src={chevronDown}
                  alt=""
                  className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            disabled
            className="rounded-lg border border-border px-6 py-2 text-[12px] text-text-secondary transition-colors hover:border-text-primary hover:text-text-primary disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            type="button"
            disabled
            className="rounded-lg bg-text-primary px-8 py-2 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-border-strong/50"
          >
            저장
          </button>
        </div>
      </div>
    </section>
  );
}