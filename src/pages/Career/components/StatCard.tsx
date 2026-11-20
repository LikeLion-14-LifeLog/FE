type StatCardProps = {
  label: string;
  value: string;
  className?: string;
};

const StatCard = ({ label, value, className = "" }: StatCardProps) => {
  return (
    <div
      className={`flex flex-col items-start gap-1 rounded-[12px] bg-slate-50 px-[18px] py-4 ${className}`}
    >
      <p className="min-h-8 text-[13px] font-medium tracking-[-0.195px] text-slate-500">
        {label}
      </p>
      <p className="text-[26px] font-extrabold tracking-[-0.39px] whitespace-nowrap text-slate-900">
        {value}
      </p>
    </div>
  );
};

export default StatCard;
