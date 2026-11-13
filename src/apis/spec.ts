import { mockSpecFormOptions } from "@/mocks/spec";
import type { BasicInfo, SpecFormOptions } from "@/types/spec/profile";
import type { Education } from "@/types/spec/education";
import type {
  Certificate,
  LanguageScore,
} from "@/types/spec/qualification";
import type { Experience } from "@/types/spec/experience";

export type SpecProfileDraft = {
  basicInfo: BasicInfo;
  educations: Education[];
  certificates: Certificate[];
  languageScores: LanguageScore[];
  experiences: Experience[];
};

let mockSavedProfile: SpecProfileDraft | null = null;

export async function getSpecFormOptions(): Promise<SpecFormOptions> {
  // TODO: 거주지역은 GET /api/residential-areas로 교체
  // TODO: 나머지 선택지는 실제 조회 API 또는 전체 ENUM 확인 후 보완
  return structuredClone(mockSpecFormOptions);
}

export function saveSpecProfileMock(
  profile: SpecProfileDraft,
): Promise<void> {
  // TODO: PUT /api/spec-profiles/current/temporary로 교체
  // 현재는 앱 실행 중 메모리에만 저장하며 새로고침 시 초기화됨
  mockSavedProfile = structuredClone(profile);
  return Promise.resolve();
}

export function getSavedSpecProfileMock(): SpecProfileDraft | null {
  return mockSavedProfile ? structuredClone(mockSavedProfile) : null;
}