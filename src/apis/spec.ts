import { specFormOptions } from "@/constants/specFormOptions";
import type { BasicInfo, SpecFormOptions } from "@/types/spec/profile";
import type { Education } from "@/types/spec/education";
import type { Certificate, LanguageScore } from "@/types/spec/qualification";
import type { Experience } from "@/types/spec/experience";
import type { ApiResponse, SpecReadData } from "@/types/spec/api";
import { getLanguageExams } from "@/apis/specSearch";

/** UI Draft: Mock 검색명/로컬 ID가 포함되므로 서버 PUT DTO와 다름. */
export type SpecProfileDraft = {
  basicInfo: BasicInfo;
  educations: Education[];
  certificates: Certificate[];
  languageScores: LanguageScore[];
  experiences: Experience[];
};

const key = (email: string) =>
  `lifelog:spec:mock:${email.trim().toLowerCase()}`;

export async function getSpecFormOptions(
  accessToken: string
): Promise<SpecFormOptions> {
  const apiBaseUrl: string | undefined = import.meta.env.VITE_API_BASE_URL;
  const baseUrl = apiBaseUrl?.trim().replace(/\/+$/, "") ?? "";
  const options = structuredClone(specFormOptions);

  if (!baseUrl) return options;

  const response = await fetch(`${baseUrl}/api/residential-areas`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`거주 지역 조회 실패 (HTTP ${response.status})`);
  }

  const body: ApiResponse<Pick<SpecFormOptions, "residentialAreas">> =
    await response.json();

  if (!body.success || !Array.isArray(body.data?.residentialAreas)) {
    throw new Error("거주 지역 응답이 올바르지 않습니다.");
  }

  return {
    ...options,
    residentialAreas: body.data.residentialAreas,
  };
}

export async function saveSpecProfileMock(
  profile: SpecProfileDraft,
  email: string
): Promise<void> {
  // 실API의 JWT 회원 소유권을 Mock에서는 이메일별 저장소로 대체.
  // 저장 실패를 성공으로 처리하지 않도록 예외 전파.
  sessionStorage.setItem(key(email), JSON.stringify(profile));
}

export function getSavedSpecProfileMock(
  email: string
): SpecProfileDraft | null {
  try {
    const raw = sessionStorage.getItem(key(email));
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    if (
      !("basicInfo" in data) ||
      !data.basicInfo ||
      typeof data.basicInfo !== "object"
    )
      return null;
    if (
      !("educations" in data) ||
      !Array.isArray(data.educations) ||
      !("certificates" in data) ||
      !Array.isArray(data.certificates) ||
      !("languageScores" in data) ||
      !Array.isArray(data.languageScores) ||
      !("experiences" in data) ||
      !Array.isArray(data.experiences)
    )
      return null;
    return data as SpecProfileDraft;
  } catch {
    return null;
  }
}

export async function getSpecProfile(
  accessToken: string
): Promise<SpecProfileDraft> {
  const apiBaseUrl: string | undefined = import.meta.env.VITE_API_BASE_URL;
  const baseUrl = apiBaseUrl?.trim().replace(/\/+$/, "");

  if (!baseUrl) {
    throw new Error("API 기본 주소가 설정되지 않았습니다.");
  }

  if (!accessToken.trim()) {
    throw new Error("스펙 조회에 필요한 인증 토큰이 없습니다.");
  }

  const response = await fetch(`${baseUrl}/api/spec-profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`스펙 조회 실패 (HTTP ${response.status})`);
  }

  const body: ApiResponse<SpecReadData> = await response.json();

  if (
    body.success !== true ||
    !body.data ||
    body.data.type !== "CURRENT" ||
    !Array.isArray(body.data.academicAbilities) ||
    !Array.isArray(body.data.certificates) ||
    !Array.isArray(body.data.languageExamScores) ||
    !Array.isArray(body.data.experiences)
  ) {
    throw new Error("스펙 조회 응답이 올바르지 않습니다.");
  }

  const data = body.data;

  // 프로필 응답에는 scoreType이 없어 시험 기준 목록과 ID로 연결한다.
  const languageExams = data.languageExamScores.length
    ? (await getLanguageExams()).languageExams
    : [];

  return {
    basicInfo: {
      birthYear: data.birthYear === null ? "" : String(data.birthYear),
      residenceRegion: data.residenceRegion ?? "",
      jobId: data.jobId,
      jobName: data.desiredJobName ?? "",
    },
    educations: data.academicAbilities.map((item, index) => ({
      localId: index + 1,
      academicAbilityId: item.academicAbilityId,
      type: item.type,
      status: item.status,
      location: item.location,
      universityGrade:
        item.universityGrade === null ? "" : String(item.universityGrade),
      universityStandardGrade:
        item.universityStandardGrade === null
          ? ""
          : String(item.universityStandardGrade),
      graduatedYearMonth: item.graduatedYearMonth ?? "",
      majorAffiliation: item.majorAffiliation ?? "",
      majorId: item.majorId,
      majorName: item.majorName ?? "",
    })),
    certificates: data.certificates.map((item, index) => ({
      localId: index + 1,
      specProfileCertificateId: item.specProfileCertificateId,
      certificateId: item.certificateId,
      certificateName: item.certificateName,
      acquiredYearMonth: item.acquiredYearMonth ?? "",
    })),
    languageScores: data.languageExamScores.map((item, index) => ({
      localId: index + 1,
      languageExamScoreId: item.languageExamScoreId,
      languageExamId: item.languageExamId,
      languageExamName: item.languageExamName,
      scoreType:
        languageExams.find(
          (exam) => exam.languageExamId === item.languageExamId
        )?.scoreType ?? "",
      scoreNumeric: item.scoreNumeric === null ? "" : String(item.scoreNumeric),
      scoreGrade: item.scoreGrade ?? "",
      acquiredYearMonth: item.acquiredYearMonth ?? "",
      expiresYearMonth: item.expiresYearMonth ?? "",
    })),
    experiences: data.experiences.map((item, index) => ({
      localId: index + 1,
      experienceId: item.experienceId,
      type: item.type,
      title: item.title,
      startedYearMonth: item.startedYearMonth ?? "",
      endedYearMonth: item.endedYearMonth ?? "",
      description: item.description ?? "",
      awarded: item.awarded,
      organizerName: item.organizerName ?? "",
      awardGrade: item.awardGrade ?? "",
    })),
  };
}
