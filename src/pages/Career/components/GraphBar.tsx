import type { CSSProperties } from "react";

type GraphBarProps = {
  percent: number;
  color?: string;
  trackColor?: string;
  height?: number;
  className?: string;
};

const GraphBar = ({
  percent,
  color = "#cbd5e1",
  trackColor = "#f1f5f9",
  height = 8,
  className = "",
}: GraphBarProps) => {
  const clamped = Math.min(100, Math.max(0, percent));

  const trackStyle: CSSProperties = { backgroundColor: trackColor, height };
  const barStyle: CSSProperties = {
    background: color,
    width: `${clamped}%`,
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[4px] ${className}`}
      style={trackStyle}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="absolute top-0 left-0 h-full rounded-[4px] transition-[width] duration-500"
        style={barStyle}
      />
    </div>
  );
};

export default GraphBar;
