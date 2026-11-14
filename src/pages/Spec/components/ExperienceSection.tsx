import { useRef, useState } from "react";
import type { Experience } from "@/types/spec/experience";
import ExperienceForm from "./ExperienceForm";
import SavedItemActions from "./SavedItemActions";
import { formatYearMonth } from "../utils/formatYearMonth";

type Props = {
  experiences: Experience[];
  onSave: (value: Experience) => void;
  onDelete: (localId: number) => void;
};

const createExperience = (localId: number): Experience => ({
  localId,
  experienceId: null,
  type: "",
  organizationName: "",
  title: "",
  startedYearMonth: "",
  endedYearMonth: "",
  description: "",
  awarded: false,
  organizerName: "",
  awardGrade: "",
});

const validMonth = (value: string) =>
  !value || /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

export default function ExperienceSection({
  experiences,
  onSave,
  onDelete,
}: Props) {
  const nextId = useRef(
    Math.max(0, ...experiences.map((item) => item.localId)) + 1,
  );
  const [draft, setDraft] = useState<Experience | null>(null);

  const canSave =
    !!draft?.type &&
    !!draft.title.trim() &&
    draft.title.length <= 255 &&
    draft.description.length <= 300 &&
    validMonth(draft.startedYearMonth) &&
    validMonth(draft.endedYearMonth) &&
    (!draft.startedYearMonth ||
      !draft.endedYearMonth ||
      draft.startedYearMonth <= draft.endedYearMonth);

  const activityIndex = draft
    ? experiences.findIndex((item) => item.localId === draft.localId)
    : -1;

  const activityNumber =
    activityIndex < 0 ? experiences.length + 1 : activityIndex + 1;

  const save = () => {
    if (!draft || !canSave) return;
    onSave(draft);
    setDraft(null);
  };

  return (
    <section className="border-b border-border pb-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[10px] font-bold text-brand-strong">
          04
        </span>

        <h2 className="text-[15px] font-medium text-text-primary">
          대외활동 및 실무 경험
        </h2>

        <button
          type="button"
          disabled={draft !== null}
          onClick={() => setDraft(createExperience(nextId.current++))}
          className="ml-auto text-[11px] font-semibold text-brand-strong cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        >
          + 새 활동 등록
        </button>
      </div>

      {experiences
        .filter((item) => item.localId !== draft?.localId)
        .map((item) => (
          <div
            key={item.localId}
            className="border-b border-border py-4 last:border-b-0"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 break-words text-[11px] text-text-secondary">
                <span className="font-semibold text-brand-strong">
                  {item.type === "INTERNSHIP" ? "직무 경험" : item.type}
                </span>
                {item.organizationName && ` | ${item.organizationName}`}
                {item.startedYearMonth &&
                  ` | ${formatYearMonth(item.startedYearMonth)}${
                    item.endedYearMonth
                      ? ` ~ ${formatYearMonth(item.endedYearMonth)}`
                      : ""
                  }`}
              </p>

              <SavedItemActions
                disabled={draft !== null}
                onEdit={() => setDraft({ ...item })}
                onDelete={() => onDelete(item.localId)}
              />
            </div>

            <p className="mt-3 text-[13px] font-semibold text-text-primary">
              {item.title}
            </p>

            {item.description && (
              <p className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-text-secondary">
                {item.description}
              </p>
            )}
          </div>
        ))}

      {draft && (
        <ExperienceForm
          value={draft}
          activityNumber={activityNumber}
          canSave={canSave}
          onChange={(changes) =>
            setDraft((prev) =>
              prev ? { ...prev, ...changes } : null,
            )
          }
          onSave={save}
          onCancel={() => setDraft(null)}
        />
      )}
    </section>
  );
}