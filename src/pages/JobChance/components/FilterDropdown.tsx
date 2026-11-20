import { useEffect, useRef, useState } from "react";
import type { DropdownOption } from "@/types/jobs";

interface FilterDropdownProps<T extends string> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  variant?: "filled" | "outline";
  width?: number;
  menuWidth?: number;
  alignRight?: boolean;
}

export default function FilterDropdown<T extends string>({
  options,
  value,
  onChange,
  label,
  variant = "outline",
  width,
  menuWidth,
  alignRight = false,
}: FilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

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

  const isFilled = variant === "filled";
  const buttonClass = isFilled
    ? "border-[#0d9488] bg-[#0d9488] font-bold text-white"
    : `bg-white font-semibold text-[#475569] ${open ? "border-[#0d9488]" : "border-[#cbd5e1]"}`;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        style={width ? { width } : undefined}
        className={`flex h-[32.75px] cursor-pointer items-center justify-between gap-1.5 rounded-md border px-3 text-[12.5px] leading-[18.75px] whitespace-nowrap transition-colors ${buttonClass}`}
      >
        <span>
          {label ? `${label}: ` : ""}
          {selected?.label}
        </span>
        <span
          aria-hidden
          className={`text-[9px] leading-[13.5px] ${isFilled ? "text-white/85" : "text-[#94a3b8]"}`}
        >
          ▼
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          style={{ minWidth: menuWidth ?? width }}
          className={`absolute top-[calc(100%+6px)] z-20 flex max-h-[242px] flex-col gap-0.5 overflow-y-auto rounded-[14px] border border-[#e2e8f0] bg-white p-1.5 shadow-[0px_12px_28px_0px_rgba(15,23,41,0.12)] [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin] ${alignRight ? "right-0" : "left-0"}`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg py-[9px] pr-2.5 pl-3 text-left transition-colors hover:bg-[#f1f5f9]"
                >
                  <span className="flex flex-col">
                    <span
                      className={`text-[13px] whitespace-nowrap ${isSelected ? "font-medium text-[#0f172a]" : "text-[#334155]"}`}
                    >
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="text-[10.5px] whitespace-nowrap text-[#94a3b8]">
                        {option.description}
                      </span>
                    )}
                  </span>
                  {isSelected && (
                    <img src="/jobs/check.svg" alt="" className="size-3.5 shrink-0" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
