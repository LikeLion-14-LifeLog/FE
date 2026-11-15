export type SalaryPoint = {
  year: number;
  salary: number;
  lower?: number;
  upper?: number;
};

type SalaryChartProps = {
  data: SalaryPoint[];
};

const formatSalary = (won: number) =>
  (won / 10000).toLocaleString("ko-KR", {
    maximumFractionDigits: 1,
  });

export default function SalaryChart({ data }: SalaryChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-[12px] text-text-muted">
        표시할 연봉 데이터가 없습니다.
      </p>
    );
  }

  const left = 76;
  const right = 625;
  const top = 20;
  const bottom = 250;

  const values = data.flatMap(({ salary, lower, upper }) => [
    salary,
    lower ?? salary,
    upper ?? salary,
  ]);

  const lowest = Math.min(...values);
  const highest = Math.max(...values);
  const step =
    Math.max(
      1,
      Math.ceil((highest - lowest) / 3 / 5_000_000),
    ) * 5_000_000;
  const min = Math.max(0, Math.floor(lowest / step) * step);
  const max = Math.ceil(highest / step) * step + step;

  const ticks = Array.from(
    { length: Math.round((max - min) / step) + 1 },
    (_, index) => min + index * step,
  );

  const x = (index: number) =>
    left + ((right - left) * index) / Math.max(data.length - 1, 1);

  const y = (value: number) =>
    bottom - ((value - min) / (max - min)) * (bottom - top);

  const salaryLine = data
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${x(index)} ${y(point.salary)}`,
    )
    .join(" ");

  const hasRange =
    data.length > 1 &&
    data.every(
      (point) =>
        point.lower !== undefined &&
        point.upper !== undefined &&
        point.lower <= point.salary &&
        point.salary <= point.upper,
    );

  const rangePoints = hasRange
    ? [
        ...data.map(
          (point, index) =>
            `${x(index)},${y(point.upper ?? point.salary)}`,
        ),
        ...data
          .map(
            (point, index) =>
              `${x(index)},${y(point.lower ?? point.salary)}`,
          )
          .reverse(),
      ].join(" ")
    : "";

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-end gap-x-4 gap-y-1.5 pr-[8.1%] text-[10px] text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-brand-strong" />
          예상 연봉선
        </span>
        {hasRange && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 border border-brand-strong/20 bg-brand/15" />
            AI 예측 범위
          </span>
        )}
      </div>
      <svg
        viewBox="0 0 680 325"
        className="mt-2 block h-auto w-full"
        role="img"
        aria-label={`연차별 예상 연봉: ${data
          .map(
            (point) =>
              `${point.year === 0 ? "첫 취업" : `${point.year}년 차`} ${formatSalary(point.salary)}만 원`,
          )
          .join(", ")}`}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={left}
              x2={right}
              y1={y(tick)}
              y2={y(tick)}
              strokeDasharray="3 3"
              className="stroke-border"
            />
            <text
              x={left - 10}
              y={y(tick) + 4}
              textAnchor="end"
              className="fill-text-muted text-[11px]"
            >
              {formatSalary(tick)}만
            </text>
          </g>
        ))}
        {hasRange && (
          <polygon
            points={rangePoints}
            className="fill-brand/15 stroke-brand-strong/30"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        )}
        <path
          d={salaryLine}
          fill="none"
          className="stroke-brand-strong"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((point, index) => (
          <g key={point.year}>
            <circle
              cx={x(index)}
              cy={y(point.salary)}
              r="5.5"
              strokeWidth="2.5"
              className="fill-bg-page stroke-brand-strong"
            />
            <text
              x={x(index)}
              y={bottom + 23}
              textAnchor="middle"
              className={`text-[12px] font-bold ${
                index === 0
                  ? "fill-brand-strong"
                  : "fill-text-primary"
              }`}
            >
              {formatSalary(point.salary)}만
            </text>
            <text
              x={x(index)}
              y={bottom + 45}
              textAnchor="middle"
              className="fill-text-secondary text-[11px]"
            >
              {point.year === 0
                ? "첫 취업 초봉"
                : `취업 ${point.year}년 차`}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}