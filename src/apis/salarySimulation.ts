import {
  baseSalaryExample,
  salaryNotice,
  startingSalaryExamples,
} from "@/mocks/salarySimulation";
import type { SalaryConditionOption } from "@/types/salary";

type SalaryChanges = SalaryConditionOption["changes"];

export function buildSalaryChanges(
  options: SalaryConditionOption[],
): SalaryChanges {
  const changes: SalaryChanges = {};
  const certificateIds = new Set<number>();

  for (const { changes: option } of options) {
    if (option.experience) changes.experience = option.experience;
    if (option.languageScore) changes.languageScore = option.languageScore;
    if (option.academic) changes.academic = option.academic;

    for (const id of option.addCertificateIds ?? []) {
      certificateIds.add(id);
    }
  }

  if (certificateIds.size > 0) {
    changes.addCertificateIds = [...certificateIds];
  }

  return changes;
}

export function getSalarySimulationMock(
  companyGroup: "" | "LARGE",
  changes: SalaryChanges,
) {
  const example = startingSalaryExamples.find(({ changes: candidate }) => {
    const ids = changes.addCertificateIds ?? [];
    const candidateIds = candidate.addCertificateIds ?? [];

    return (
      ids.length === candidateIds.length &&
      candidateIds.every((id) => ids.includes(id)) &&
      changes.experience?.type === candidate.experience?.type &&
      changes.experience?.durationMonths === candidate.experience?.durationMonths &&
      changes.academic?.type === candidate.academic?.type &&
      changes.academic?.universityGrade === candidate.academic?.universityGrade &&
      !changes.languageScore
    );
  });

  return {
    base: baseSalaryExample,
    startingSalary:
      companyGroup === "LARGE" && example
        ? { incomeExpected: example.incomeExpected, delta: example.delta }
        : null,
    notice: salaryNotice,
  };
}