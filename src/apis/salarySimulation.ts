import type { SalaryChanges, SalaryConditionOption } from "@/types/salary";
import type {
  SalaryApiChanges,
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
  // 기존 학력 선택지는 필수 API 필드가 부족하므로 임의로 채우지 않는다.
  if (changes.experience || changes.academic) return null;

  const apiChanges: SalaryApiChanges = {};

  if (changes.experiences?.length) {
    apiChanges.experiences = changes.experiences;
  }

  if (changes.addCertificateIds?.length) {
    apiChanges.certificates = [...new Set(changes.addCertificateIds)]
      .sort((a, b) => a - b)
      .map((certificateId) => ({ certificateId, acquiredYearMonth: null }));
  }

  if (changes.languageScore) {
    apiChanges.languageExamScores = [
      {
        ...changes.languageScore,
        acquiredYearMonth: null,
        expiresYearMonth: null,
      },
    ];
  }

  return {
    baseSpecProfileId,
    companyGroupScale,
    changes: Object.keys(apiChanges).length ? apiChanges : null,
  };
}
