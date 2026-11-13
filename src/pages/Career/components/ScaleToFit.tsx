import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

type ScaleToFitProps = {
  /** 원본(디자인 기준) 너비 — 이보다 좁은 공간에서만 비율대로 축소 */
  width: number;
  children: ReactNode;
  className?: string;
};

/**
 * 고정 좌표로 그린 콘텐츠를 부모 너비에 맞춰 통째로 축소한다.
 * transform 은 레이아웃 크기를 바꾸지 않으므로, 축소된 높이를 바깥 상자에 직접 지정해
 * 아래 콘텐츠가 빈 공간 없이 붙도록 한다. (확대는 하지 않음)
 */
const ScaleToFit = ({ width, children, className = "" }: ScaleToFitProps) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const update = () => {
      const next = Math.min(1, outer.clientWidth / width);
      setScale(next);
      setHeight(inner.offsetHeight * next);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div
      ref={outerRef}
      className={`overflow-hidden ${className}`}
      style={{ height }}
    >
      <div
        ref={innerRef}
        style={{
          width,
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ScaleToFit;
