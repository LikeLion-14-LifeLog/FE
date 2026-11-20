import type {
  BasicInfo,
  RegionOption,
  SpecFormOptions,
} from "@/types/spec/profile";
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
  /^\d{4}$/.test(value) &&
  Number(value) >= 1900 &&
  Number(value) <= new Date().getFullYear();

export const isValidGrade = (grade: string, scale: string) =>
  /^\d+(\.\d{1,2})?$/.test(grade) &&
  Number(scale) > 0 &&
  Number(grade) >= 0 &&
  Number(grade) <= Number(scale);

// 실제 프로필 저장 API 연결 시 서버 ID 검증을 추가한다.
export const isValidBasicInfo = (value: BasicInfo, regions: RegionOption[]) =>
  isValidBirthYear(value.birthYear) &&
  regions.some((region) => region.code === value.residenceRegion) &&
  !!value.jobName.trim();

export const isValidEducation = (
  value: Education,
  options: SpecFormOptions
) => {
  const requiresGrade = value.type !== "HIGH_SCHOOL";
  const gradeProvided =
    !!value.universityGrade || !!value.universityStandardGrade;

  const gradeValid =
    (!requiresGrade && !gradeProvided) ||
    (options.gradeScales.includes(value.universityStandardGrade) &&
      isValidGrade(value.universityGrade, value.universityStandardGrade));

  return (
    options.degreeTypes.some((item) => item.value === value.type) &&
    options.academicStatuses.some((item) => item.value === value.status) &&
    options.schoolLocations.some((item) => item.code === value.location) &&
    options.majorFields.some((item) => item.value === value.majorAffiliation) &&
    !!value.majorName.trim() &&
    isValidYearMonth(value.graduatedYearMonth) &&
    (value.status !== "GRADUATED" ||
      value.graduatedYearMonth <= currentYearMonth()) &&
    gradeValid
  );
};

export const isValidCertificate = (value: Certificate) =>
  !!value.certificateName.trim() &&
  isValidYearMonth(value.acquiredYearMonth) &&
  value.acquiredYearMonth <= currentYearMonth();

export const isValidLanguage = (value: LanguageScore) => {
  const numeric = value.scoreNumeric.trim();
  const grade = value.scoreGrade.trim();

  let scoreValid = false;

  switch (value.scoreType) {
    case "NUMERIC":
      scoreValid = !!numeric && !grade;
      break;
    case "GRADE":
      scoreValid = !numeric && !!grade;
      break;
    case "NUMERIC_AND_GRADE":
      scoreValid = !!numeric && !!grade;
      break;
    case "NONE":
      scoreValid = !numeric && !grade;
      break;
  }

  return (
    value.languageExamId !== null &&
    Number.isSafeInteger(value.languageExamId) &&
    value.languageExamId > 0 &&
    !!value.languageExamName.trim() &&
    scoreValid &&
    (!numeric ||
      (/^\d+(\.\d+)?$/.test(numeric) && Number.isFinite(Number(numeric)))) &&
    isValidYearMonth(value.acquiredYearMonth) &&
    value.acquiredYearMonth <= currentYearMonth() &&
    (!value.expiresYearMonth ||
      (isValidYearMonth(value.expiresYearMonth) &&
        value.expiresYearMonth >= value.acquiredYearMonth))
  );
};

export const isValidExperience = (value: Experience) =>
  ["INTERNSHIP", "PROJECT", "CONTEST", "PRACTICUM", "CLUB", "OTHER"].includes(
    value.type
  ) &&
  !!value.title.trim() &&
  value.title.length <= 255 &&
  value.description.length <= 300 &&
  isValidYearMonth(value.startedYearMonth) &&
  value.startedYearMonth <= currentYearMonth() &&
  (!value.endedYearMonth ||
    (isValidYearMonth(value.endedYearMonth) &&
      value.startedYearMonth <= value.endedYearMonth &&
      value.endedYearMonth <= currentYearMonth())) &&
  (!value.awarded ||
    (!!value.organizerName.trim() && !!value.awardGrade.trim()));
