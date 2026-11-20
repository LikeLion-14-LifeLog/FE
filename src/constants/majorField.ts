import type { MajorField } from "@/types/careerRoute";

/** 전공 계열 코드 → 표시명 */
export const MAJOR_FIELD_LABEL: Record<MajorField, string> = {
  HUMANITIES: "인문계열",
  SOCIAL_SCIENCES: "사회계열",
  NATURAL_SCIENCES: "자연계열",
  ENGINEERING: "공학계열",
  MEDICINE_PHARMACY: "의약계열",
  EDUCATION: "교육계열",
  ARTS_PHYSICAL_EDUCATION: "예체능계열",
  UNKNOWN: "미상",
};

export const MAJOR_FIELDS = Object.keys(MAJOR_FIELD_LABEL) as MajorField[];
