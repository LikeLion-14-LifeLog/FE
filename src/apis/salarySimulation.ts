import {
  salaryComparisonExample,
  salarySimulationExample,
} from "@/mocks/salarySimulation";
import type { SalaryChanges, SalaryConditionOption } from "@/types/salary";

const salaryOptionPreviews: { changes: SalaryChanges; delta: number }[] = [
  ...salaryComparisonExample.options,
  {
    changes: { experience: { type: "TRAINING", durationMonths: 3 } },
    delta: 3_000_000,
  },
  {
    changes: { addCertificateIds: [1034] },
    delta: 1_500_000,
  },
  {
    changes: { addCertificateIds: [783] },
    delta: 2_500_000,
  },
];

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

function getStartingSalaryPreview(changes: SalaryChanges, baseSalary: number) {
  const parts: SalaryChanges[] = [];

  if (changes.experience) parts.push({ experience: changes.experience });
  if (changes.languageScore)
    parts.push({ languageScore: changes.languageScore });
  if (changes.academic) parts.push({ academic: changes.academic });

  for (const id of new Set(changes.addCertificateIds)) {
    parts.push({ addCertificateIds: [id] });
  }

  if (parts.length === 0) return null;

  let delta = 0;

  for (const part of parts) {
    const preview = salaryOptionPreviews.find((option) =>
      sameSalaryChanges(option.changes, part)
    );

    if (!preview) return null;
    delta += preview.delta;
  }

  return {
    incomeExpected: baseSalary + delta,
    delta,
    combined: parts.length > 1,
  };
}

export function getSalarySimulationMock(changes: SalaryChanges) {
  const baseSalary = salarySimulationExample.base.find(
    ({ annual }) => annual === 0
  )?.incomeExpected;

  return {
    ...salarySimulationExample,
    startingSalary:
      baseSalary === undefined
        ? null
        : getStartingSalaryPreview(changes, baseSalary),
  };
}
