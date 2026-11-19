import type { RouteSummary, RouteSummaryRow } from "@/types/career";
import GraphBar from "./GraphBar";
import CurriculumLinkButton from "./CurriculumLinkButton";

type RouteSummaryPanelProps = {
  /** 아직 2차 경로를 고르지 않았으면 null → 칸은 유지하고 값만 비움 */
  summary: RouteSummary | null;
  /** 데이터 해석 주의 문구 */
  notice?: string;
  /** 없으면 상세 보기 버튼 비활성화 */
  onDetailClick?: () => void;
};

const TONE_CLASS: Record<NonNullable<RouteSummaryRow["tone"]>, string> = {
  default: "text-slate-900",
  brand: "text-teal-600",
  brandStrong: "text-teal-700",
};

const EMPTY = "-";
/** 경로 선택 전 표시할 항목 이름 */
const EMPTY_ROW_LABELS = [
  "전체 경로",
  "1차 이동 비율",
  "2차 이동 비율",
  "관측 구간 수 (1차 / 2차)",
  "관측 연도 구간 (1차 / 2차)",
];

const RouteSummaryPanel = ({
  summary,
  notice,
  onDetailClick,
}: RouteSummaryPanelProps) => {
  const rows: RouteSummaryRow[] =
    summary?.rows ?? EMPTY_ROW_LABELS.map((label) => ({ label, value: EMPTY }));
  const fillPercent = summary ? Math.min(100, summary.share) : 0;

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
          관측 이동 비율
        </p>
        <p className="flex h-16 items-center pb-3 font-extrabold tracking-[-0.38px] text-slate-900">
          <span className="text-[38px] leading-[38px]">
            {summary ? summary.share.toFixed(1) : EMPTY}
          </span>
          <span className="ml-2 text-[18px] leading-[18px] font-bold text-slate-600">
            %
          </span>
        </p>

        <GraphBar
          className="my-1.5"
          percent={fillPercent}
          height={6}
          color="#0d9488"
          trackColor="#e2e8f0"
        />
        <p className="h-[17.25px] text-[11.5px] leading-[17.25px] text-slate-500">
          {summary?.caption ?? EMPTY}
        </p>
      </section>

      <dl className="flex flex-col gap-2.5">
        {rows.map(({ label, value, tone = "default" }, i) => (
          <div
            key={label}
            className={`flex items-center justify-between gap-4 text-[13px] leading-[19.5px] ${i < rows.length - 1 ? "border-b border-slate-100 pb-2" : ""}`}
          >
            <dt className="shrink-0 text-slate-500">{label}</dt>
            <dd
              className={`text-right font-extrabold ${summary ? TONE_CLASS[tone] : "text-slate-300"}`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {notice && (
        <p className="mt-5 rounded-[8px] bg-slate-50 px-3 py-2.5 text-[11.5px] leading-[17.25px] text-slate-500">
          {notice}
        </p>
      )}

      <CurriculumLinkButton
        className="mt-auto"
        onClick={onDetailClick}
        disabled={!summary || !onDetailClick}
      />
    </aside>
  );
};

export default RouteSummaryPanel;
