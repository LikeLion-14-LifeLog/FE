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

/** 노드 글자 크기 — 모든 노드가 같은 단계를 쓴다 (제목 / 내용 / 보조) */
const TEXT = {
  title: "text-[14px] leading-5",
  body: "text-[12px] leading-[18px]",
  sub: "text-[11px] leading-4",
} as const;

/** 제목 한 줄 높이 (TEXT.title 의 leading-5) — 제목이 줄바꿈되면 줄마다 노드가 이만큼 커진다 */
const TITLE_LINE_HEIGHT = 20;
/** 노드 좌우 패딩 + 테두리 (px-4 기준, 선택 시 테두리 1.8px) */
const NODE_INSET = 16 * 2 + 4;
const START_INSET = 14 * 2 + 4;
/** 제목 옆 비율·배지와의 간격 (gap-2) */
const TITLE_GAP = 8;

let measureContext: CanvasRenderingContext2D | null | undefined;

/** 화면 글꼴 기준 글자 폭 (canvas 를 못 쓰면 글자 수로 어림) */
function textWidth(text: string, size: number) {
  if (measureContext === undefined) {
    measureContext =
      typeof document === "undefined"
        ? null
        : document.createElement("canvas").getContext("2d");
  }
  if (!measureContext) return text.length * size;
  const family = getComputedStyle(document.body).fontFamily || "sans-serif";
  measureContext.font = `700 ${size}px ${family}`;
  return measureContext.measureText(text).width;
}

/** 제목이 maxWidth 안에서 몇 줄이 되는지 — 단어 단위 줄바꿈(break-keep), 한 단어가 넘치면 글자 단위 */
function titleLines(text: string, maxWidth: number) {
  const space = textWidth(" ", 14);
  let lines = 1;
  let lineWidth = 0;
  for (const word of text.trim().split(/\s+/)) {
    const width = textWidth(word, 14);
    if (width > maxWidth) {
      const total = (lineWidth ? lineWidth + space : 0) + width;
      lines += Math.ceil(total / maxWidth) - 1;
      lineWidth = total % maxWidth;
      continue;
    }
    const next = lineWidth ? lineWidth + space + width : width;
    if (next > maxWidth) {
      lines += 1;
      lineWidth = width;
    } else lineWidth = next;
  }
  return lines;
}

/** 제목 줄 수만큼 기본 높이를 늘린다 (sideLabel: 제목 오른쪽 비율·배지) */
const fitHeight = (
  base: number,
  title: string,
  width: number,
  sideLabel = "",
) => {
  const side = sideLabel ? textWidth(sideLabel, 11) + TITLE_GAP : 0;
  return base + (titleLines(title, width - side) - 1) * TITLE_LINE_HEIGHT;
};

const firstJobBadge = (job: FirstJobNode, index: number) =>
  `${formatPercent(job.share)}${index === 0 ? " (최다 이동)" : ""}`;

