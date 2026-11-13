import { Link, NavLink } from "react-router-dom";
import { useCurrentUser } from "@/store/authStore";

const menus = [
  { name: "대시보드", path: "/dashboard" },
  { name: "내 스펙·진단", path: "/spec" },
  { name: "연봉 시뮬레이터", path: "/salary" },
  { name: "커리어 경로", path: "/career" },
  { name: "채용 기회", path: "/jobs" },
];

export default function Header() {
  const user = useCurrentUser();

  return (
    <header className="w-full border-b border-border bg-white">
      <div className="flex h-16 w-full items-center gap-12 px-6 lg:px-12">
        <Link
          to="/"
          aria-label="LifeLog 홈"
          className="shrink-0 text-[22px] leading-[33px] font-extrabold tracking-[-0.5px] text-text-primary"
        >
          LifeLog<span className="ml-1 text-[24px] text-brand">.</span>
        </Link>

        <nav aria-label="주 메뉴" className="flex h-full flex-1 items-center gap-8">
          {menus.map(({ name, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `relative flex h-full shrink-0 items-center text-[14.5px] font-medium transition-colors ${
                  isActive
                    ? "font-bold text-brand after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:rounded-t-[3px] after:bg-brand"
                    : "text-text-secondary hover:text-brand"
                }`
              }
            >
              {name}
            </NavLink>
          ))}
        </nav>

        {user ? (
          <div className="flex h-8 shrink-0 items-center gap-2">
            <img
              src="/usericon.svg"
              alt=""
              className="size-8 shrink-0"
              draggable={false}
            />
            <span className="text-[14px] leading-[21px] font-bold whitespace-nowrap text-[#1e293b]">
              {user.nickname}
            </span>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-5 text-[14px] font-medium">
            <Link
              to="/login"
              className="text-text-primary transition-colors hover:text-brand"
            >
              로그인
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-brand px-4 py-2 text-white transition-colors hover:bg-brand-strong"
            >
              회원가입
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
