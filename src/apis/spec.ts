import { mockSpecFormOptions } from "@/mocks/spec";
import type { SpecFormOptions } from "@/types/spec/profile";

export async function getSpecFormOptions(): Promise<SpecFormOptions> {
  // TODO: 거주지역은 GET /api/residential-areas 응답으로 교체
  // TODO: 나머지 선택지는 전체 ENUM 또는 조회 API 확인 후 보완
  return structuredClone(mockSpecFormOptions);
}