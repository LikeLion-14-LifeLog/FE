import type { CardProfile } from "@/types/dashboard";

/** neck.svg 원본 크기 */
const SVG_WIDTH = 342;
const SVG_HEIGHT = 559;

type NeckCardProps = {
  profile: CardProfile;
  width?: number;
  className?: string;
};

/** 목걸이 사원증*/
const NeckCard = ({ profile, width = 225, className = "" }: NeckCardProps) => {
  const scale = width / SVG_WIDTH;

  return (
    <div
      role="img"
      aria-label={`${profile.nickname} 사원증`}
      className={`relative shrink-0 ${className}`}
      style={{ width, height: SVG_HEIGHT * scale }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: SVG_WIDTH,
          height: SVG_HEIGHT,
          transform: `scale(${scale})`,
        }}
      >
        <img
          src="/dashboard/neck.svg"
          alt=""
          draggable={false}
          className="block size-full"
        />

        <div className="absolute top-[306.08px] left-[62.7px] h-[127.4px] w-[207px] origin-top-left rotate-2">
          <p className="absolute top-[40px] left-[17px] text-[19px] leading-[26px] font-bold whitespace-nowrap text-[#0f172a]">
            {profile.nickname}
          </p>
          <p className="absolute top-[68px] left-[17px] text-[11px] leading-4 whitespace-nowrap text-[#64748b]">
            {profile.major} · Lifelogger
          </p>
        </div>
      </div>
    </div>
  );
};

export default NeckCard;
