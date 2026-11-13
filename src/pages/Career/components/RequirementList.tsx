import CareerIcon, { type CareerIconName } from "./CareerIcon";

type RequirementListProps = {
  title: string;
  icon: CareerIconName;
  items: string[];
  /** brand: 추천 경험처럼 teal 톤으로 강조 */
  tone?: "default" | "brand";
};

const RequirementList = ({
  title,
  icon,
  items,
  tone = "default",
}: RequirementListProps) => {
  const itemClass = tone === "brand" ? "text-teal-700" : "text-slate-700";
  const dividerClass = tone === "brand" ? "border-teal-50" : "border-slate-50";

  return (
    <div className="flex flex-col">
      <p className="flex items-center gap-1.5 pb-2 text-[13.5px] leading-[20.25px] font-extrabold text-slate-900">
        <span className="flex w-3.5 justify-center">
          <CareerIcon name={icon} />
        </span>
        {title}
      </p>
      <ul className="flex flex-col gap-2 pl-1.5">
        {items.map((item, i) => (
          <li
            key={item}
            className={`text-[13px] leading-[19.5px] ${itemClass} ${
              i < items.length - 1 ? `border-b pb-1.5 ${dividerClass}` : "pb-1"
            }`}
          >
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RequirementList;
