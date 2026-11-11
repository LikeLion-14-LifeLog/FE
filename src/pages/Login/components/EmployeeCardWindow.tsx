/** 기준 디자인 크기 (Figma 3:56 Window) */
const BASE = 366;

type EmployeeCardWindowProps = {
  /** 원형 창 지름(px). 로그인 366, 회원가입 200 */
  size?: number;
  /** 사원증 위에 표시할 이름/이메일 (로그인 성공 화면) */
  name?: string;
  email?: string;
};

const Dot = ({ left, top }: { left: number; top: number }) => (
  <span
    className="absolute size-[3.736px] rounded-[1.868px] bg-[#14b8a6] shadow-[0px_0px_5.338px_0px_rgba(13,148,136,0.6)]"
    style={{ left, top }}
  />
);

/** 사원증이 걸린 원형 창 — Figma 3:56 / 3:331 / 3:762 */
const EmployeeCardWindow = ({
  size = BASE,
  name,
  email,
}: EmployeeCardWindowProps) => {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border-[1.5px] border-[rgba(255,255,255,0.9)]"
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle closest-side, rgba(94,234,212,0.6) 0%, rgba(153,246,228,0.35) 55%, rgba(240,253,250,0) 100%), rgb(240,252,250)",
      }}
    >
      {/* 366px 기준으로 그린 뒤 size에 맞게 축소 */}
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: BASE,
          height: BASE,
          transform: `scale(${size / BASE})`,
        }}
      >
        <div className="absolute -top-[10.65px] -left-[10.65px] size-[384.3px]">
          <div className="absolute top-[42.7px] left-[42.7px] size-[298.9px] rounded-full border-[0.534px] border-dashed border-[rgba(13,148,136,0.22)]">
            <Dot left={262.09} top={44.67} />
            <Dot left={59.56} top={238.26} />
          </div>
          <div className="absolute top-0 left-0 size-[384.3px] rounded-full border-[0.534px] border-dashed border-[rgba(203,213,225,0.4)]">
            <Dot left={375.56} top={172.45} />
            <Dot left={7.66} top={229.94} />
          </div>
        </div>

        <div className="absolute top-[-1.5px] left-20 h-[338px] w-[202px]">
          <img
            src="/employeeCard.svg"
            alt=""
            className="block size-full"
            draggable={false}
          />
          {(name || email) && (
            <div className="absolute top-[180.27px] left-[33.24px] h-[79.9px] w-[129.79px] origin-top-left rotate-2">
              {name && (
                <p className="absolute top-[8.37px] left-[10.37px] text-[17px] font-bold whitespace-nowrap text-[#0f172a]">
                  {name}
                </p>
              )}
              {email && (
                <p className="absolute top-[33.37px] left-[10.37px] text-[7px] whitespace-nowrap text-[#64748b]">
                  {email}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeCardWindow;
