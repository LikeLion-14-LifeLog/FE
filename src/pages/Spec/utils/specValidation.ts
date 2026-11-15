import type { BasicInfo, RegionOption, SpecFormOptions } from "@/types/spec/profile";
import type { Education } from "@/types/spec/education";
import type { Certificate, LanguageScore } from "@/types/spec/qualification";
import type { Experience } from "@/types/spec/experience";

export const currentYearMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};
export const isValidYearMonth = (value: string) =>
  /^(19\d{2}|[2-9]\d{3})-(0[1-9]|1[0-2])$/.test(value);
export const isValidBirthYear = (value: string) =>
  /^\d{4}$/.test(value) && Number(value) >= 1900 &&
  Number(value) <= new Date().getFullYear();
export const isValidGrade = (grade: string, scale: string) =>
  /^\d+(\.\d{1,2})?$/.test(grade) && Number(scale) > 0 &&
  Number(grade) >= 0 && Number(grade) <= Number(scale);

// UI Mock: 숫자 PK가 없는 검색 데이터이므로 표시명 선택 여부만 확인.
// 실제 PUT 연결 전에는 반드시 jobId 등의 서버 PK 검증 필요.
export const isValidBasicInfo = (value: BasicInfo, regions: RegionOption[]) =>
  isValidBirthYear(value.birthYear) &&
  regions.some((region) => region.code === value.residenceRegion) &&
  !!value.jobName.trim();

export const isValidEducation = (value: Education, options: SpecFormOptions) => {
  const requiresGrade = value.type !== "HIGH_SCHOOL";
  const gradeProvided = !!value.universityGrade || !!value.universityStandardGrade;
  const gradeValid = (!requiresGrade && !gradeProvided) ||
    (options.gradeScales.includes(value.universityStandardGrade) &&
      isValidGrade(value.universityGrade, value.universityStandardGrade));
  return options.degreeTypes.some((v) => v.value === value.type) &&
    options.academicStatuses.some((v) => v.value === value.status) &&
    options.schoolLocations.some((v) => v.code === value.location) &&
    options.majorFields.some((v) => v.value === value.majorAffiliation) &&
    !!value.majorName.trim() &&
    isValidYearMonth(value.graduatedYearMonth) &&
    (value.status !== "GRADUATED" || value.graduatedYearMonth <= currentYearMonth()) &&
    gradeValid;
};

export const isValidCertificate = (value: Certificate) =>
  !!value.certificateName.trim() && isValidYearMonth(value.acquiredYearMonth) &&
  value.acquiredYearMonth <= currentYearMonth();

export const isValidLanguage = (value: LanguageScore) => {
  const numeric = value.scoreNumeric.trim();
  const grade = value.scoreGrade.trim();
  const scoreValid = value.scoreType === "NUMERIC" ? !!numeric && !grade :
    value.scoreType === "GRADE" ? !numeric && !!grade :
    value.scoreType === "NUMERIC_AND_GRADE" ? !!numeric && !!grade :
    !!numeric || !!grade; // Mock 메타데이터 없는 시험은 적어도 한 값 요구
  return !!value.languageExamName.trim() && scoreValid &&
    (!numeric || (/^\d+(\.\d+)?$/.test(numeric) && Number(numeric) >= 0)) &&
    isValidYearMonth(value.acquiredYearMonth) &&
    value.acquiredYearMonth <= currentYearMonth() &&
    (!value.expiresYearMonth ||
      (isValidYearMonth(value.expiresYearMonth) &&
        value.expiresYearMonth >= value.acquiredYearMonth));
};

export const isValidExperience = (value: Experience) =>
  ["INTERNSHIP", "PROJECT", "CONTEST", "PRACTICUM", "CLUB", "OTHER"].includes(value.type) &&
  !!value.title.trim() && value.title.length <= 255 &&
  value.description.length <= 300 &&
  isValidYearMonth(value.startedYearMonth) && value.startedYearMonth <= currentYearMonth() &&
  (!value.endedYearMonth ||
    (isValidYearMonth(value.endedYearMonth) &&
      value.startedYearMonth <= value.endedYearMonth &&
      value.endedYearMonth <= currentYearMonth())) &&
  (!value.awarded || (!!value.organizerName.trim() && !!value.awardGrade.trim()));