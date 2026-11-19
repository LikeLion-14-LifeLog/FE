import type { YearlyObservation } from "@/utils/careerRouteTree";

export type YearlyObservationColumn = {
  /** 열 제목 (예: "1차 구간") */
  title: string;
  /** 출발 ➔ 도착 직업명 */
  route: string;
  /** null 이면 불러오는 중 */
  items: YearlyObservation[] | null;
  error?: string;
};

type YearlyObservationListProps = {
  columns: YearlyObservationColumn[];
};

/** 선택 경로의 연도 구간별 관측 응답자 수 (실제 이직 확률 아님) */
const YearlyObservationList = ({ columns }: YearlyObservationListProps) => {
  return (
    <section className="mt-5">
      <p className="pb-2 text-[12px] leading-[18px] font-bold text-slate-500">
        연도별 관측된 직업코드 변화
      </p>
      <div className="grid grid-cols-2 gap-4">
        {columns.map((column) => (
          <Column key={column.title} {...column} />
        ))}
      </div>
    </section>
  );
};

const Column = ({ title, route, items, error }: YearlyObservationColumn) => {
  const max = Math.max(1, ...(items ?? []).map((item) => item.respondents));

  return (
    <div className="min-w-0">
      <p className="text-[11.5px] leading-[17.25px] font-extrabold text-teal-700">
        {title}
      </p>
      <p
        className="truncate pb-1.5 text-[11px] leading-[16.5px] text-slate-500"
        title={route}
      >
        {route}
      </p>

      {error ? (
        <p className="text-[11px] text-slate-400">{error}</p>
      ) : !items ? (
        <p className="text-[11px] text-slate-400">불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className="text-[11px] text-slate-400">관측된 연도 구간 없음</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map(({ fromYear, toYear, respondents }) => (
            <li
              key={`${fromYear}-${toYear}`}
              className="grid grid-cols-[66px_1fr_26px] items-center gap-1.5 text-[11px] leading-4"
            >
              <span className="text-slate-500 tabular-nums">
                {fromYear}→{String(toYear).slice(2)}
              </span>
              <span className="h-1.5 rounded-full bg-slate-100">
                <span
                  className="block h-full rounded-full bg-teal-600"
                  style={{ width: `${(respondents / max) * 100}%` }}
                />
              </span>
              <span className="text-right font-bold text-slate-700 tabular-nums">
                {respondents}명
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default YearlyObservationList;
