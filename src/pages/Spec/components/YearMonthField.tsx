import chevronDown from "@/assets/icons/chevronDown.svg";
import { fieldClass, labelClass } from "./formStyles";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const months = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);

export default function YearMonthField({ label, value, onChange }: Props) {
  const [year = "", month = ""] = value.split("-");

  return (
    <div className={labelClass}>
      <span>{label}</span>
      <div className="flex gap-2">
        <input
          aria-label={`${label} 연도`}
          inputMode="numeric"
          maxLength={4}
          value={year}
          onChange={(event) => {
            const next = event.target.value.replace(/\D/g, "");
            onChange(next.length === 4 && month ? `${next}-${month}` : next);
          }}
          placeholder="연도"
          className={`${fieldClass} flex-1`}
        />
        <div className="relative w-24 shrink-0">
          <select
            aria-label={`${label} 월`}
            value={year.length === 4 ? month : ""}
            disabled={year.length !== 4}
            onChange={(event) =>
              onChange(event.target.value ? `${year}-${event.target.value}` : year)
            }
            className={`${fieldClass} cursor-pointer appearance-none pr-8 disabled:cursor-not-allowed`}
          >
            <option value="">월</option>
            {months.map((monthValue) => (
              <option key={monthValue} value={monthValue}>
                {Number(monthValue)}월
              </option>
            ))}
          </select>
          <img
            src={chevronDown}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
          />
        </div>
      </div>
    </div>
  );
}