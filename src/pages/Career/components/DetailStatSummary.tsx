import type { DetailStat } from "@/types/career";

type DetailStatSummaryProps = {
  stats: DetailStat[];
};

const DetailStatSummary = ({ stats }: DetailStatSummaryProps) => {
  return (
    <div className="mb-6 grid grid-cols-3 border-y border-slate-200 py-4">
      {stats.map(({ label, value, unit, caption, highlight }, i) => (
        <div
          key={label}
          className={`flex flex-col px-6 ${
            highlight
              ? "border-l-3 border-teal-600"
              : i < stats.length - 1
                ? "border-r border-slate-100"
                : ""
          }`}
        >
          <p
            className={`pb-1 text-[12px] leading-[18px] ${highlight ? "font-bold text-teal-700" : "font-semibold text-slate-500"}`}
          >
            {label}
          </p>
          <p className="font-extrabold tracking-[-0.5px] text-slate-900">
            <span className="text-[24px] leading-9">{value}</span>
            <span className="text-[16px] leading-6 font-bold text-slate-500">
              {unit}
            </span>
          </p>
          <p
            className={`pt-0.5 text-[12px] leading-[18px] ${highlight ? "font-extrabold text-teal-600" : i === 0 ? "text-slate-500" : "font-bold text-teal-600"}`}
          >
            {caption}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DetailStatSummary;
