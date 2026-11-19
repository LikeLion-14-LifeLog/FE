import type {
  CareerStartCondition,
  RouteSalary,
  FirstJobNode,
  NextStepNode,
} from "@/types/career";
import { formatManwon, formatManwonDiff } from "@/utils/careerRouteTree";
import CareerNode from "./CareerNode";

type CareerPathGraphProps = {
  start: CareerStartCondition;
  firstJobs: FirstJobNode[];
  nextSteps: NextStepNode[];
  /** 선택한 1차 첫 취업 진입군 id (없으면 null) */
  selectedFirstJobId: string | null;
  /** 선택한 2차 이동 경로 id (없으면 null) */
  selectedStepId: string | null;
  onSelectFirstJob: (id: string) => void;
  onSelectStep: (id: string) => void;
};

/* ---------- 레이아웃 (Figma 951 × 560 기준, 노드 수에 따라 세로 길이 조정) ---------- */
const GRAPH_WIDTH = 951;
/** 노드가 적을 때도 유지하는 최소 높이 */
const MIN_GRAPH_HEIGHT = 560;

const START = { x: 10, width: 188, height: 93 };
const COL2 = { x: 357, width: 257, height: 83 };
const COL3 = { x: 684, width: 257, jumpHeight: 91, stayHeight: 59 };
/** 그래프 위쪽 여백 */
const TOP_PADDING = 24;
/** 하단 안내 문구 영역 */
const HINT_SPACE = 48;
/** 1차 노드 묶음(1차 노드 + 딸린 2차 노드들) 사이 간격 */
const GROUP_GAP = 28;
/** 같은 부모 아래 2차 노드끼리의 간격 */
const COL3_GAP = 10;
const GUIDE_XS = [277.5, 649];

const COLOR = {
  brand: "#0d9488",
  brandStrong: "#0f766e",
  mint: "#f0fdfa",
  line: "#cbd5e1",
  lineStrong: "#94a3b8",
  guide: "#f1f5f9",
};

/** 선 그리기 애니메이션용 대시 길이 (index.css career-draw 와 동일, 가장 긴 선보다 길어야 함) */
const DRAW_LENGTH = 1000;

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

/** 데이터가 없는 칸 */
const EMPTY = "-";

/** "▲ +8% (+309만 상승)" / "▼ -3% (-120만 하락)" */
const formatRise = ({ meanDifference, meanFrom }: RouteSalary) => {
  const percent = Math.round((meanDifference / meanFrom) * 100);
  const up = meanDifference >= 0;
  return `${up ? "▲ +" : "▼ "}${percent}% (${formatManwonDiff(meanDifference)} ${up ? "상승" : "하락"})`;
};

