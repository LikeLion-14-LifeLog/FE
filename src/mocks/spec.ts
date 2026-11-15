import type { SpecFormOptions } from "@/types/spec/profile";

export const mockSpecFormOptions: SpecFormOptions = {
  // TODO: GET /api/residential-areas 실제 응답으로 교체
  residentialAreas: [
    { code: "SEOUL", name: "서울" },
    { code: "DAEGU", name: "대구" },
  ],

  // TODO: API 명세 협의 시 학교 소재지 전체 허용값 확인
  schoolLocations: [
    { code: "SEOUL", name: "서울" },
  ],

  // TODO(API 명세 협의): 학위 구분 ENUM 확인 후 서버 코드로 교체
  // 현재 Figma UI를 위한 임시 선택지이며 서버 요청 DTO에 직접 사용하지 않음
  degreeTypes: [
    { value: "HIGH_SCHOOL", label: "고등학교 졸업" },
    { value: "ASSOCIATE", label: "전문학사" },
    { value: "BACHELOR", label: "학사" },
    { value: "MASTER", label: "석사" },
  ],

  // TODO: 학적 상태는 Figma에 입력 UI가 없어 API 협의 필요
  academicStatuses: [
    { value: "ATTENDING", label: "재학" },
    { value: "GRADUATED", label: "졸업" },
  ],

  // GET /api/majors의 mainField ENUM
  majorFields: [
    { value: "HUMANITIES", label: "인문계열" },
    { value: "SOCIAL_SCIENCES", label: "사회계열" },
    { value: "NATURAL_SCIENCES", label: "자연계열" },
    { value: "ENGINEERING", label: "공학계열" },
    { value: "MEDICINE_PHARMACY", label: "의약계열" },
    { value: "EDUCATION", label: "교육계열" },
    { value: "ARTS_PHYSICAL_EDUCATION", label: "예체능계열" },
  ],

  // TODO: API 명세 협의 시 학점 만점 허용값 확인
  gradeScales: ["4.5"],
};