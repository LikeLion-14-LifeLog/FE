import chevronDown from "@/assets/icons/chevronDown.svg";

export default function BasicInfoSection() {
  return (
    <section className="border-b border-border pb-8">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-[10px] font-bold text-brand-strong">
          01
        </span>
        <h2 className="text-[15px] font-semibold text-text-primary">
          기본 정보 <span className="text-brand">*</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-[12px] font-medium text-text-primary">
          출생년도
          <input
            type="number"
            placeholder="예: 1999"
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[12px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </label>

        <label className="flex flex-col gap-2 text-[12px] font-medium text-text-primary">
          거주지역
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

        <div className="col-span-2 flex flex-col gap-2">
          <label
            htmlFor="desired-job"
            className="text-[12px] font-medium text-text-primary"
          >
            희망 직무
          </label>
          <div className="flex h-10 overflow-hidden rounded-lg border border-border focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
            <input
              id="desired-job"
              type="text"
              readOnly
              placeholder="직무를 검색해 선택해 주세요"
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
      </div>
    </section>
  );
}