import type { CSSProperties } from "react";

type GlowEllipseProps = {
  size: number;
  color: string;
  opacity: number;
  className?: string;
  style?: CSSProperties;
};

const hexToRgb = (hex: string) => {
  const v = hex.replace("#", "");
  const n = parseInt(v.length === 3 ? v.replace(/./g, "$&$&") : v, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

const GlowEllipse = ({
  size,
  color,
  opacity,
  className = "",
  style,
}: GlowEllipseProps) => {
  const rgb = hexToRgb(color);
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle closest-side, rgba(${rgb}, ${opacity}) 0%, rgba(${rgb}, 0) 100%)`,
        ...style,
      }}
    />
  );
};

export default GlowEllipse;
