import type { CardProfile } from "@/types/dashboard";

/** neck.svg 원본 크기 */
const SVG_WIDTH = 342;
const SVG_HEIGHT = 559;

type NeckCardProps = {
  profile: CardProfile;
  /** 화면에 표시할 가로 폭(px) */
  width?: number;
  className?: string;
};

/** 목걸이 사원증 — neck.svg 위에 이름 · 학과를 올림 */
const NeckCard = ({ profile, width = 225, className = "" }: NeckCardProps) => {
  const scale = width / SVG_WIDTH;

  return (
    <div
      role="img"
      aria-label={`${profile.name} 사원증`}
      className={`relative shrink-0 ${className}`}
      style={{ width, height: SVG_HEIGHT * scale }}
    >
      {/* SVG 좌표계(342×559) 그대로 배치 후 축소 */}
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

        {/* 카드 안 정보 박스 (SVG 의 rect x=62.7 y=306.08, 2도 회전) */}
        <div className="absolute top-[306.08px] left-[62.7px] h-[127.4px] w-[207px] origin-top-left rotate-2">
          <p className="absolute top-[40px] left-[17px] text-[19px] leading-[26px] font-bold whitespace-nowrap text-[#0f172a]">
            {profile.name}
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
