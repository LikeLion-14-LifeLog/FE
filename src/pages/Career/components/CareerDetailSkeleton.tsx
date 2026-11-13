const Bar = ({ className = "" }: { className?: string }) => (
  <div className={`rounded-full bg-slate-200/80 ${className}`} />
);

/** 상세 분석 로딩 화면 */
const CareerDetailSkeleton = () => {
  return (
    <div
      className="animate-pulse"
      aria-busy="true"
      aria-label="상세 분석 불러오는 중"
    >
      <div className="flex items-start justify-between pb-6">
        <div className="flex w-[820px] flex-col gap-4">
          <p className="pt-[7px] text-[10px] leading-[15px] font-extrabold tracking-[1.6px] text-brand-strong">
            SALARY DIAGNOSIS REPORT
          </p>
          <Bar className="h-6 w-full" />
        </div>
        <div className="flex h-10 w-[181px] items-center rounded-[8px] border border-slate-300 px-4">
          <Bar className="h-2.5 w-full" />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 border-y border-slate-200 py-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`flex flex-col gap-3 px-6 ${i === 2 ? "border-l-3 border-slate-200" : i === 0 ? "border-r border-slate-100" : ""}`}
          >
            <Bar className="h-2.5 w-20" />
            <Bar className="h-5 w-full" />
            <Bar className="h-2.5 w-36" />
          </div>
        ))}
      </div>

      <div className="flex min-h-[460px]">
        <div className="flex w-1/2 flex-col gap-5 border-r border-slate-200 pr-12">
          <Bar className="h-3 w-44" />
          {[0, 1].map((g) => (
            <div key={g} className="flex flex-col gap-3">
              <Bar className="h-2.5 w-36" />
              {["w-2/5", "w-3/5", "w-1/2"].map((w) => (
                <Bar key={w} className={`h-2.5 ${w}`} />
              ))}
            </div>
          ))}
        </div>
        <div className="flex w-1/2 flex-col gap-5 pl-12">
          <Bar className="h-3 w-48" />
          <Bar className="h-2.5 w-40" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <Bar className="h-2 w-28" />
                <Bar className="h-2 w-6" />
              </div>
              <div className="h-1.5 rounded-full bg-slate-100" />
            </div>
          ))}
          <div className="flex gap-3 pt-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex flex-1 flex-col gap-3 rounded-[12px] bg-slate-50 px-[18px] py-4"
              >
                <Bar className="h-3 w-16" />
                <Bar className="h-3.5 w-28" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerDetailSkeleton;
