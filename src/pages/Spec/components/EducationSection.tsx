import { useRef, useState } from "react";
import type { Education } from "@/types/spec/education";
import type { SpecFormOptions } from "@/types/spec/profile";
import EducationForm from "./EducationForm";
import SavedItemActions from "./SavedItemActions";
import { formatYearMonth } from "../utils/formatYearMonth";
import { isValidEducation } from "../utils/specValidation";

type Props = {
  educations: Education[];
  options: SpecFormOptions;
  onSave: (value: Education) => void;
  onDelete: (localId: number) => void;
};

const createEducation = (localId: number): Education => ({
  localId,
  academicAbilityId: null,
  type: "",
  status: "",
  location: "",
  universityGrade: "",
  universityStandardGrade: "",
  graduatedYearMonth: "",
  majorAffiliation: "",
  majorId: null,
  majorName: "",
});

export default function EducationSection({
  educations,
  options,
  onSave,
  onDelete,
}: Props) {
  const nextId = useRef(
    Math.max(1, ...educations.map((item) => item.localId)) + 1,
  );
  const [draft, setDraft] = useState<Education | null>(() =>
    educations.length ? null : createEducation(1),
  );

  const canSave = draft !== null && isValidEducation(draft, options);

  const add = () => {
    nextId.current = Math.max(
      nextId.current,
      ...educations.map((item) => item.localId + 1),
    );
    setDraft(createEducation(nextId.current++));
  };

  const save = () => {
    if (!draft || !canSave) return;
    onSave(draft);
    setDraft(null);
  };

  const remove = (id: number) => {
    onDelete(id);
    if (educations.length === 1) add();
  };

  return (
    <section className="border-b border-border pb-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[10px] font-bold text-brand-strong">
          02
        </span>
        <h2 className="text-[15px] font-medium text-text-primary">
          학력 사항 <span className="text-brand">*</span>
        </h2>
        <button
          type="button"
          disabled={draft !== null}
          onClick={add}
          className="ml-auto cursor-pointer text-[11px] font-semibold text-brand-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          + 학력 추가
        </button>
      </div>

      {educations
        .filter((item) => item.localId !== draft?.localId)
        .map((item) => {
          const location =
            options.schoolLocations.find(
              (option) => option.code === item.location,
            )?.name ?? item.location;

          const degree =
            options.degreeTypes.find(
              (option) => option.value === item.type,
            )?.label ?? item.type;

          const majorField = options.majorFields.find(
            (option) => option.value === item.majorAffiliation,
          )?.label.replace(/계열$/, " 계열");

          // TODO(API 명세 협의): 학위 ENUM과 학교 구분 기준 확정
          const school =
            item.type === "MASTER"
              ? "대학원"
              : "대학";

          // TODO(API 명세 협의): 실제 학적 상태 ENUM과 표시 정책 확정
          const graduationStatus =
            item.status === "ATTENDING"
              ? "졸업 예정"
              : item.status === "GRADUATED"
                ? "졸업"
                : "";

          return (
            <div
              key={item.localId}
              className="mb-4 border-b border-border pb-4 last:border-b-0"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-[16px] font-bold leading-6 text-text-primary">
                    {location} 소재 {school}
                  </p>
                  <span className="text-[11px] font-semibold text-brand-strong">
                    {degree}
                  </span>
                </div>
                <SavedItemActions
                  disabled={draft !== null}
                  onEdit={() => setDraft({ ...item })}
                  onDelete={() => remove(item.localId)}
                />
              </div>

              {(item.majorName || majorField) && (
                <div className="mt-2.5 flex flex-wrap items-center gap-3">
                  {item.majorName && (
                    <span className="text-[13px] font-bold leading-5 text-text-primary">
                      {item.majorName}
                    </span>
                  )}
                  {item.majorName && majorField && (
                    <span
                      aria-hidden="true"
                      className="text-[13px] text-border-strong"
                    >
                      |
                    </span>
                  )}
                  {majorField && (
                    <span className="text-[11px] text-text-secondary">
                      {majorField}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-3 flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-1">
                  {item.universityGrade && (
                    <span className="text-[15px] font-bold leading-5 text-text-primary">
                      {item.universityGrade}
                    </span>
                  )}
                  {item.universityStandardGrade && (
                    <span className="text-[11px] text-text-muted">
                      / {item.universityStandardGrade}
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-baseline gap-2 text-[11px]">
                  {item.graduatedYearMonth && (
                    <span className="text-text-muted">
                      {formatYearMonth(item.graduatedYearMonth)}
                    </span>
                  )}
                  {graduationStatus && (
                    <span className="font-semibold text-brand-strong">
                      {graduationStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

      {draft && (
        <EducationForm
          value={draft}
          options={options}
          canSave={canSave}
          onChange={(changes) =>
            setDraft((prev) => (prev ? { ...prev, ...changes } : null))
          }
          onSave={save}
          onCancel={() =>
            setDraft(
              educations.length ? null : createEducation(draft.localId),
            )
          }
        />
      )}
    </section>
  );
}