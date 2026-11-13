import type { RouteSummary, RouteSummaryRow } from "@/types/career";
import GraphBar from "./GraphBar";
import CurriculumLinkButton from "./CurriculumLinkButton";

type RouteSummaryPanelProps = {
  /** 아직 2차 경로를 고르지 않았으면 null → 칸은 유지하고 값만 비움 */
  summary: RouteSummary | null;
  /** 연봉 막대 최대 눈금 (만 원) */
  scaleMax: number;
  onDetailClick: () => void;
};

const TONE_CLASS: Record<NonNullable<RouteSummaryRow["tone"]>, string> = {
  default: "text-slate-900",
  brand: "text-teal-600",
  brandStrong: "text-teal-700",
};

const formatWon = (value: number) => value.toLocaleString("ko-KR");

const EMPTY = "-";
/** 경로 선택 전 표시할 항목 이름 */
const EMPTY_ROW_LABELS = [
  "첫 직장 시작 초봉",
  "평균 이직 소요 기간",
  "이직 성공률",
  "동일 기업 근속 대비",
  "주요 평가 기준",
];

const RouteSummaryPanel = ({
  summary,
  scaleMax,
  onDetailClick,
}: RouteSummaryPanelProps) => {
  const rows: RouteSummaryRow[] =
    summary?.rows ?? EMPTY_ROW_LABELS.map((label) => ({ label, value: EMPTY }));
  const fillPercent = summary
    ? Math.min(100, (summary.targetSalary / scaleMax) * 100)
    : 0;
  const rise = summary ? summary.targetSalary - summary.startSalary : 0;
  const risePercent = summary
    ? ((rise / summary.startSalary) * 100).toFixed(1)
    : "";

  return (
    <aside className="flex min-h-[680px] w-[440px] shrink-0 flex-col">
      <p className="text-[11.5px] leading-[17.25px] font-extrabold text-teal-600">
        선택한 이동 경로
      </p>
      <h2 className="pb-1.5 text-[21px] leading-[31.5px] font-extrabold text-slate-900">
        {summary?.title ?? EMPTY}
      </h2>

      <section className="mb-3 border-y border-slate-100 pt-4 pb-5">
        <p className="pb-1.5 text-[12px] leading-[18px] font-bold text-slate-500">
          이직 시 예상 도달 연봉
        </p>
        <p className="flex h-16 items-center pb-3 font-extrabold tracking-[-0.38px] text-slate-900">
          <span className="text-[38px] leading-[38px]">
            {summary ? formatWon(summary.targetSalary) : EMPTY}
          </span>
          <span className="ml-2 text-[18px] leading-[18px] font-bold text-slate-600">
            만 원
          </span>
        </p>

        <div className="relative">
          <p
            className="h-[14px] text-center text-[11.5px] font-bold tracking-[-0.17px] text-teal-600"
            style={{ width: `${fillPercent}%` }}
          >
            {summary && `+${formatWon(rise)}만 원 상승 (+${risePercent}% 상승)`}
          </p>
          <GraphBar
            className="my-1.5"
            percent={fillPercent}
            height={6}
            color="#0d9488"
            trackColor="#e2e8f0"
          />
          <div className="relative h-[17.25px] text-[11.5px] leading-[17.25px]">
            <span className="absolute left-0 text-slate-500">
              초봉 {summary ? `${formatWon(summary.startSalary)}만` : EMPTY}
            </span>
            {summary && (
              <span
                className="absolute -translate-x-full font-bold tracking-[-0.17px] text-teal-700"
                style={{ left: `${fillPercent}%` }}
              >
                {formatWon(summary.targetSalary)}만
              </span>
            )}
          </div>
        </div>
      </section>

      <dl className="flex flex-col gap-2.5">
        {rows.map(({ label, value, tone = "default" }, i) => (
          <div
            key={label}
            className={`flex items-center justify-between text-[13px] leading-[19.5px] ${i < rows.length - 1 ? "border-b border-slate-100 pb-2" : ""}`}
          >
            <dt className="text-slate-500">{label}</dt>
            <dd
              className={`font-extrabold ${summary ? TONE_CLASS[tone] : "text-slate-300"}`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <CurriculumLinkButton
        className="mt-auto"
        onClick={onDetailClick}
        disabled={!summary}
      />
    </aside>
  );
};

export default RouteSummaryPanel;
