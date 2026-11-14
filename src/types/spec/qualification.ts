export type Certificate = {
  localId: number;
  specProfileCertificateId: number | null;
  certificateId: number | null;
  certificateName: string;
  acquiredYearMonth: string;
};

export type ScoreType =
  | "NUMERIC"
  | "GRADE"
  | "NUMERIC_AND_GRADE"
  | "NONE";

export type LanguageScore = {
  localId: number;
  languageExamScoreId: number | null;
  languageExamId: number | null;
  languageExamName: string;
  scoreType: ScoreType | "";
  scoreNumeric: string;
  scoreGrade: string;
  acquiredYearMonth: string;
  expiresYearMonth: string;
};

export type QualificationDraft =
  | { kind: "certificate"; value: Certificate }
  | { kind: "language"; value: LanguageScore };