import { specFormOptions } from "@/constants/specFormOptions";
import { apiClient } from "@/apis/client";
import type { BasicInfo, SpecFormOptions } from "@/types/spec/profile";
import type { Education } from "@/types/spec/education";
import type { Certificate, LanguageScore } from "@/types/spec/qualification";
import type { Experience } from "@/types/spec/experience";
import type {
  ApiResponse,
  SpecReadData,
  SpecSaveRequest,
} from "@/types/spec/api";
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

function requireId(value: number | null, label: string): number {
  if (value === null || !Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${label} 항목을 검색 목록에서 다시 선택해 주세요.`);
  }

  return value;
}

function optionalId(value: number | null): number | undefined {
  if (value === null) return undefined;

  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error("저장된 항목의 식별자가 올바르지 않습니다.");
  }

  return value;
}

function toSpecSaveRequest(profile: SpecProfileDraft): SpecSaveRequest {
  const { basicInfo, educations, certificates, languageScores, experiences } =
    profile;

  return {
    birthYear: Number(basicInfo.birthYear),
    residenceRegion: basicInfo.residenceRegion,
    jobId: requireId(basicInfo.jobId, "희망 직무"),
    academicAbilities: educations.map((item) => ({
      academicAbilityId: optionalId(item.academicAbilityId),
      type: item.type,
      status: item.status,
      location: item.location,
      universityGrade:
        item.universityGrade.trim() === ""
          ? null
          : Number(item.universityGrade),
      universityStandardGrade:
        item.universityStandardGrade.trim() === ""
          ? null
          : Number(item.universityStandardGrade),
      graduatedYearMonth: item.graduatedYearMonth,
      majorAffiliation: item.majorAffiliation,
      majorId: requireId(item.majorId, "전공"),
    })),
    certificates: certificates.map((item) => ({
      specProfileCertificateId: optionalId(item.specProfileCertificateId),
      certificateId: requireId(item.certificateId, "자격증"),
      acquiredYearMonth: item.acquiredYearMonth,
    })),
    languageExamScores: languageScores.map((item) => ({
      languageExamScoreId: optionalId(item.languageExamScoreId),
      languageExamId: requireId(item.languageExamId, "어학시험"),
      scoreNumeric:
        item.scoreNumeric.trim() === "" ? null : Number(item.scoreNumeric),
      scoreGrade: item.scoreGrade.trim() || null,
      acquiredYearMonth: item.acquiredYearMonth,
      expiresYearMonth: item.expiresYearMonth || null,
    })),
    experiences: experiences.map((item) => ({
      experienceId: optionalId(item.experienceId),
      type: item.type,
      title: item.title.trim(),
      startedYearMonth: item.startedYearMonth,
      endedYearMonth: item.endedYearMonth || null,
      description: item.description.trim() || null,
      awarded: item.awarded,
      organizerName: item.awarded ? item.organizerName.trim() : null,
      awardGrade: item.awarded ? item.awardGrade.trim() : null,
    })),
  };
}

export async function saveSpecProfile(
  profile: SpecProfileDraft,
  accessToken: string
): Promise<void> {
  const apiBaseUrl: string | undefined = import.meta.env.VITE_API_BASE_URL;
  const baseUrl = apiBaseUrl?.trim().replace(/\/+$/, "");

  if (!baseUrl) {
    throw new Error("API 기본 주소가 설정되지 않았습니다.");
  }

  if (!accessToken.trim()) {
    throw new Error("스펙 저장에 필요한 인증 토큰이 없습니다.");
  }

  const request = toSpecSaveRequest(profile);

  const response = await fetch(`${baseUrl}/api/spec-profile/temporary`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`스펙 저장 실패 (HTTP ${response.status})`);
  }

  const body: ApiResponse<null> = await response.json();

  if (body.success !== true) {
    throw new Error(body.message || "스펙 저장에 실패했습니다.");
  }
}

/** 현재 회원의 CURRENT 스펙 ID를 시뮬레이션 요청에 사용한다. */
export async function getCurrentSpecProfileId(): Promise<number> {
  const { data: response } = await apiClient.get<ApiResponse<SpecReadData>>(
    "/api/spec-profile",
  );
  const profile = response.data;
  if (
    !response.success ||
    profile?.type !== "CURRENT" ||
    !Number.isSafeInteger(profile.specProfileId) ||
    profile.specProfileId <= 0
  ) {
    throw new Error("현재 스펙 정보를 확인할 수 없습니다.");
  }
  return profile.specProfileId;
}
