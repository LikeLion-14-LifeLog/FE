import type {
  DiagnosisResult,
  MockDiagnosisResult,
  SalaryResult,
  ComparisonGroup,
} from "@/types/diagnosis";

export type DiagnosisView = {
  salaryResults: SalaryResult[];
  comparisonGroup: ComparisonGroup;
  recommendation: string;
  salaryNotice: string;
  specRows: { label: string; value: string }[];
};

const degreeNames: Record<string, string> = {
  HIGH_SCHOOL: "고등학교",
  COLLEGE: "전문학사",
  UNIVERSITY: "학사",
  GRADUATE_SCHOOL_MASTER: "석사",
  GRADUATE_SCHOOL_DOCTORAL: "박사",
};

/** 현재 Mock의 UI Draft를 결과 화면에 맞게 변환한다. */
export function fromMockDiagnosis(result: MockDiagnosisResult): DiagnosisView {
  const { educations, certificates, languageScores } = result.appliedSpecs;
  return {
    ...result,
    specRows: [
      {
        label: "학력",
        value: educations.map((item) =>
          `${degreeNames[item.type] ?? item.type} · ${item.majorName || "전공 미입력"}`,
        ).join(", "),
      },
      {
        label: "학점",
        value: educations.filter((item) =>
          item.universityGrade && item.universityStandardGrade,
        ).map((item) =>
          `${item.universityGrade} / ${item.universityStandardGrade}`,
        ).join(", "),
      },
      { label: "자격", value: certificates.map((item) => item.certificateName).join(", ") },
      {
        label: "어학",
        value: languageScores.map((item) =>
          `${item.languageExamName} ${[item.scoreNumeric, item.scoreGrade].filter(Boolean).join(" ")}`.trim(),
        ).join(", "),
      },
    ],
  };
}

/** GET /analyzation/runs/{runId}의 완료 result를 동일한 화면 모델로 변환한다. */
export function fromApiDiagnosis(result: DiagnosisResult): DiagnosisView {
  const { academicAbilities, certificates, languageExamScores } = result.appliedSpecs;
  return {
    ...result,
    specRows: [
      {
        label: "학력",
        value: academicAbilities.map((item) =>
          `${degreeNames[item.type] ?? item.type} · ${item.majorName || "전공 미입력"}`,
        ).join(", "),
      },
      {
        label: "학점",
        value: academicAbilities.filter((item) =>
          item.universityGrade !== null && item.universityStandardGrade !== null,
        ).map((item) =>
          `${item.universityGrade} / ${item.universityStandardGrade}`,
        ).join(", "),
      },
      { label: "자격", value: certificates.map((item) => item.certificateName).join(", ") },
      {
        label: "어학",
        value: languageExamScores.map((item) =>
          `${item.languageExamName} ${[item.scoreNumeric, item.scoreGrade].filter((value) => value !== null && value !== "").join(" ")}`.trim(),
        ).join(", "),
      },
    ],
  };
}