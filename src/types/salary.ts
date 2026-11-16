export type SalaryConditionField =
  | "EXPERIENCE"
  | "CERTIFICATE"
  | "LANGUAGE"
  | "ACADEMIC";

type SalaryConditionChanges = {
  experience?: {
    type: "INTERNSHIP" | "TRAINING";
    durationMonths: number;
  };
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
  changes: SalaryConditionChanges;
};

export type SalaryCondition = {
  field: SalaryConditionField;
  label: string;
  defaultSummary: string;
  options: SalaryConditionOption[];
};