import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CareerPathGraph from "./components/CareerPathGraph";
import ConditionChip from "./components/ConditionChip";
import RouteSummaryPanel from "./components/RouteSummaryPanel";
// TODO: API 연동 후 목데이터 제거
import { MOCK_CAREER_MAP, SALARY_SCALE_MAX } from "./mockData";

const COLUMN_TITLE =
  "text-[12.5px] leading-[18.75px] font-extrabold text-slate-600";

const CareerPage = () => {
  const navigate = useNavigate();
  const { conditions, start, firstJobs, nextSteps, summaries } =
    MOCK_CAREER_MAP;
  // 1차 취업군 → 2차 경로 순서로 선택 (처음엔 아무것도 선택 안 됨)
  const [firstJobId, setFirstJobId] = useState<string | null>(null);
  const [stepId, setStepId] = useState<string | null>(null);
  const summary = stepId ? (summaries[stepId] ?? null) : null;

  const handleSelectFirstJob = (id: string) => {
    // 1차를 바꾸면 이전 2차 선택은 초기화
    if (id !== firstJobId) setStepId(null);
    setFirstJobId(id);
  };

  return (
    <div className="flex flex-col gap-[14px]">
      {/* 칩 오른쪽 끝에서 구분선이 이어지도록 칩 하단과 선을 같은 높이에 둠 */}
      <div className="flex items-end">
        <span className="mr-[6px] self-center text-[12px] leading-[18px] font-bold text-teal-600">
          탐색 기준
        </span>
        <ConditionChip items={conditions} className="shrink-0" />
        <div className="flex-1 border-b border-slate-200" />
      </div>

      <div className="flex items-start gap-9 overflow-x-auto pt-[22px]">
        <section className="shrink-0 border-r border-slate-200 pr-9">
          <div className="mb-1.5 flex w-[951px] items-center justify-between border-b border-slate-100 pb-2">
            <p className={`w-[200px] ${COLUMN_TITLE}`}>
              01 출발 기준선 (내 현재 조건)
            </p>
            <p className={`w-[280px] text-center ${COLUMN_TITLE}`}>
              02 1차 첫 취업 진입군
            </p>
            <p className={`w-[280px] text-right ${COLUMN_TITLE}`}>
              03 2차 이직/성장 궤적
            </p>
          </div>
          <CareerPathGraph
            start={start}
            firstJobs={firstJobs}
            nextSteps={nextSteps}
            selectedFirstJobId={firstJobId}
            selectedStepId={stepId}
            onSelectFirstJob={handleSelectFirstJob}
            onSelectStep={setStepId}
          />
        </section>

        <RouteSummaryPanel
          summary={summary}
          scaleMax={SALARY_SCALE_MAX}
          onDetailClick={() => stepId && navigate(`/career/${stepId}`)}
        />
      </div>
    </div>
  );
};

export default CareerPage;