const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const mx = (x1 + x2) / 2;
  return `M${x1} ${y1} C${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
};

type Edge = {
  key: string;
  from: [number, number];
  to: [number, number];
  /** 선택 경로 위의 선인지 */
  active: boolean;
  /** 기본(회색) 상태 스타일 */
  stroke: string;
  width: number;
};

const CareerPathGraph = ({
  start,
  firstJobs,
  nextSteps,
  selectedFirstJobId,
  selectedStepId,
  onSelectFirstJob,
  onSelectStep,
}: CareerPathGraphProps) => {
  // 1차 노드마다 [1차 노드 높이, 2차 노드 묶음 높이] 중 큰 값만큼 세로 공간을 잡고 차례로 쌓는다
  const groups = firstJobs.map((job) => {
    const children = nextSteps
      .filter((step) => step.parentId === job.id)
      .map((step) => ({
        step,
        height: step.variant === "jump" ? COL3.jumpHeight : COL3.stayHeight,
      }));
    const childrenHeight =
      children.reduce((sum, { height }) => sum + height, 0) +
      COL3_GAP * Math.max(0, children.length - 1);
    return { job, children, height: Math.max(COL2.height, childrenHeight) };
  });

  const contentHeight =
    groups.reduce((sum, { height }) => sum + height, 0) +
    GROUP_GAP * Math.max(0, groups.length - 1);
  const graphHeight = Math.max(
    MIN_GRAPH_HEIGHT,
    TOP_PADDING + Math.max(contentHeight, START.height) + HINT_SPACE,
  );
  // 노드가 적으면 남는 공간 가운데에 배치
  const contentTop =
    TOP_PADDING +
    (graphHeight - TOP_PADDING - HINT_SPACE - Math.max(contentHeight, START.height)) / 2;

  const startCenterY = contentTop + Math.max(contentHeight, START.height) / 2;
  const startAnchor: [number, number] = [START.x + START.width, startCenterY];

  const firstJobLayout: { job: FirstJobNode; centerY: number }[] = [];
  const nextStepLayout: {
    step: NextStepNode;
    parentCenterY: number;
    centerY: number;
    height: number;
  }[] = [];

  let groupTop = contentTop;
  for (const { job, children, height } of groups) {
    const centerY = groupTop + height / 2;
    firstJobLayout.push({ job, centerY });

    const childrenHeight =
      children.reduce((sum, child) => sum + child.height, 0) +
      COL3_GAP * Math.max(0, children.length - 1);
    let childTop = centerY - childrenHeight / 2;
    for (const child of children) {
      nextStepLayout.push({
        step: child.step,
        parentCenterY: centerY,
        centerY: childTop + child.height / 2,
        height: child.height,
      });
      childTop += child.height + COL3_GAP;
    }

    groupTop += height + GROUP_GAP;
  }

  // 모든 경로는 회색으로 깔고, 선택한 경로만 teal 로 덮어 그림
  const edges: Edge[] = [
    ...firstJobLayout.map(({ job, centerY }) => ({
      key: `start-${job.id}`,
      from: startAnchor,
      to: [COL2.x, centerY] as [number, number],
      active: job.id === selectedFirstJobId,
      stroke: COLOR.lineStrong,
      width: 3,
    })),
    ...nextStepLayout.map(({ step, parentCenterY, centerY }) => ({
      key: `${step.parentId}-${step.id}`,
      from: [COL2.x + COL2.width, parentCenterY] as [number, number],
      to: [COL3.x, centerY] as [number, number],
      active:
        step.id === selectedStepId && step.parentId === selectedFirstJobId,
      stroke: COLOR.line,
      width: 2.5,
    })),
  ];
  const activeEdges = edges.filter((edge) => edge.active);

  const hint = !selectedFirstJobId
    ? "1차 이동 직업을 먼저 선택하세요"
    : !selectedStepId
      ? "이어지는 2차 이동 직업을 선택하세요"
      : "다른 노드를 클릭하면 우측 정보가 전환됩니다";

  return (
    <div
      className="relative shrink-0"
      style={{ width: GRAPH_WIDTH, height: graphHeight }}
    >
      <svg
        className="absolute inset-0"
        width={GRAPH_WIDTH}
        height={graphHeight}
        viewBox={`0 0 ${GRAPH_WIDTH} ${graphHeight}`}
        fill="none"
        aria-hidden
      >
        {GUIDE_XS.map((x) => (
          <line
            key={x}
            x1={x}
            x2={x}
            y1={12}
            y2={graphHeight - 43}
            stroke={COLOR.guide}
            strokeWidth={1.5}
          />
        ))}

        {/* 기본 회색 경로 */}
        {edges.map((edge) => (
          <path
            key={edge.key}
            d={curve(...edge.from, ...edge.to)}
            stroke={edge.stroke}
            strokeWidth={edge.width}
            strokeLinecap="round"
          />
        ))}
        {edges.flatMap((edge) =>
          [edge.from, edge.to].map(([cx, cy], i) => (
            <circle
              key={`${edge.key}-${i}`}
              cx={cx}
              cy={cy}
              r={4}
              fill="#ffffff"
              stroke={COLOR.lineStrong}
              strokeWidth={2}
            />
          ))
        )}

        {/* 선택 경로 (선택 시 그려지는 애니메이션) */}
        {activeEdges.map((edge) => (
          <path
            key={`active-${edge.key}`}
            d={curve(...edge.from, ...edge.to)}
            stroke={COLOR.brand}
            strokeWidth={6}
            strokeLinecap="round"
            className="animate-[career-draw_0.5s_ease-out]"
            strokeDasharray={DRAW_LENGTH}
          />
        ))}
        {activeEdges.flatMap((edge) =>
          [edge.from, edge.to].map(([cx, cy], i) => (
            <circle
              key={`active-${edge.key}-${i}`}
              cx={cx}
              cy={cy}
              r={4}
              fill={i === 1 ? COLOR.brand : "#ffffff"}
              stroke={i === 1 ? "#ffffff" : COLOR.brand}
              strokeWidth={2}
            />
          ))
        )}
      </svg>

      {/* 01 출발 기준선 */}
      <CareerNode
        className="absolute px-[14px]"
        style={{
          left: START.x,
          top: startCenterY - START.height / 2,
        }}
        width={START.width}
        height={START.height}
      >
        <span className="text-[11.4px] font-bold text-teal-600">
          {start.label}
        </span>
        <span className="mt-1.5 text-[14.9px] font-bold text-slate-900">
          {start.title}
        </span>
        <span className="mt-1 text-[11.9px] font-bold text-slate-500">
          {start.description}
        </span>
      </CareerNode>

      {/* 02 1차 첫 취업 진입군 */}
      {firstJobLayout.map(({ job, centerY }, i) => {
        const active = job.id === selectedFirstJobId;
        return (
          <CareerNode
            key={job.id}
            onClick={() => onSelectFirstJob(job.id)}
            selected={active}
            className="absolute px-4 hover:border-teal-600!"
            style={{ left: COL2.x, top: centerY - COL2.height / 2 }}
            width={COL2.width}
            height={COL2.height}
            borderColor={active ? COLOR.brand : COLOR.line}
            borderWidth={active ? 1.8 : 1}
            bgColor={active ? COLOR.mint : "#ffffff"}
          >
            <span className="flex items-center justify-between gap-2">
              <span
                className={`truncate text-[13.9px] font-bold ${active ? "text-slate-900" : "text-slate-700"}`}
                title={job.title}
              >
                {job.title}
              </span>
              <span
                className={`shrink-0 text-[11.4px] font-bold ${active ? "text-teal-600" : "text-slate-500"}`}
              >
                {formatPercent(job.share)}
                {i === 0 && " (최다 이동)"}
              </span>
            </span>
            <span
              className={`mt-1 text-[14px] font-bold ${active ? "text-teal-600" : "text-slate-700"}`}
            >
              평균 연봉 {job.salary ? formatManwon(job.salary.meanTo) : EMPTY}
            </span>
            <span
              className={`mt-0.5 text-[10.9px] ${active ? "font-bold text-slate-500" : "text-slate-400"}`}
            >
              {job.observedSegments}구간 관측{i === 0 && " (1순위 경로)"}
            </span>
          </CareerNode>
        );
      })}

      {/* 03 2차 이직/성장 궤적 */}
      {nextStepLayout.map(({ step, centerY, height }) => {
        const active = step.id === selectedStepId;
        const selectable = step.parentId === selectedFirstJobId;

        return (
          <CareerNode
            key={step.id}
            onClick={() => onSelectStep(step.id)}
            selected={active}
            disabled={!selectable}
            className={`absolute px-4 ${selectable ? "hover:border-teal-600!" : "opacity-40"}`}
            style={{ left: COL3.x, top: centerY - height / 2 }}
            width={COL3.width}
            height={height}
            borderColor={active ? COLOR.brand : COLOR.line}
            borderWidth={active ? 1.8 : 1}
            bgColor={active ? COLOR.mint : "#ffffff"}
          >
            {step.variant === "jump" ? (
              <>
                <span className="flex items-center justify-between gap-2">
                  <span
                    className="truncate text-[14.4px] font-bold text-slate-900"
                    title={step.title}
                  >
                    {step.title}
                  </span>
                  <span className="shrink-0 text-[11.4px] font-bold text-teal-700">
                    {step.badge ?? `이동 ${formatPercent(step.share)}`}
                  </span>
                </span>
                <span className="text-[19.8px] font-bold text-teal-600">
                  {step.salary ? formatManwon(step.salary.meanTo) : `${EMPTY} 만 원`}
                </span>
                <span className="text-[11.9px] font-bold text-teal-700">
                  {step.salary ? formatRise(step.salary) : EMPTY}
                </span>
              </>
            ) : (
              <>
                <span
                  className="truncate text-[12.9px] font-bold text-slate-700"
                  title={step.title}
                >
                  {step.title}
                </span>
                <span className="mt-0.5 text-[12.9px] font-bold text-slate-700">
                  {step.salary ? formatManwon(step.salary.meanTo) : `${EMPTY} 만 원`}{" "}
                  <span className="text-[10.9px] text-slate-500">
                    (이동 {formatPercent(step.share)})
                  </span>
                </span>
              </>
            )}
          </CareerNode>
        );
      })}

      <p className="absolute right-[45px] bottom-[11px] text-[12px] leading-[18px] font-bold text-teal-600">
        {hint}
      </p>
    </div>
  );
};

export default CareerPathGraph;
