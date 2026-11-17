import type { SalaryExperience } from "./salaryApi";

export type SalaryConditionField =
  "EXPERIENCE" | "CERTIFICATE" | "LANGUAGE" | "ACADEMIC";

export type SalaryChanges = {
  experience?: {
    type: "INTERNSHIP" | "TRAINING";
    durationMonths: number;
  } | null;
  experiences?: SalaryExperience[];
  addCertificateIds?: number[];
  languageScore?: {
    languageExamId: number;
    scoreNumeric: number | null;
    scoreGrade: string | null;
  };
  academic?: {
    type: "UNIVERSITY" | "GRADUATE_SCHOOL";
    universityGrade?: number;
  };
};

export type SalaryConditionOption = {
  optionValue: string;
  label: string;
  summary?: string;
  description?: string;
  keywords?: string[];
  changes: SalaryChanges;
};

export type SalaryCondition = {
  field: SalaryConditionField;
  label: string;
  defaultSummary: string;
  options: SalaryConditionOption[];
};

export type SalaryComparisonOption = {
  optionKey: string;
  title: string;
  incomeExpected: number;
  delta: number;
  prepPeriod: string;
  estimatedCost: number;
  costNote: string;
  fitDescription: string;
  changes: SalaryChanges;
};

export type SalaryComparison = {
  options: SalaryComparisonOption[];
  basis: string;
  notice: string;
};
