import type { ApiResponse } from "@/types/spec/api";

export type SalaryCompanyScale = "SMALL" | "LARGE" | null;

export type SalaryAcademicAbility = {
  type:
    | "HIGH_SCHOOL"
    | "COLLEGE"
    | "UNIVERSITY"
    | "GRADUATE_SCHOOL_MASTER"
    | "GRADUATE_SCHOOL_DOCTORAL";
  status:
    | "ATTENDING"
    | "LEAVE_FROM_SCHOOL"
    | "GRADUATE_POSTPONED"
    | "GRADUATED";
  location:
    | "SEOUL"
    | "BUSAN"
    | "DAEGU"
    | "INCHEON"
    | "GWANGJU"
    | "DAEJEON"
    | "ULSAN"
    | "SEJONG"
    | "GYEONGGI"
    | "GANGWON"
    | "CHUNGBUK"
    | "CHUNGNAM"
    | "JEONBUK"
    | "JEONNAM"
    | "GYEONGBUK"
    | "GYEONGNAM"
    | "JEJU";
  universityGrade: number | null;
  universityStandardGrade: number | null;
  graduatedYearMonth: string | null;
  majorAffiliation:
    | "HUMANITIES"
    | "SOCIAL_SCIENCES"
    | "NATURAL_SCIENCES"
    | "ENGINEERING"
    | "MEDICINE_PHARMACY"
    | "EDUCATION"
    | "ARTS_PHYSICAL_EDUCATION"
    | null;
  majorId: number | null;
};

export type SalaryCertificate = {
  certificateId: number;
  acquiredYearMonth: string | null;
};

export type SalaryLanguageScore = {
  languageExamId: number;
  scoreNumeric: number | null;
  scoreGrade: string | null;
  acquiredYearMonth: string | null;
  expiresYearMonth: string | null;
};

export type SalaryExperience = {
  type:
    | "INTERNSHIP"
    | "PROJECT"
    | "CONTEST"
    | "PRACTICUM"
    | "CLUB"
    | "OTHER";
  title: string;
  startedYearMonth: string;
  endedYearMonth: string | null;
  description: string | null;
  awarded: boolean;
  organizerName: string | null;
  awardGrade: string | null;
};

export type SalaryApiChanges = {
  academicAbilities?: SalaryAcademicAbility[];
  certificates?: SalaryCertificate[];
  languageExamScores?: SalaryLanguageScore[];
  experiences?: SalaryExperience[];
};

export type SalarySimulationRequest = {
  baseSpecProfileId: number;
  companyGroupScale?: SalaryCompanyScale;
  changes?: SalaryApiChanges | null;
};

export type SalaryTargetSaveRequest = SalarySimulationRequest;

export type SalaryResult = {
  annual: 0 | 3 | 5;
  annualIncomeMin: number;
  annualIncomeExpected: number;
  annualIncomeMax: number;
  topPercent: number | null;
};

export type SalarySimulationData = {
  baseSpecProfileId: number;
  companyGroupScale: SalaryCompanyScale;
  base: {
    salaryResults: SalaryResult[];
  };
  simulated: {
    salaryResults: SalaryResult[];
  } | null;
  preparationPeriod: string | null;
  estimatedCost: string | null;
  decisionCriteria: string | null;
};

export type SalarySimulationResponse = ApiResponse<SalarySimulationData>;

export type SalaryTargetOption = {
  slotNumber: 1 | 2 | 3;
  targetSpecProfileId: number;
  source: "USER_INPUT" | "AI_RECOMMENDATION";
  selected: boolean;
  title: string;
  expectedStartingSalary: number;
  salaryIncreaseAmount: number;
  preparationPeriod: string;
  estimatedCost: string;
  decisionCriteria: string;
};

export type SalaryTargetSaveData = {
  baseSpecProfileId: number;
  companyGroupScale: SalaryCompanyScale;
  currency: "KRW";
  baseExpectedStartingSalary: number;
  selectedTargetSpecProfileId: number;
  options: SalaryTargetOption[];
  salaryNotice: string;
  preparationNotice: string;
};

export type SalaryTargetSaveResponse = ApiResponse<SalaryTargetSaveData>;

export type SalaryTargetData = {
  targetSpecProfileId: number;
  baseSpecProfileId: number;
  companyGroupScale: SalaryCompanyScale;
  changes: {
    academicAbilities: (SalaryAcademicAbility & {
      academicAbilityId: number;
      majorName: string | null;
    })[];
    certificates: (SalaryCertificate & {
      specProfileCertificateId: number;
      certificateName: string;
    })[];
    languageExamScores: (SalaryLanguageScore & {
      languageExamScoreId: number;
      languageExamName: string;
    })[];
    experiences: (SalaryExperience & {
      experienceId: number;
    })[];
  };
};

export type SalaryTargetResponse = ApiResponse<SalaryTargetData | null>;