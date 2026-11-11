import { Link } from "react-router-dom";

const NAV_ITEMS = [
  { label: "대시보드", to: "/" },
  { label: "내 스펙·진단", to: "/" },
  { label: "연봉 시뮬레이터", to: "/salary" },
  { label: "커리어 경로", to: "/career" },
  { label: "채용 기회", to: "/job" },
];

/** 로그인/회원가입 화면 상단 헤더 — Figma 3:32 */
const AuthHeader = () => {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-[#e2e8f0] bg-[rgba(255,255,255,0.7)] px-4 backdrop-blur-[8px] md:px-12">
      <div className="flex h-16 items-center gap-12">
        <Link
          to="/"
          className="flex items-center gap-1 text-[22px] leading-[33px] font-extrabold tracking-[-0.5px] text-[#0f172a]"
        >
          LifeLog<span className="text-[#0d9488]">.</span>
        </Link>
        <nav className="hidden h-16 items-center gap-8 lg:flex">
          {NAV_ITEMS.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="flex h-16 items-center py-2.5 text-[14.5px] leading-[14.5px] font-medium whitespace-nowrap text-[#64748b] transition-colors hover:text-[#0f172a]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <Link
          to="/login"
          className="text-[14px] leading-[21px] font-bold whitespace-nowrap text-[#0f172a]"
        >
          로그인
        </Link>
        <Link
          to="/signup"
          className="flex h-9 w-[84px] items-center justify-center rounded-lg bg-[#0f172a] px-4 text-[13px] leading-[19.5px] font-bold whitespace-nowrap text-white"
        >
          회원가입
        </Link>
      </div>
    </header>
  );
};

export default AuthHeader;
