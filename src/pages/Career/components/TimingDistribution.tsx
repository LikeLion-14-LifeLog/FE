import type { TimingDistribution as TimingItem } from "@/types/career";
import GraphBar from "./GraphBar";

type TimingDistributionProps = {
  title: string;
  items: TimingItem[];
};

const HIGHLIGHT_GRADIENT = "linear-gradient(90deg, #14b8a6, #0d9488)";
/** 이 비중 이상이면 진한 회색 막대 */
const STRONG_PERCENT = 20;

const TimingDistribution = ({ title, items }: TimingDistributionProps) => {
  return (
    <div className="flex flex-col">
      <p className="pb-3 text-[13.5px] leading-[20.25px] font-bold text-slate-900">
        {title}
      </p>
      <ul className="flex flex-col gap-3">
        {items.map(({ label, percent, highlight }) => (
          <li key={label}>
            <div
              className={`flex justify-between pb-1 text-[12.5px] leading-[18.75px] ${
                highlight ? "font-extrabold" : "text-slate-500"
              }`}
            >
              <span className={highlight ? "text-slate-900" : ""}>{label}</span>
              <span className={highlight ? "text-teal-600" : "font-bold"}>
                {percent}%
              </span>
            </div>
            <GraphBar
              percent={percent}
              color={
                highlight
                  ? HIGHLIGHT_GRADIENT
                  : percent >= STRONG_PERCENT
                    ? "#94a3b8"
                    : "#cbd5e1"
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TimingDistribution;
