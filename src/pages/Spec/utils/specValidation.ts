import type {
  BasicInfo,
  RegionOption,
  SpecFormOptions,
} from "@/types/spec/profile";
import type { Education } from "@/types/spec/education";
import type {
  Certificate,
  LanguageScore,
} from "@/types/spec/qualification";
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
  Number(grade) <= Number(scale);

export const isValidBasicInfo = (
  value: BasicInfo,
  residentialAreas: RegionOption[],
) =>
  isValidBirthYear(value.birthYear) &&
  residentialAreas.some((area) => area.code === value.residenceRegion) &&
  !!value.jobName.trim();

export const isValidEducation = (
  value: Education,
  options: SpecFormOptions,
) =>
  options.degreeTypes.some((item) => item.value === value.type) &&
  options.schoolLocations.some((item) => item.code === value.location) &&
  (!value.status ||
    options.academicStatuses.some((item) => item.value === value.status)) &&
  options.majorFields.some(
    (item) => item.value === value.majorAffiliation,
  ) &&
  !!value.majorName.trim() &&
  isValidYearMonth(value.graduatedYearMonth) &&
  (value.status !== "GRADUATED" ||
    value.graduatedYearMonth <= currentYearMonth()) &&
  options.gradeScales.includes(value.universityStandardGrade) &&
  isValidGrade(
    value.universityGrade,
    value.universityStandardGrade,
  );

export const isValidCertificate = (value: Certificate) =>
  !!value.certificateName.trim() &&
  isValidYearMonth(value.acquiredYearMonth) &&
  value.acquiredYearMonth <= currentYearMonth();

export const isValidLanguage = (value: LanguageScore) => {
  const score = value.scoreNumeric.trim();

  return (
    !!value.languageExamName.trim() &&
    (!!score || !!value.scoreGrade.trim()) &&
    (!score ||
      (/^\d+(\.\d+)?$/.test(score) &&
        Number.isFinite(Number(score)))) &&
    isValidYearMonth(value.expiresYearMonth)
  );
};

export const isValidExperience = (value: Experience) =>
  value.type === "INTERNSHIP" &&
  !!value.organizationName?.trim() &&
  !!value.title.trim() &&
  value.title.length <= 255 &&
  !!value.description.trim() &&
  value.description.length <= 300 &&
  isValidYearMonth(value.startedYearMonth) &&
  isValidYearMonth(value.endedYearMonth) &&
  value.startedYearMonth <= value.endedYearMonth &&
  value.endedYearMonth <= currentYearMonth();