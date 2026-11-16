export type SalaryPoint = {
  year: number;
  salary: number;
  lower?: number;
  upper?: number;
};

type SalaryChartProps = {
  data: SalaryPoint[];
  comparisonData?: SalaryPoint[] | null;
  wide?: boolean;
};

const formatSalary = (won: number) =>
  (won / 10_000).toLocaleString("ko-KR", {
    maximumFractionDigits: 1,
  });

const describeSeries = (points: SalaryPoint[]) =>
  points
    .map(({ year, salary }) => {
      const label = year === 0 ? "첫 취업" : `${year}년 차`;
      return `${label} ${formatSalary(salary)}만 원`;
    })
    .join(", ");

export default function SalaryChart({
  data,
  comparisonData,
  wide = false,
}: SalaryChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-[12px] text-text-muted">
        표시할 연봉 데이터가 없습니다.
      </p>
    );
  }

  const viewWidth = wide ? 970 : 680;
  const viewHeight = wide ? 365 : 325;
  const left = 76;
  const right = viewWidth - 55;
  const top = 20;
  const bottom = wide ? 280 : 250;

  const comparing = comparisonData !== undefined;
  const comparisonByYear = new Map(
    comparisonData?.map(({ year, salary }) => [year, salary]),
  );
  const comparisonPoints = data.flatMap(({ year }, index) => {
    const salary = comparisonByYear.get(year);
    return salary === undefined ? [] : [{ year, salary, index }];
  });

  const values = [
    ...data.flatMap(({ salary, lower, upper }) => [
      salary,
      lower ?? salary,
      upper ?? salary,
    ]),
    ...comparisonPoints.map(({ salary }) => salary),
  ];

  const lowest = Math.min(...values);
  const highest = Math.max(...values);
  const step =
    Math.max(1, Math.ceil((highest - lowest) / 3 / 5_000_000)) * 5_000_000;
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

  const drawLine = (points: { index: number; salary: number }[]) =>
    points
      .map(
        ({ index, salary }, position) =>
          `${position === 0 ? "M" : "L"} ${x(index)} ${y(salary)}`,
      )
      .join(" ");

  const salaryLine = drawLine(
    data.map(({ salary }, index) => ({ index, salary })),
  );

  const hasRange =
    !comparing &&
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
          (point, index) => `${x(index)},${y(point.upper ?? point.salary)}`,
        ),
        ...data
          .map(
            (point, index) => `${x(index)},${y(point.lower ?? point.salary)}`,
          )
          .reverse(),
      ].join(" ")
    : "";

  const chartLabel = comparing
    ? `연차별 예상 연봉. 현재 스펙: ${describeSeries(data)}${
        comparisonPoints.length
          ? `. 변경 후: ${describeSeries(comparisonPoints)}`
          : ""
      }`
    : `연차별 예상 연봉: ${describeSeries(data)}`;

  return (
    <div className="w-full">
      <div
        className={`flex flex-wrap justify-end gap-x-4 gap-y-1.5 ${
          wide
            ? "pr-[5.7%] text-[12px] text-text-secondary"
            : "pr-[8.1%] text-[10px] text-text-muted"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <span
            className={`w-4 border-t-2 ${
              comparing
                ? "border-dashed border-text-muted"
                : "border-brand-strong"
            }`}
          />
          {comparing ? "현재 스펙" : "예상 연봉선"}
        </span>

        {comparisonPoints.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span
              className={
                comparisonPoints.length === 1
                  ? "size-2 rounded-full bg-brand-strong"
                  : "w-4 border-t-2 border-brand-strong"
              }
            />
            {comparisonPoints.length === 1 ? "변경 후 초봉" : "변경 후"}
          </span>
        )}

        {hasRange && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 border border-brand-strong/20 bg-brand/15" />
            AI 예측 범위
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        className="mt-2 block h-auto w-full"
        role="img"
        aria-label={chartLabel}
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
              className={
                wide
                  ? "fill-text-secondary text-[16px]"
                  : "fill-text-muted text-[11px]"
              }
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
          className={comparing ? "stroke-text-muted" : "stroke-brand-strong"}
          strokeWidth="3"
          strokeDasharray={comparing ? "5 5" : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {comparisonPoints.length > 1 && (
          <path
            d={drawLine(comparisonPoints)}
            fill="none"
            className="stroke-brand-strong"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {data.map((point, index) => {
          const comparedSalary = comparisonByYear.get(point.year);
          const labelColor = comparing
            ? "fill-text-secondary"
            : index === 0
              ? "fill-brand-strong"
              : "fill-text-primary";

          return (
            <g key={point.year}>
              <circle
                cx={x(index)}
                cy={y(point.salary)}
                r="5.5"
                strokeWidth="2.5"
                className={`fill-bg-page ${
                  comparing ? "stroke-text-muted" : "stroke-brand-strong"
                }`}
              />
              <text
                x={x(index)}
                y={bottom + 35}
                textAnchor="middle"
                className={`font-bold ${labelColor} ${
                  wide ? "text-[17px]" : "text-[12px]"
                }`}
              >
                {formatSalary(point.salary)}만
                {comparedSalary !== undefined && (
                  <tspan className="fill-brand-strong">
                    {` → ${formatSalary(comparedSalary)}만`}
                  </tspan>
                )}
              </text>
              <text
                x={x(index)}
                y={bottom + 70}
                textAnchor="middle"
                className={`fill-text-secondary ${
                  wide ? "text-[15px]" : "text-[11px]"
                }`}
              >
                {point.year === 0 ? "첫 취업 초봉" : `취업 ${point.year}년 차`}
              </text>
            </g>
          );
        })}

        {comparisonPoints.map(({ year, index, salary }) => (
          <circle
            key={year}
            cx={x(index)}
            cy={y(salary)}
            r="5.5"
            strokeWidth="2.5"
            className="fill-bg-page stroke-brand-strong"
          />
        ))}
      </svg>
    </div>
  );
}