const stepBadge = (step: NextStepNode) =>
  step.badge ?? `이동 ${formatPercent(step.share)}`;

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
  // 긴 직업명은 줄바꿈해서 다 보여 주고, 늘어난 줄만큼 노드 높이를 키운다
  const startHeight = fitHeight(START.height, start.title, START.width - START_INSET);
  const groups = firstJobs.map((job, index) => {
    const jobHeight = fitHeight(
      COL2.height,
      job.title,
      COL2.width - NODE_INSET,
      firstJobBadge(job, index),
    );
    const children = nextSteps
      .filter((step) => step.parentId === job.id)
      .map((step) => ({
        step,
        height:
          step.variant === "jump"
            ? fitHeight(COL3.jumpHeight, step.title, COL3.width - NODE_INSET, stepBadge(step))
            : fitHeight(COL3.stayHeight, step.title, COL3.width - NODE_INSET),
      }));
    const childrenHeight =
      children.reduce((sum, { height }) => sum + height, 0) +
      COL3_GAP * Math.max(0, children.length - 1);
    return {
      job,
      jobHeight,
      children,
      height: Math.max(jobHeight, childrenHeight),
    };
  });

  const contentHeight =
    groups.reduce((sum, { height }) => sum + height, 0) +
    GROUP_GAP * Math.max(0, groups.length - 1);
  const graphHeight = Math.max(
    MIN_GRAPH_HEIGHT,
    TOP_PADDING + Math.max(contentHeight, startHeight) + HINT_SPACE,
  );
  // 노드가 적으면 남는 공간 가운데에 배치
  const contentTop =
    TOP_PADDING +
    (graphHeight - TOP_PADDING - HINT_SPACE - Math.max(contentHeight, startHeight)) / 2;

  const startCenterY = contentTop + Math.max(contentHeight, startHeight) / 2;
  const startAnchor: [number, number] = [START.x + START.width, startCenterY];

  const firstJobLayout: { job: FirstJobNode; centerY: number; height: number }[] = [];
  const nextStepLayout: {
    step: NextStepNode;
    parentCenterY: number;
    centerY: number;
    height: number;
  }[] = [];

  let groupTop = contentTop;
  for (const { job, jobHeight, children, height } of groups) {
    const centerY = groupTop + height / 2;
    firstJobLayout.push({ job, centerY, height: jobHeight });

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
          top: startCenterY - startHeight / 2,
        }}
        width={START.width}
        height={startHeight}
      >
        <span className={`${TEXT.sub} font-bold text-teal-600`}>
          {start.label}
        </span>
        <span className={`mt-1.5 ${TEXT.title} font-bold break-keep text-slate-900 [overflow-wrap:anywhere]`}>
          {start.title}
        </span>
        <span className={`mt-1 ${TEXT.body} font-bold text-slate-500`}>
          {start.description}
        </span>
      </CareerNode>

      {/* 02 1차 첫 취업 진입군 */}
      {firstJobLayout.map(({ job, centerY, height }, i) => {
        const active = job.id === selectedFirstJobId;
        return (
          <CareerNode
            key={job.id}
            onClick={() => onSelectFirstJob(job.id)}
            selected={active}
            className="absolute px-4 hover:border-teal-600!"
            style={{ left: COL2.x, top: centerY - height / 2 }}
            width={COL2.width}
            height={height}
            borderColor={active ? COLOR.brand : COLOR.line}
            borderWidth={active ? 1.8 : 1}
            bgColor={active ? COLOR.mint : "#ffffff"}
          >
            <span className="flex items-start justify-between gap-2">
              <span
                className={`min-w-0 ${TEXT.title} font-bold break-keep [overflow-wrap:anywhere] ${active ? "text-slate-900" : "text-slate-700"}`}
                title={job.title}
              >
                {job.title}
              </span>
              <span
                className={`shrink-0 pt-0.5 ${TEXT.sub} font-bold ${active ? "text-teal-600" : "text-slate-500"}`}
              >
                {firstJobBadge(job, i)}
              </span>
            </span>
            <span
              className={`mt-1 ${TEXT.body} font-bold ${active ? "text-teal-600" : "text-slate-700"}`}
            >
              평균 연봉 {job.salary ? formatManwon(job.salary.meanTo) : EMPTY}
            </span>
            <span
              className={`mt-0.5 ${TEXT.sub} ${active ? "font-bold text-slate-500" : "text-slate-400"}`}
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
                <span className="flex items-start justify-between gap-2">
                  <span
                    className={`min-w-0 ${TEXT.title} font-bold break-keep text-slate-900 [overflow-wrap:anywhere]`}
                    title={step.title}
                  >
                    {step.title}
                  </span>
                  <span className={`shrink-0 pt-0.5 ${TEXT.sub} font-bold text-teal-700`}>
                    {stepBadge(step)}
                  </span>
                </span>
                <span className={`mt-1 ${TEXT.body} font-bold text-teal-600`}>
                  {step.salary ? formatManwon(step.salary.meanTo) : `${EMPTY} 만 원`}
                </span>
                <span className={`mt-0.5 ${TEXT.sub} font-bold text-teal-700`}>
                  {step.salary ? formatRise(step.salary) : EMPTY}
                </span>
              </>
            ) : (
              <>
                <span
                  className={`${TEXT.title} font-bold break-keep text-slate-700 [overflow-wrap:anywhere]`}
                  title={step.title}
                >
                  {step.title}
                </span>
                <span className={`mt-1 ${TEXT.body} font-bold text-slate-700`}>
                  {step.salary ? formatManwon(step.salary.meanTo) : `${EMPTY} 만 원`}{" "}
                  <span className={`${TEXT.sub} text-slate-500`}>
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
