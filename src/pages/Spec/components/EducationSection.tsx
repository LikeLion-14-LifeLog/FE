import { useRef, useState } from "react";
import type { Education } from "@/types/spec/education";
import type { SpecFormOptions } from "@/types/spec/profile";
import EducationForm from "./EducationForm";

type Props = {
  educations: Education[];
  onSave: (education: Education) => void;
  onDelete: (localId: number) => void;
  options: SpecFormOptions;
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
  onSave,
  onDelete,
  options,
}: Props) {
  const nextId = useRef(2);
  const [draft, setDraft] = useState<Education | null>(() =>
    createEducation(1),
  );

  const updateDraft = (changes: Partial<Education>) => {
    setDraft((prev) => (prev ? { ...prev, ...changes } : null));
  };

  const addEducation = () => {
    setDraft(createEducation(nextId.current++));
  };

  const cancelEducation = () => {
    if (!draft) return;
    setDraft(educations.length ? null : createEducation(draft.localId));
  };

  const deleteEducation = (localId: number) => {
    onDelete(localId);
    if (educations.length === 1) addEducation();
  };

  // 로컬 카드 확정용 검증이며 서버 PUT 검증이 아님
  // TODO: 실제 API 저장 시 majorId 및 학력 유형별 필수 조건 확인
  const hasMajorInput = Boolean(
    draft?.majorAffiliation || draft?.majorName || draft?.majorId != null,
  );

  const hasCompleteMajor = Boolean(
    draft?.majorAffiliation && draft.majorName.trim(),
  );

  const canSave = Boolean(
    draft?.type &&
      draft.status &&
      draft.location &&
      (!hasMajorInput || hasCompleteMajor),
  );

  const saveEducation = () => {
    if (!draft || !canSave) return;
    onSave(draft);
    setDraft(null);
  };

  return (
    <section className="border-b border-border pb-8">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-[10px] font-bold text-brand-strong">
          02
        </span>
        <h2 className="text-[15px] font-semibold text-text-primary">
          학력 사항 <span className="text-brand">*</span>
        </h2>
        <button
          type="button"
          onClick={addEducation}
          disabled={draft !== null}
          className="ml-auto text-[11px] font-semibold text-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          + 학력 추가
        </button>
      </div>

      {educations
        .filter((item) => item.localId !== draft?.localId)
        .map((education) => (
          <div
            key={education.localId}
            className="mb-4 border-b border-border pb-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-semibold text-text-primary">
                {options.degreeTypes.find(
                  (item) => item.value === education.type,
                )?.label ?? education.type}
                {education.majorName && ` · ${education.majorName}`}
              </p>

              <div className="flex gap-3 text-[11px]">
                <button
                  type="button"
                  disabled={draft !== null}
                  onClick={() => setDraft({ ...education })}
                  className="text-brand-strong disabled:opacity-40"
                >
                  수정
                </button>
                <button
                  type="button"
                  disabled={draft !== null}
                  onClick={() => deleteEducation(education.localId)}
                  className="text-text-secondary disabled:opacity-40"
                >
                  삭제
                </button>
              </div>
            </div>

            <p className="mt-2 text-[11px] text-text-secondary">
              {options.academicStatuses.find(
                (item) => item.value === education.status,
              )?.label ?? education.status}
              {education.graduatedYearMonth &&
                ` · ${education.graduatedYearMonth}`}
            </p>
          </div>
        ))}

      {draft && (
        <EducationForm
          value={draft}
          options={options}
          canSave={canSave}
          onChange={updateDraft}
          onSave={saveEducation}
          onCancel={cancelEducation}
        />
      )}
    </section>
  );
}