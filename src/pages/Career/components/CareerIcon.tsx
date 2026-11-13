const ICONS = {
  check: { src: "/career/mintCheck.svg", width: 10, height: 8 },
  mintArrow: { src: "/career/mintArrow.svg", width: 12, height: 9 },
  whiteArrow: { src: "/career/whiteArrow.svg", width: 10, height: 10 },
  backArrow: { src: "/career/backArrow.svg", width: 10, height: 9 },
  averageArrow: { src: "/career/avaerageArrow.svg", width: 7, height: 7 },
} as const;

export type CareerIconName = keyof typeof ICONS;

type CareerIconProps = {
  name: CareerIconName;
  className?: string;
};

const CareerIcon = ({ name, className = "" }: CareerIconProps) => {
  const { src, width, height } = ICONS[name];
  return (
    <img
      src={src}
      width={width}
      height={height}
      alt=""
      aria-hidden
      className={`shrink-0 ${className}`}
    />
  );
};

export default CareerIcon;
