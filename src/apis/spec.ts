import { mockSpecFormOptions } from "@/mocks/spec";
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

export async function getSpecFormOptions(): Promise<SpecFormOptions> {
  return structuredClone(mockSpecFormOptions);
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