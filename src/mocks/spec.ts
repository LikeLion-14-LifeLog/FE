import type { SpecFormOptions } from "@/types/spec/profile";

const regions = [
  ["SEOUL", "서울"], ["BUSAN", "부산"], ["DAEGU", "대구"],
  ["INCHEON", "인천"], ["GWANGJU", "광주"], ["DAEJEON", "대전"],
  ["ULSAN", "울산"], ["SEJONG", "세종"], ["GYEONGGI", "경기"],
  ["GANGWON", "강원"], ["CHUNGBUK", "충북"], ["CHUNGNAM", "충남"],
  ["JEONBUK", "전북"], ["JEONNAM", "전남"], ["GYEONGBUK", "경북"],
  ["GYEONGNAM", "경남"], ["JEJU", "제주"],
] as const;
const regionOptions = regions.map(([code, name]) => ({ code, name }));

export const mockSpecFormOptions: SpecFormOptions = {
  residentialAreas: regionOptions,
  schoolLocations: regionOptions,
  degreeTypes: [
    { value: "HIGH_SCHOOL", label: "고등학교" },
    { value: "COLLEGE", label: "전문학사" },
    { value: "UNIVERSITY", label: "학사" },
    { value: "GRADUATE_SCHOOL_MASTER", label: "석사" },
    { value: "GRADUATE_SCHOOL_DOCTORAL", label: "박사" },
  ],
  academicStatuses: [
    { value: "ATTENDING", label: "재학" },
    { value: "LEAVE_FROM_SCHOOL", label: "휴학" },
    { value: "GRADUATE_POSTPONED", label: "졸업유예" },
    { value: "GRADUATED", label: "졸업" },
  ],
  majorFields: [
    { value: "HUMANITIES", label: "인문계열" },
    { value: "SOCIAL_SCIENCES", label: "사회계열" },
    { value: "NATURAL_SCIENCES", label: "자연계열" },
    { value: "ENGINEERING", label: "공학계열" },
    { value: "MEDICINE_PHARMACY", label: "의약계열" },
    { value: "EDUCATION", label: "교육계열" },
    { value: "ARTS_PHYSICAL_EDUCATION", label: "예체능계열" },
  ],
  gradeScales: ["4.0", "4.3", "4.5"],
};