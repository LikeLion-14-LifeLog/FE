import type {
  RouteSalary,
  RouteSummary,
  RouteSummaryRow,
} from "@/types/career";
import { formatManwonDiff } from "@/utils/careerRouteTree";
import GraphBar from "./GraphBar";
import CurriculumLinkButton from "./CurriculumLinkButton";
import YearlyObservationList, {
  type YearlyObservationColumn,
} from "./YearlyObservationList";

type RouteSummaryPanelProps = {
  /** 아직 2차 경로를 고르지 않았으면 null → 칸은 유지하고 값만 비움 */
  summary: RouteSummary | null;
  /** 데이터 해석 주의 문구 */
  notice?: string;
  /** 연봉 막대 최대 눈금 (원) */
  salaryScaleMax: number;
  /** 선택 경로의 연도별 관측 변화 (경로 선택 전이면 없음) */
  yearly?: YearlyObservationColumn[];
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
  "이동 전 평균 연봉",
  "평균 이동 간격",
  "이동 비율",
  "동일 기업 근속 대비",
  "주요 평가 기준",
];

const toManwon = (krw: number) =>
  Math.round(krw / 10_000).toLocaleString("ko-KR");

/**
 * 2차 이동 구간(1차 직업 → 2차 직업)의 이동 전·후 평균 연봉.
 * 관측 연도 연봉이라 "초봉"·"이직 후 연봉"·"예상" 같은 표현은 쓰지 않는다.
 * salary 가 없으면(비로그인·비공개 그룹·경로 선택 전) 칸은 유지하고 값만 비운다.
 */
const SalarySection = ({
  salary,
  scaleMax,
}: {
  salary: RouteSalary | undefined;
  scaleMax: number;
}) => {
  const fillPercent = salary
    ? Math.min(100, (salary.meanTo / scaleMax) * 100)
    : 0;
  const risePercent = salary
    ? ((salary.meanDifference / salary.meanFrom) * 100).toFixed(1)
    : "";

  return (
    <section className="mb-3 border-y border-slate-100 pt-4 pb-5">
      <p className="pb-1.5 text-[12px] leading-[18px] font-bold text-slate-500">
        이동 후 평균 연봉
      </p>
      <p className="flex h-16 items-center pb-3 font-extrabold tracking-[-0.38px] text-slate-900">
        <span className="text-[38px] leading-[38px]">
          {salary ? toManwon(salary.meanTo) : EMPTY}
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
          {salary &&
            `${formatManwonDiff(salary.meanDifference)} 원 ${salary.meanDifference >= 0 ? "상승" : "하락"} (${Number(risePercent) >= 0 ? "+" : ""}${risePercent}%)`}
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
            이동 전 {salary ? `${toManwon(salary.meanFrom)}만` : EMPTY}
          </span>
          {salary && (
            <span
              className="absolute -translate-x-full font-bold tracking-[-0.17px] text-teal-700"
              style={{ left: `${fillPercent}%` }}
            >
              {toManwon(salary.meanTo)}만
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

const RouteSummaryPanel = ({
  summary,
  notice,
  salaryScaleMax,
  yearly,
  onDetailClick,
}: RouteSummaryPanelProps) => {
  const rows: RouteSummaryRow[] =
    summary?.rows ?? EMPTY_ROW_LABELS.map((label) => ({ label, value: EMPTY }));

  return (
    <aside className="flex min-h-[680px] w-[440px] shrink-0 flex-col">
      <p className="text-[11.5px] leading-[17.25px] font-extrabold text-teal-600">
        선택한 이동 경로
      </p>
      <h2 className="pb-1.5 text-[21px] leading-[31.5px] font-extrabold text-slate-900">
        {summary?.title ?? EMPTY}
      </h2>

      <SalarySection salary={summary?.salary} scaleMax={salaryScaleMax} />

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

      {summary && yearly && <YearlyObservationList columns={yearly} />}

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
