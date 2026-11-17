import { useEffect, useRef, useState } from "react";
import ExperienceForm from "@/pages/Spec/components/ExperienceForm";
import { isValidYearMonth } from "@/pages/Spec/utils/specValidation";
import type { Experience } from "@/types/spec/experience";
import type { SalaryExperience } from "@/types/salaryApi";

type Props = {
  selected: SalaryExperience[];
  onClose: () => void;
  onApply: (experiences: SalaryExperience[]) => void;
};

const createExperience = (localId: number): Experience => ({
  localId,
  experienceId: null,
  type: "INTERNSHIP",
  title: "",
  startedYearMonth: "",
  endedYearMonth: "",
  description: "",
  awarded: false,
  organizerName: "",
  awardGrade: "",
});

const isValidTargetExperience = (value: Experience) =>
  value.type === "INTERNSHIP" &&
  !!value.title.trim() &&
  value.title.length <= 255 &&
  value.description.length <= 300 &&
  isValidYearMonth(value.startedYearMonth) &&
  (!value.endedYearMonth ||
    (isValidYearMonth(value.endedYearMonth) &&
      value.startedYearMonth <= value.endedYearMonth));

const toSalaryExperience = (value: Experience): SalaryExperience => ({
  type: "INTERNSHIP",
  title: value.title.trim(),
  startedYearMonth: value.startedYearMonth,
  endedYearMonth: value.endedYearMonth || null,
  description: value.description.trim() || null,
  awarded: false,
  organizerName: null,
  awardGrade: null,
});

export default function SalaryExperienceDrawer({
  selected,
  onClose,
  onApply,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nextId = useRef(selected.length + 1);

  const [experiences, setExperiences] = useState<Experience[]>(() =>
    selected.map((item, index) => ({
      localId: index + 1,
      experienceId: null,
      type: item.type,
      title: item.title,
      startedYearMonth: item.startedYearMonth,
      endedYearMonth: item.endedYearMonth ?? "",
      description: item.description ?? "",
      awarded: item.awarded,
      organizerName: item.organizerName ?? "",
      awardGrade: item.awardGrade ?? "",
    }))
  );
  const [draft, setDraft] = useState<Experience | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const add = () => {
    setDraft(createExperience(nextId.current++));
  };

  const save = () => {
    if (!draft || !isValidTargetExperience(draft)) return;

    setExperiences((previous) =>
      previous.some((item) => item.localId === draft.localId)
        ? previous.map((item) =>
            item.localId === draft.localId ? draft : item
          )
        : [...previous, draft]
    );
    setDraft(null);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="salary-experience-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-y-0 right-0 left-auto m-0 h-[calc(100dvh/var(--page-zoom,1))] max-h-none w-full max-w-[411px] translate-x-0 overflow-hidden border-l border-border/90 bg-bg-page p-0 text-text-primary shadow-xl backdrop:bg-text-primary/30 motion-safe:transition-transform motion-safe:duration-300 motion-safe:starting:translate-x-full"
    >
      <div className="flex h-full flex-col">
        <header className="flex min-h-[109px] shrink-0 items-start justify-between gap-4 border-b border-border/90 px-[25px] pt-8 pb-5">
          <div>
            <p className="text-[10px] font-bold text-brand-strong">조건 변경</p>
            <h2
              id="salary-experience-title"
              className="mt-2 text-[20px] font-medium"
            >
              직무 경험
            </h2>
          </div>
          <button
            type="button"
            aria-label="직무 경험 입력 닫기"
            onClick={onClose}
            className="grid size-8 cursor-pointer place-items-center text-[22px] leading-none text-text-muted hover:text-text-primary"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-[25px] py-6">
          <p className="mb-5 text-[12px] leading-5 text-text-secondary">
            추가로 달성할 직무 경험을 입력해 주세요.
          </p>

          {experiences.map((item) => (
            <div
              key={item.localId}
              className="mb-3 rounded-lg border border-border bg-white p-4"
            >
              <p className="break-words text-[13px] font-semibold">
                {item.title}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {item.startedYearMonth}
                {item.endedYearMonth && ` ~ ${item.endedYearMonth}`}
              </p>
              <div className="mt-3 flex justify-end gap-4">
                <button
                  type="button"
                  disabled={draft !== null}
                  onClick={() => setDraft({ ...item })}
                  className="text-[12px] text-text-secondary enabled:cursor-pointer disabled:opacity-40"
                >
                  수정
                </button>
                <button
                  type="button"
                  disabled={draft !== null}
                  onClick={() =>
                    setExperiences((previous) =>
                      previous.filter(
                        (experience) => experience.localId !== item.localId
                      )
                    )
                  }
                  className="text-[12px] text-text-secondary enabled:cursor-pointer disabled:opacity-40"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}

          {draft ? (
            <ExperienceForm
              targetMode
              value={draft}
              activityNumber={
                experiences.findIndex(
                  (item) => item.localId === draft.localId
                ) + 1 || experiences.length + 1
              }
              canSave={isValidTargetExperience(draft)}
              onChange={(changes) =>
                setDraft((previous) =>
                  previous ? { ...previous, ...changes } : null
                )
              }
              onSave={save}
              onCancel={() => setDraft(null)}
            />
          ) : (
            <button
              type="button"
              onClick={add}
              className="w-full cursor-pointer rounded-lg border border-dashed border-border-strong py-4 text-[12px] font-semibold text-brand-strong hover:bg-bg-section"
            >
              + 직무 경험 추가
            </button>
          )}
        </div>

        <footer className="shrink-0 border-t border-border/90 px-[25px] py-[17px]">
          <button
            type="button"
            disabled={draft !== null}
            onClick={() => onApply(experiences.map(toSalaryExperience))}
            className="min-h-[46px] w-full cursor-pointer rounded-[9px] bg-text-primary px-4 text-[13px] font-bold text-white enabled:hover:bg-text-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            조건 적용
          </button>
        </footer>
      </div>
    </dialog>
  );
}
