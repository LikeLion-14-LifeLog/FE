import type { JobTab } from "@/types/jobs";

interface JobTabsProps {
  value: JobTab;
  onChange: (tab: JobTab) => void;
  counts: Record<JobTab, number>;
}

const TABS: { value: JobTab; label: string }[] = [
  { value: "recommended", label: "맞춤 공고" },
  { value: "saved", label: "저장한 공고" },
  { value: "offers", label: "받은 제안" },
];

export default function JobTabs({ value, onChange, counts }: JobTabsProps) {
  return (
    <div
      role="tablist"
      className="mb-5.5 flex gap-2 border-b border-[#e2e8f0] pb-3.5"
    >
      {TABS.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={`flex h-[37px] cursor-pointer items-center gap-1.5 rounded-lg px-4 text-[14px] leading-[21px] transition-colors ${
              isActive
                ? "bg-white font-extrabold text-[#0f172a] drop-shadow-[0px_1px_1.5px_rgba(15,23,42,0.08)]"
                : "font-semibold text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            <span>{tab.label}</span>
            <span className="tracking-[-0.14px]">({counts[tab.value]})</span>
          </button>
        );
      })}
    </div>
  );
}
