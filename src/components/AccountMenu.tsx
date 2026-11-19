import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { requestLogout } from "@/apis/auth";
import { logout, type CurrentUser } from "@/store/authStore";

type MenuItemProps = {
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
};

const MenuItem = ({ icon, children, onClick, danger }: MenuItemProps) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14.5px] font-medium ${
      danger ? "text-[#dc2626]" : "text-text-primary"
    }`}
  >
    <span className="flex size-5 shrink-0 items-center justify-center">
      {icon}
    </span>
    {children}
  </button>
);

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const SwitchIcon = () => (
  <svg {...iconProps}>
    <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5" />
    <path d="M20 4v4.5h-4.5" />
    <path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5" />
    <path d="M4 20v-4.5h4.5" />
  </svg>
);

const LogoutIcon = () => (
  <svg {...iconProps}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

type AccountMenuProps = {
  user: CurrentUser;
};

export default function AccountMenu({ user }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  /** 서버에 로그아웃을 알리고(결과와 무관하게) 로컬 세션은 바로 지운다 */
  const signOut = () => {
    requestLogout().catch(() => {
      // 서버 로그아웃이 실패해도 이 기기에서는 로그아웃된 상태로 둔다
    });
    logout();
  };

  const handleSwitchAccount = () => {
    setOpen(false);
    signOut();
    navigate("/login");
  };

  const handleLogout = () => {
    setOpen(false);
    signOut();
    navigate("/");
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 cursor-pointer items-center gap-2 rounded-lg"
      >
        <img
          src="/usericon.svg"
          alt=""
          className="size-8 shrink-0"
          draggable={false}
        />
        <span className="text-[14px] leading-[21px] font-bold whitespace-nowrap text-[#1e293b]">
          {user.nickname}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-[calc(100%+12px)] right-0 z-50 w-[300px] rounded-2xl border border-border bg-white p-2 shadow-[0_12px_32px_rgba(15,23,42,0.14)]"
        >
          <div className="flex flex-col items-center rounded-xl bg-brand-soft px-4 pt-6 pb-5">
            <img
              src="/usericon.svg"
              alt=""
              className="size-16 shrink-0"
              draggable={false}
            />
            <p className="mt-3 max-w-full truncate text-[17px] font-extrabold tracking-[-0.3px] text-text-primary">
              {user.nickname}
            </p>
            <p className="mt-0.5 max-w-full truncate text-[13px] text-text-secondary">
              {user.email}
            </p>
          </div>

          <div className="pt-2">
            <MenuItem icon={<SwitchIcon />} onClick={handleSwitchAccount}>
              계정 전환
            </MenuItem>
            <MenuItem icon={<LogoutIcon />} onClick={handleLogout} danger>
              로그아웃
            </MenuItem>
          </div>
        </div>
      )}
    </div>
  );
}
