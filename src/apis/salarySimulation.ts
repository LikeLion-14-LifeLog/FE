import type { SalaryChanges, SalaryConditionOption } from "@/types/salary";
import type {
  SalaryCompanyScale,
  SalarySimulationRequest,
} from "@/types/salaryApi";

export function buildSalaryChanges(
  options: SalaryConditionOption[]
): SalaryChanges {
  const changes: SalaryChanges = {};
  const certificateIds = new Set<number>();

  for (const { changes: optionChanges } of options) {
    Object.assign(changes, optionChanges);

    for (const id of optionChanges.addCertificateIds ?? []) {
      certificateIds.add(id);
    }
  }

  if (certificateIds.size > 0) {
    changes.addCertificateIds = [...certificateIds];
  }

  return changes;
}

export function sameSalaryChanges(left: SalaryChanges, right: SalaryChanges) {
  const leftIds = new Set(left.addCertificateIds);
  const rightIds = new Set(right.addCertificateIds);

  return (
    leftIds.size === rightIds.size &&
    [...leftIds].every((id) => rightIds.has(id)) &&
    left.experience?.type === right.experience?.type &&
    left.experience?.durationMonths === right.experience?.durationMonths &&
    left.languageScore?.languageExamId ===
      right.languageScore?.languageExamId &&
    left.languageScore?.scoreNumeric === right.languageScore?.scoreNumeric &&
    left.languageScore?.scoreGrade === right.languageScore?.scoreGrade &&
    left.academic?.type === right.academic?.type &&
    left.academic?.universityGrade === right.academic?.universityGrade &&
    JSON.stringify(left.experiences ?? []) ===
      JSON.stringify(right.experiences ?? [])
  );
}

export function buildSalarySimulationRequest(
  changes: SalaryChanges,
  companyGroupScale: SalaryCompanyScale,
  baseSpecProfileId: number
): SalarySimulationRequest | null {
  if (
    changes.experience ||
    changes.addCertificateIds?.length ||
    changes.languageScore ||
    changes.academic
  ) {
    return null;
  }

  return {
    baseSpecProfileId,
    companyGroupScale,
    changes: changes.experiences?.length
      ? { experiences: changes.experiences }
      : null,
  };
}
