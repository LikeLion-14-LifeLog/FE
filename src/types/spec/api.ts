/** 서버 PUT /api/spec-profile/temporary 요청 DTO. UI localId/표시명 제외. */
export type SpecSaveRequest = {
  birthYear: number;
  residenceRegion: string;
  jobId: number;
  academicAbilities: Array<{
    academicAbilityId?: number;
    type: string;
    status: string;
    location: string;
    universityGrade: number | null;
    universityStandardGrade: number | null;
    graduatedYearMonth: string;
    majorAffiliation: string;
    majorId: number;
  }>;
  certificates: Array<{
    specProfileCertificateId?: number;
    certificateId: number;
    acquiredYearMonth: string;
  }>;
  languageExamScores: Array<{
    languageExamScoreId?: number;
    languageExamId: number;
    scoreNumeric: number | null;
    scoreGrade: string | null;
    acquiredYearMonth: string;
    expiresYearMonth: string | null;
  }>;
  experiences: Array<{
    experienceId?: number;
    type: string;
    title: string;
    startedYearMonth: string;
    endedYearMonth: string | null;
    description: string | null;
    awarded: boolean;
    organizerName: string | null;
    awardGrade: string | null;
  }>;
};

/** GET /api/spec-profile의 저장된 항목은 서버 PK와 표시명을 함께 반환. */
export type SpecReadData = {
  specProfileId: number;
  type: "CURRENT";
  birthYear: number | null;
  residenceRegion: string | null;
  desiredJobId: number | null;
  jobId: number | null;
  desiredJobName: string | null;
  academicAbilities: Array<{
    academicAbilityId: number;
    type: string;
    status: string;
    location: string;
    universityGrade: number | null;
    universityStandardGrade: number | null;
    graduatedYearMonth: string | null;
    majorAffiliation: string | null;
    majorId: number | null;
    majorName: string | null;
  }>;
  certificates: Array<{
    specProfileCertificateId: number;
    certificateId: number;
    certificateName: string;
    acquiredYearMonth: string | null;
  }>;
  languageExamScores: Array<{
    languageExamScoreId: number;
    languageExamId: number;
    languageExamName: string;
    scoreNumeric: number | null;
    scoreGrade: string | null;
    acquiredYearMonth: string | null;
    expiresYearMonth: string | null;
  }>;
  experiences: Array<{
    experienceId: number;
    type: string;
    title: string;
    startedYearMonth: string | null;
    endedYearMonth: string | null;
    description: string | null;
    awarded: boolean;
    organizerName: string | null;
    awardGrade: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};