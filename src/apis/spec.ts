import { specFormOptions } from "@/constants/specFormOptions";
import type { ApiResponse } from "@/types/spec/api";
import type { BasicInfo, SpecFormOptions } from "@/types/spec/profile";
import type { Education } from "@/types/spec/education";
import type { Certificate, LanguageScore } from "@/types/spec/qualification";
import type { Experience } from "@/types/spec/experience";

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
  accessToken: string,
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
  email: string,
): Promise<void> {
  // 실API의 JWT 회원 소유권을 Mock에서는 이메일별 저장소로 대체.
  // 저장 실패를 성공으로 처리하지 않도록 예외 전파.
  sessionStorage.setItem(key(email), JSON.stringify(profile));
}

export function getSavedSpecProfileMock(email: string): SpecProfileDraft | null {
  try {
    const raw = sessionStorage.getItem(key(email));
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    if (!("basicInfo" in data) || !data.basicInfo ||
        typeof data.basicInfo !== "object") return null;
    if (!("educations" in data) || !Array.isArray(data.educations) ||
        !("certificates" in data) || !Array.isArray(data.certificates) ||
        !("languageScores" in data) || !Array.isArray(data.languageScores) ||
        !("experiences" in data) || !Array.isArray(data.experiences)) return null;
    return data as SpecProfileDraft;
  } catch {
    return null;
  }
}