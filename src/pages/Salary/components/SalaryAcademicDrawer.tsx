import { useEffect, useRef, useState } from "react";
import { OptionRow } from "./SalaryConditionDrawer";
import EducationForm from "@/pages/Spec/components/EducationForm";
import {
  currentYearMonth,
  isValidGrade,
  isValidYearMonth,
} from "@/pages/Spec/utils/specValidation";
import { toSalaryAcademicAbility } from "@/apis/salarySimulation";
import { mockSpecFormOptions } from "@/mocks/spec";
import type { SalaryCondition, SalaryConditionOption } from "@/types/salary";
import type { Education } from "@/types/spec/education";

type Props = {
  condition: SalaryCondition;
  currentBachelor: Education | null;
  bachelorCount: number;
  hasGraduateDegree: boolean;
  selected: SalaryConditionOption[];
  onClose: () => void;
  onApply: (options: SalaryConditionOption[]) => void;
};

const emptyMaster: Education = {
  localId: 0,
  academicAbilityId: null,
  type: "GRADUATE_SCHOOL_MASTER",
  status: "",
  location: "",
  universityGrade: "",
  universityStandardGrade: "",
  graduatedYearMonth: "",
  majorAffiliation: "",
  majorId: null,
  majorName: "",
};

export default function SalaryAcademicDrawer({
  condition,
  selected,
  currentBachelor,
  bachelorCount,
  hasGraduateDegree,
  onClose,
  onApply,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [choice, setChoice] = useState(selected[0]?.optionValue ?? "");
  const [targetGrade, setTargetGrade] = useState(
    String(selected[0]?.changes.academic?.universityGrade ?? 4)
  );
  const [master, setMaster] = useState<Education>(() => {
    const details = selected[0]?.changes.academic?.details;

    return details
      ? {
          ...emptyMaster,
          type: details.type,
          status: details.status,
          location: details.location,
          universityGrade: details.universityGrade?.toString() ?? "",
          universityStandardGrade:
            details.universityStandardGrade?.toString() ?? "",
          graduatedYearMonth: details.graduatedYearMonth ?? "",
          majorAffiliation: details.majorAffiliation ?? "",
          majorId: details.majorId,
          majorName: selected[0]?.changes.academic?.majorName ?? "",
        }
      : { ...emptyMaster };
  });

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

  const currentGrade = currentBachelor?.universityGrade
    ? Number(currentBachelor.universityGrade)
    : null;
  const gradeScale = currentBachelor?.universityStandardGrade
    ? Number(currentBachelor.universityStandardGrade)
    : null;
  const grade = targetGrade.trim() === "" ? NaN : Number(targetGrade);

  const validGrade =
    bachelorCount === 1 &&
    currentGrade !== null &&
    Number.isFinite(currentGrade) &&
    gradeScale !== null &&
    Number.isFinite(gradeScale) &&
    Number.isFinite(grade) &&
    grade > currentGrade &&
    grade <= gradeScale;

  const validMaster =
    master.type === "GRADUATE_SCHOOL_MASTER" &&
    mockSpecFormOptions.academicStatuses.some(
      (item) => item.value === master.status
    ) &&
    mockSpecFormOptions.schoolLocations.some(
      (item) => item.code === master.location
    ) &&
    mockSpecFormOptions.majorFields.some(
      (item) => item.value === master.majorAffiliation
    ) &&
    !!master.majorName.trim() &&
    (!master.graduatedYearMonth ||
      isValidYearMonth(master.graduatedYearMonth)) &&
    (master.status !== "GRADUATED" ||
      !master.graduatedYearMonth ||
      master.graduatedYearMonth <= currentYearMonth()) &&
    (!master.universityGrade ||
      (mockSpecFormOptions.gradeScales.includes(
        master.universityStandardGrade
      ) &&
        isValidGrade(master.universityGrade, master.universityStandardGrade)));

  const isMaster = choice === "GRADUATE_SCHOOL";
  const canApply =
    choice === "UNIVERSITY_GRADE"
      ? validGrade
      : !isMaster || (!!currentBachelor && !hasGraduateDegree && validMaster);

  const apply = () => {
    if (!canApply) return;

    if (!choice) {
      onApply([]);
      return;
    }

    const option = condition.options.find(
      (item) => item.optionValue === choice
    );
    if (!option) return;

    if (choice === "UNIVERSITY_GRADE") {
      onApply([
        {
          ...option,
          summary: `학점 ${grade}로 상향`,
          changes: {
            academic: {
              type: "UNIVERSITY",
              universityGrade: grade,
            },
          },
        },
      ]);
      return;
    }

    if (isMaster) {
      const details = toSalaryAcademicAbility(master);
      if (!details) return;

      onApply([
        {
          ...option,
          changes: {
            academic: {
              type: "GRADUATE_SCHOOL",
              details,
              majorName: master.majorName,
            },
          },
        },
      ]);
      return;
    }

    onApply([option]);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="salary-academic-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-y-0 right-0 left-auto m-0 h-[calc(100dvh/var(--page-zoom,1))] max-h-none w-full max-w-[411px] overflow-hidden border-l border-border/90 bg-bg-page p-0 text-text-primary shadow-xl backdrop:bg-text-primary/30"
    >
      <div className="flex h-full flex-col">
        <header className="flex min-h-[109px] shrink-0 items-start justify-between border-b border-border/90 px-[25px] pt-8 pb-5">
          <div>
            <p className="text-[10px] font-bold text-brand-strong">조건 변경</p>
            <h2
              id="salary-academic-title"
              className="mt-2 text-[20px] font-medium"
            >
              학력
            </h2>
          </div>
          <button
            type="button"
            aria-label="학력 조건 닫기"
            onClick={onClose}
            className="grid size-8 cursor-pointer place-items-center text-[22px] text-text-muted"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-[25px] py-6">
          <p className="mb-5 text-[12px] leading-4 text-text-secondary">
            변경할 조건을 선택해 주세요.
          </p>

          {choice === "UNIVERSITY_GRADE" && (
            <div className="mb-4">
              <label className="block text-[12px] font-medium">
                목표 학점
                <input
                  type="number"
                  min={0}
                  max={gradeScale ?? undefined}
                  step="0.01"
                  value={targetGrade}
                  onChange={(event) => setTargetGrade(event.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-brand"
                />
              </label>
              <p className="mt-2 text-[11px] text-text-muted">
                {bachelorCount === 1 &&
                currentGrade !== null &&
                gradeScale !== null
                  ? `현재 ${currentGrade} / ${gradeScale} · 현재보다 높은 학점을 입력해 주세요.`
                  : "학점 상향에는 현재 학사 정보와 학점·만점이 필요해요."}
              </p>
            </div>
          )}

          <fieldset className="border-t border-border-strong/80">
            <legend className="sr-only">학력 조건 선택</legend>
            {[
              { optionValue: "", label: "현재 학력 유지" },
              ...condition.options,
            ].map((option) => (
              <OptionRow
                key={option.optionValue}
                label={
                  option.optionValue === "UNIVERSITY_GRADE"
                    ? "학점 상향"
                    : option.label
                }
                type="radio"
                checked={choice === option.optionValue}
                onChange={() => setChoice(option.optionValue)}
              />
            ))}
          </fieldset>

          {isMaster && !currentBachelor && (
            <p role="alert" className="mt-4 text-[12px] text-red-500">
              석사 진학 목표에는 학사 정보가 필요해요.
            </p>
          )}

          {isMaster && hasGraduateDegree && (
            <p role="alert" className="mt-4 text-[12px] text-red-500">
              이미 대학원 학력이 등록되어 있어 석사 목표를 중복 추가할 수
              없어요.
            </p>
          )}

          {isMaster && currentBachelor && !hasGraduateDegree && (
            <div className="mt-5">
              <p className="mb-3 text-[12px] text-text-secondary">
                석사 과정의 목표 학력 정보를 입력해 주세요.
              </p>
              <EducationForm
                value={master}
                options={{
                  ...mockSpecFormOptions,
                  degreeTypes: mockSpecFormOptions.degreeTypes.filter(
                    (item) => item.value === "GRADUATE_SCHOOL_MASTER"
                  ),
                }}
                canSave={canApply}
                onChange={(update) =>
                  setMaster((previous) => ({ ...previous, ...update }))
                }
                onSave={apply}
                onCancel={() => setChoice("")}
                showActions={false}
              />
              <p className="mt-3 text-[11px] leading-5 text-text-muted">
                학사 졸업 후 석사 진학을 가정한 목표예요. 기존 학사 정보는
                유지됩니다.
              </p>
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-border/90 px-[25px] py-[17px]">
          <button
            type="button"
            onClick={apply}
            disabled={!canApply}
            className="min-h-[46px] w-full cursor-pointer rounded-[9px] bg-text-primary px-4 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            조건 적용
          </button>
        </footer>
      </div>
    </dialog>
  );
}
