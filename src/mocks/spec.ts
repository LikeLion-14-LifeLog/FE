import type { SpecFormOptions } from "@/types/spec/profile";

export const mockSpecFormOptions: SpecFormOptions = {
  // TODO: GET /api/residential-areas의 전체 17개 응답으로 교체
  residentialAreas: [
    { code: "SEOUL", name: "서울" },
    { code: "DAEGU", name: "대구" },
  ],

  // TODO: 학교 소재지 전체 허용값 확인
  schoolLocations: [{ code: "SEOUL", name: "서울" }],

  // TODO: 학력 유형 전체 ENUM 확인
  degreeTypes: [
    { value: "HIGH_SCHOOL", label: "고등학교" },
    { value: "UNIVERSITY", label: "대학교" },
  ],

  // TODO: 학적 상태 전체 ENUM 확인
  academicStatuses: [
    { value: "ATTENDING", label: "재학" },
    { value: "GRADUATED", label: "졸업" },
  ],

  // GET /api/majors에 명시된 mainField ENUM
  majorFields: [
    { value: "HUMANITIES", label: "인문계열" },
    { value: "SOCIAL_SCIENCES", label: "사회계열" },
    { value: "NATURAL_SCIENCES", label: "자연계열" },
    { value: "ENGINEERING", label: "공학계열" },
    { value: "MEDICINE_PHARMACY", label: "의약계열" },
    { value: "EDUCATION", label: "교육계열" },
    { value: "ARTS_PHYSICAL_EDUCATION", label: "예체능계열" },
  ],

  // TODO: 학점 만점 전체 허용값 확인
  gradeScales: ["4.5"],
};