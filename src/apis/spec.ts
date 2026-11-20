import { specFormOptions } from "@/constants/specFormOptions";
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

/** 스펙 화면 입력값 → 서버 임시 저장 요청 DTO (선택하지 않은 항목이 있으면 이유와 함께 예외) */
export function toSpecSaveRequest(profile: SpecProfileDraft): SpecSaveRequest {
  const { basicInfo } = profile;
  if (basicInfo.jobId === null)
    throw new Error("희망 직무를 검색해 선택해 주세요.");
  const orNull = (value: string) => (value.trim() ? value.trim() : null);
  const numOrNull = (value: string) =>
    value.trim() === "" ? null : Number(value);

  return {
    birthYear: Number(basicInfo.birthYear),
    residenceRegion: basicInfo.residenceRegion,
    jobId: basicInfo.jobId,
    academicAbilities: profile.educations.map((item) => {
      if (item.majorId === null && item.type !== "HIGH_SCHOOL")
        throw new Error("학력의 전공을 검색해 선택해 주세요.");
      return {
        ...(item.academicAbilityId !== null && {
          academicAbilityId: item.academicAbilityId,
        }),
        type: item.type,
        status: item.status,
        location: item.location,
        universityGrade: numOrNull(item.universityGrade),
        universityStandardGrade: numOrNull(item.universityStandardGrade),
        graduatedYearMonth: orNull(item.graduatedYearMonth) as string,
        majorAffiliation: orNull(item.majorAffiliation) as string,
        majorId: item.majorId as number,
      };
    }),
    certificates: profile.certificates.map((item) => {
      if (item.certificateId === null)
        throw new Error("자격증을 검색해 선택해 주세요.");
      return {
        ...(item.specProfileCertificateId !== null && {
          specProfileCertificateId: item.specProfileCertificateId,
        }),
        certificateId: item.certificateId,
        acquiredYearMonth: orNull(item.acquiredYearMonth) as string,
      };
    }),
    languageExamScores: profile.languageScores.map((item) => {
      if (item.languageExamId === null)
        throw new Error("어학 시험을 검색해 선택해 주세요.");
      return {
        ...(item.languageExamScoreId !== null && {
          languageExamScoreId: item.languageExamScoreId,
        }),
        languageExamId: item.languageExamId,
        scoreNumeric: numOrNull(item.scoreNumeric),
        scoreGrade: orNull(item.scoreGrade),
        acquiredYearMonth: orNull(item.acquiredYearMonth) as string,
        expiresYearMonth: orNull(item.expiresYearMonth),
      };
    }),
    experiences: profile.experiences.map((item) => ({
      ...(item.experienceId !== null && { experienceId: item.experienceId }),
      type: item.type,
      title: item.title.trim(),
      startedYearMonth: item.startedYearMonth,
      endedYearMonth: orNull(item.endedYearMonth),
      description: orNull(item.description),
      awarded: item.awarded,
      organizerName: item.awarded ? orNull(item.organizerName) : null,
      awardGrade: item.awarded ? orNull(item.awardGrade) : null,
    })),
  };
}

/** PUT /api/spec-profile/temporary — 본인 CURRENT 스펙 저장 (서버 메시지를 그대로 예외로) */
export async function saveSpecProfile(
  profile: SpecProfileDraft,
  accessToken: string
): Promise<void> {
  const apiBaseUrl: string | undefined = import.meta.env.VITE_API_BASE_URL;
  const baseUrl = apiBaseUrl?.trim().replace(/\/+$/, "");
  if (!baseUrl) throw new Error("API 기본 주소가 설정되지 않았습니다.");

  const response = await fetch(
    `${baseUrl}/api/spec-profile/temporary`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toSpecSaveRequest(profile)),
    }
  );
  const body = (await response.json().catch(() => null)) as {
    success?: boolean;
    code?: string;
    message?: string;
  } | null;
  if (!response.ok || body?.success === false) {
    // 분석 진행 중(409 ANALYSIS_ALREADY_RUNNING) 등을 화면에서 구분할 수 있게 서버 코드를 함께 넘긴다
    throw Object.assign(
      new Error(body?.message ?? `스펙 저장 실패 (HTTP ${response.status})`),
      { code: body?.code }
    );
  }
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
): Promise<SpecProfileDraft | null> {
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

  // 아직 등록한 스펙(CURRENT)이 없으면 빈 화면에서 새로 등록
  if (response.status === 404) return null;

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
