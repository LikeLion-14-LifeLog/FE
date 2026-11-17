import type { SalaryCondition } from "@/types/salary";

export const salaryConditions: SalaryCondition[] = [
  {
    field: "EXPERIENCE",
    label: "직무 경험",
    defaultSummary: "없음",
    options: [],
  },
  {
    field: "CERTIFICATE",
    label: "자격증",
    defaultSummary: "현재 자격증 유지",
    options: [
      {
        optionValue: "1021",
        label: "AWS SAA",
        description: "클라우드 직무 역량",
        keywords: ["AWS Solutions Architect (Associate)"],
        changes: { addCertificateIds: [1021] },
      },
      {
        optionValue: "1034",
        label: "SQL 개발자 (SQLD / SQLP)",
        description: "데이터 직무 역량",
        keywords: ["SQLD", "SQLP", "SQL 개발자(SQLD)", "SQL 개발자"],
        changes: { addCertificateIds: [1034] },
      },
      {
        optionValue: "783",
        label: "정보보안기사",
        description: "직무 관련 자격",
        changes: { addCertificateIds: [783] },
      },
    ],
  },
  {
    field: "LANGUAGE",
    label: "어학",
    defaultSummary: "현재 수준 유지",
    options: [
      {
        optionValue: "TOEIC_930",
        label: "TOEIC 930점",
        changes: {
          languageScore: {
            languageExamId: 1,
            scoreNumeric: 930,
            scoreGrade: null,
          },
        },
      },
      {
        optionValue: "OPIC_IH",
        label: "OPIc IH",
        changes: {
          languageScore: {
            languageExamId: 7,
            scoreNumeric: null,
            scoreGrade: "IH",
          },
        },
      },
    ],
  },
  {
    field: "ACADEMIC",
    label: "학력",
    defaultSummary: "진학 안 함",
    options: [
      {
        optionValue: "UNIVERSITY_GRADE",
        label: "학점 4.0으로 상향",
        changes: { academic: { type: "UNIVERSITY", universityGrade: 4 } },
      },
      {
        optionValue: "GRADUATE_SCHOOL",
        label: "석사 과정",
        changes: { academic: { type: "GRADUATE_SCHOOL" } },
      },
    ],
  },
];
