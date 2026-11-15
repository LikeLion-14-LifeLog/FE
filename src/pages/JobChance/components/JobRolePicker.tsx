import { useEffect, useMemo, useRef, useState } from "react";
import type { JobRole } from "@/types/jobs";

interface JobRolePickerProps {
  categories: string[];
  roles: JobRole[];
  value: string;
  onChange: (value: string) => void;
  allLabel?: string;
}

const ALL_CATEGORY = "전체";

export default function JobRolePicker({
  categories,
  roles,
  value,
  onChange,
  allLabel = "전체",
}: JobRolePickerProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(ALL_CATEGORY);
  const [keyword, setKeyword] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEsc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEsc);
    };
  }, [open]);

  const results = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return roles.filter(
      (role) =>
        (category === ALL_CATEGORY || role.category === category) &&
        (!query ||
          `${role.name} ${role.description}`.toLowerCase().includes(query))
    );
  }, [roles, category, keyword]);

  const toggleOpen = () => {
    if (!open) {
      const current = roles.find((role) => role.name === value);
      setCategory(current?.category ?? ALL_CATEGORY);
      setKeyword("");
    }
    setOpen((prev) => !prev);
  };

  const select = (name: string) => {
    onChange(name);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggleOpen}
        className="flex h-[32.75px] cursor-pointer items-center justify-between gap-1.5 rounded-md border border-[#0d9488] bg-[#0d9488] px-3 text-[12.5px] leading-[18.75px] font-bold whitespace-nowrap text-white"
      >
        <span>직무: {value}</span>
        <span aria-hidden className="text-[9px] leading-[13.5px] text-white/85">
          ▼
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="직무 선택"
          className="absolute top-[calc(100%+6px)] left-0 z-20 flex w-[440px] flex-col rounded-[14px] border border-[#e2e8f0] bg-white p-4 shadow-[0px_12px_28px_0px_rgba(15,23,41,0.12)]"
        >
          <div className="flex items-center justify-between">
            <div role="tablist" className="flex gap-3.5">
              {categories.map((item) => {
                const isActive = item === category;
                return (
                  <button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setCategory(item)}
                    className={`cursor-pointer text-[13px] leading-[19.5px] whitespace-nowrap transition-colors ${
                      isActive
                        ? "font-bold text-[#0d9488]"
                        : "font-medium text-[#64748b] hover:text-[#0f172a]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="mt-3 flex h-11 items-center gap-2.5 rounded-[10px] border border-[#0d9488]/50 bg-[#f0fdfa]/60 px-3.5 focus-within:border-[#0d9488]">
            <svg
              aria-hidden
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0"
            >
              <circle cx="7" cy="7" r="4.75" stroke="#0d9488" strokeWidth="1.5" />
              <path
                d="M10.5 10.5L14 14"
                stroke="#0d9488"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              autoFocus
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="직무명 또는 키워드를 입력해 주세요"
              className="w-full bg-transparent text-[13px] text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
            />
          </label>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11.5px] text-[#94a3b8]">
              검색 결과 {results.length}건
            </p>
            <button
              type="button"
              onClick={() => select(allLabel)}
              className={`cursor-pointer text-[11.5px] font-semibold transition-colors ${
                value === allLabel
                  ? "text-[#0d9488]"
                  : "text-[#64748b] hover:text-[#0d9488]"
              }`}
            >
              직무 전체 보기
            </button>
          </div>

          {results.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-[#94a3b8]">
              검색 결과가 없습니다.
            </p>
          ) : (
            <ul className="mt-1.5 flex max-h-[296px] flex-col gap-1 overflow-y-auto [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]">
              {results.map((role) => {
                const isSelected = role.name === value;
                return (
                  <li key={role.name}>
                    <button
                      type="button"
                      onClick={() => select(role.name)}
                      className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors ${
                        isSelected ? "bg-[#f0fdfa]" : "hover:bg-[#f8fafc]"
                      }`}
                    >
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-[14px] leading-[21px] font-bold text-[#0f172a]">
                          {role.name}
                        </span>
                        <span className="truncate text-[11.5px] leading-[17px] text-[#64748b]">
                          {role.category} · {role.description}
                        </span>
                      </span>
                      <span
                        className={`flex shrink-0 items-center gap-1 text-[12px] ${
                          isSelected
                            ? "font-bold text-[#0d9488]"
                            : "font-medium text-[#94a3b8]"
                        }`}
                      >
                        {isSelected && (
                          <img src="/jobs/check.svg" alt="" className="size-3.5" />
                        )}
                        {isSelected ? "선택됨" : "선택"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
