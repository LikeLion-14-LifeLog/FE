import type { CSSProperties, ReactNode } from "react";

type CareerNodeProps = {
  children?: ReactNode;
  /** 테두리 색 (기본: teal-600) */
  borderColor?: string;
  /** 테두리 두께 px (기본: 1.5) */
  borderWidth?: number;
  /** 노드 안쪽 배경색 (기본: white) */
  bgColor?: string;
  width?: number | string;
  height?: number | string;
  /** 넘기면 버튼으로 렌더링 */
  onClick?: () => void;
  /** 버튼일 때 선택 상태 (aria-pressed) */
  selected?: boolean;
  /** 버튼일 때 클릭 비활성화 */
  disabled?: boolean;
  /** 패딩·정렬 등 레이아웃 클래스 */
  className?: string;
  style?: CSSProperties;
};

const CareerNode = ({
  children,
  borderColor = "#0d9488",
  borderWidth = 1.5,
  bgColor = "#ffffff",
  width = 188,
  height = 93,
  onClick,
  selected,
  disabled = false,
  className = "",
  style,
}: CareerNodeProps) => {
  const nodeStyle: CSSProperties = {
    borderColor,
    borderWidth,
    backgroundColor: bgColor,
    width,
    height,
    ...style,
  };
  const base = `flex flex-col justify-center rounded-[8px] border-solid text-left transition-colors ${className}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        disabled={disabled}
        className={`${base} ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        style={nodeStyle}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={base} style={nodeStyle}>
      {children}
    </div>
  );
};

export default CareerNode;
