type ConditionChipProps = {
  items: string[];
  className?: string;
};

const ConditionChip = ({ items, className = "" }: ConditionChipProps) => {
  return (
    <div
      className={`inline-flex items-center rounded-full border border-slate-200 px-4 py-[10px] ${className}`}
    >
      <p className="text-[14px] font-medium tracking-[-0.21px] whitespace-nowrap text-slate-700">
        {items.join(" | ")}
      </p>
    </div>
  );
};

export default ConditionChip;
