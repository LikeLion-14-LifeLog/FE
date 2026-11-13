import { useRef, useState } from "react";
import type { Experience } from "@/types/spec/experience";
import ExperienceForm from "./ExperienceForm";

type Props = {
  experiences: Experience[];
  onSave: (value: Experience) => void;
  onDelete: (localId: number) => void;
};

const createExperience = (localId: number): Experience => ({
  localId,
  experienceId: null,
  type: "",
  title: "",
  startedYearMonth: "",
  endedYearMonth: "",
  description: "",
  awarded: false,
  organizerName: "",
  awardGrade: "",
});

function isValidExperience(value: Experience | null): boolean {
  if (!value) return false;

  const validPeriod =
    !value.startedYearMonth ||
    !value.endedYearMonth ||
    value.startedYearMonth <= value.endedYearMonth;

  return (
    value.type !== "" &&
    value.title.trim() !== "" &&
    value.title.length <= 255 &&
    value.description.length <= 300 &&
    validPeriod &&
    (!value.awarded ||
      (value.organizerName.trim() !== "" &&
        value.awardGrade.trim() !== ""))
  );
}

export default function ExperienceSection({
  experiences,
  onSave,
  onDelete,
}: Props) {
  const nextId = useRef(1);
  const [draft, setDraft] = useState<Experience | null>(null);
  const canSave = isValidExperience(draft);

  const addExperience = () => {
    setDraft(createExperience(nextId.current++));
  };

  const saveExperience = () => {
    if (!draft || !canSave) return;

    onSave(draft);
    setDraft(null);
  };

  return (
    <section className="border-b border-border pb-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-[10px] font-bold text-brand-strong">
          04
        </span>
        <h2 className="text-[15px] font-semibold text-text-primary">
          대외활동 및 실무 경험
        </h2>
        <span className="text-[11px] text-text-muted">선택</span>

        <button
          type="button"
          onClick={addExperience}
          disabled={draft !== null}
          className="ml-auto text-[11px] font-semibold text-brand-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          + 새 활동 등록
        </button>
      </div>

      {experiences
        .filter((item) => item.localId !== draft?.localId)
        .map((item) => (
          <div
            key={item.localId}
            className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4"
          >
            <div className="min-w-0">
              <p className="break-words text-[13px] font-semibold text-text-primary">
                {item.title}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {item.type === "INTERNSHIP" ? "인턴" : item.type}
                {item.startedYearMonth && ` · ${item.startedYearMonth}`}
                {item.endedYearMonth && ` ~ ${item.endedYearMonth}`}
              </p>
            </div>

            <div className="flex shrink-0 gap-3 text-[11px]">
              <button
                type="button"
                disabled={draft !== null}
                onClick={() => setDraft({ ...item })}
                className="text-brand-strong disabled:cursor-not-allowed disabled:opacity-40"
              >
                수정
              </button>
              <button
                type="button"
                disabled={draft !== null}
                onClick={() => onDelete(item.localId)}
                className="text-text-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                삭제
              </button>
            </div>
          </div>
        ))}

      {draft && (
        <ExperienceForm
          value={draft}
          canSave={canSave}
          onChange={(changes) =>
            setDraft((prev) =>
              prev ? { ...prev, ...changes } : null,
            )
          }
          onSave={saveExperience}
          onCancel={() => setDraft(null)}
        />
      )}
    </section>
  );
}