import type { SalaryChanges, SalaryConditionOption } from "@/types/salary";
import type { Education } from "@/types/spec/education";
import type { SpecProfileDraft } from "@/apis/spec";
import type {
  SalaryAcademicAbility,
  SalaryApiChanges,
  SalaryCompanyScale,
  SalarySimulationRequest,
} from "@/types/salaryApi";

const academicTypes = [
  "HIGH_SCHOOL",
  "COLLEGE",
  "UNIVERSITY",
  "GRADUATE_SCHOOL_MASTER",
  "GRADUATE_SCHOOL_DOCTORAL",
] as const;
const academicStatuses = [
  "ATTENDING",
  "LEAVE_FROM_SCHOOL",
  "GRADUATE_POSTPONED",
  "GRADUATED",
] as const;
const academicLocations = [
  "SEOUL",
  "BUSAN",
  "DAEGU",
  "INCHEON",
  "GWANGJU",
  "DAEJEON",
  "ULSAN",
  "SEJONG",
  "GYEONGGI",
  "GANGWON",
  "CHUNGBUK",
  "CHUNGNAM",
  "JEONBUK",
  "JEONNAM",
  "GYEONGBUK",
  "GYEONGNAM",
  "JEJU",
] as const;
const academicMajors = [
  "HUMANITIES",
  "SOCIAL_SCIENCES",
  "NATURAL_SCIENCES",
  "ENGINEERING",
  "MEDICINE_PHARMACY",
  "EDUCATION",
  "ARTS_PHYSICAL_EDUCATION",
] as const;

const isOneOf = <T extends string>(
  value: string,
  values: readonly T[],
): value is T => values.some((item) => item === value);

export function toSalaryAcademicAbility(
  education: Education,
): SalaryAcademicAbility | null {
  const majorAffiliation = education.majorAffiliation;
  if (
    !isOneOf(education.type, academicTypes) ||
    !isOneOf(education.status, academicStatuses) ||
    !isOneOf(education.location, academicLocations) ||
    (majorAffiliation && !isOneOf(majorAffiliation, academicMajors))
  )
    return null;

  const grade = education.universityGrade
    ? Number(education.universityGrade)
    : null;
  const scale = education.universityStandardGrade
    ? Number(education.universityStandardGrade)
    : null;
  if (
    (grade !== null && (!Number.isFinite(grade) || grade < 0)) ||
    (scale !== null && (!Number.isFinite(scale) || scale <= 0)) ||
    (grade !== null && (scale === null || grade > scale))
  )
    return null;

  return {
    type: education.type,
    status: education.status,
    location: education.location,
    universityGrade: grade,
    universityStandardGrade: scale,
    graduatedYearMonth: education.graduatedYearMonth || null,
    majorAffiliation:
      majorAffiliation && isOneOf(majorAffiliation, academicMajors)
        ? majorAffiliation
        : null,
    majorId: education.majorId,
  };
}

export function buildSalaryChanges(
  options: SalaryConditionOption[],
): SalaryChanges {
  const changes: SalaryChanges = {};
  const certificateIds = new Set<number>();

  for (const { changes: optionChanges } of options) {
    const previousLanguages = changes.languageScores ?? [];
    Object.assign(changes, optionChanges);
    if (optionChanges.languageScores?.length) {
      changes.languageScores = [
        ...previousLanguages.filter(
          (score) =>
            !optionChanges.languageScores?.some(
              (next) => next.languageExamId === score.languageExamId,
            ),
        ),
        ...optionChanges.languageScores,
      ];
    }
    for (const id of optionChanges.addCertificateIds ?? [])
      certificateIds.add(id);
  }

  if (certificateIds.size > 0) changes.addCertificateIds = [...certificateIds];
  return changes;
}

export function sameSalaryChanges(left: SalaryChanges, right: SalaryChanges) {
  const leftIds = new Set(left.addCertificateIds);
  const rightIds = new Set(right.addCertificateIds);

  return (
    leftIds.size === rightIds.size &&
    [...leftIds].every((id) => rightIds.has(id)) &&
    left.experience?.type === right.experience?.type &&
    left.experience?.durationMonths === right.experience?.durationMonths &&
    JSON.stringify(
      [...(left.languageScores ?? [])].sort(
        (a, b) => a.languageExamId - b.languageExamId,
      ),
    ) ===
      JSON.stringify(
        [...(right.languageScores ?? [])].sort(
          (a, b) => a.languageExamId - b.languageExamId,
        ),
      ) &&
    left.academic?.type === right.academic?.type &&
    left.academic?.universityGrade === right.academic?.universityGrade &&
    JSON.stringify(left.academic?.details ?? null) ===
      JSON.stringify(right.academic?.details ?? null) &&
    JSON.stringify(left.experiences ?? []) ===
      JSON.stringify(right.experiences ?? [])
  );
}

export function buildSalarySimulationRequest(
  changes: SalaryChanges,
  companyGroupScale: SalaryCompanyScale,
  baseSpecProfileId: number,
  educations: Education[] = [],
): SalarySimulationRequest | null {
  if (changes.experience) return null;
  const apiChanges: SalaryApiChanges = {};

  if (changes.experiences?.length) apiChanges.experiences = changes.experiences;
  if (changes.addCertificateIds?.length) {
    apiChanges.certificates = [...new Set(changes.addCertificateIds)]
      .sort((a, b) => a - b)
      .map((certificateId) => ({ certificateId, acquiredYearMonth: null }));
  }
  if (changes.languageScores?.length) {
    apiChanges.languageExamScores = changes.languageScores.map((score) => ({
      ...score,
      acquiredYearMonth: null,
      expiresYearMonth: null,
    }));
  }
  if (changes.academic) {
    if (changes.academic.type === "UNIVERSITY") {
      const universities = educations.filter(
        (item) => item.type === "UNIVERSITY",
      );
      if (
        universities.length !== 1 ||
        changes.academic.universityGrade === undefined
      )
        return null;
      const updated = toSalaryAcademicAbility({
        ...universities[0],
        universityGrade: String(changes.academic.universityGrade),
      });
      if (!updated) return null;
      apiChanges.academicAbilities = [updated];
    } else {
      const details = changes.academic.details;
      if (!details || details.type !== "GRADUATE_SCHOOL_MASTER") return null;
      apiChanges.academicAbilities = [details];
    }
  }

  return {
    baseSpecProfileId,
    companyGroupScale,
    changes: Object.keys(apiChanges).length ? apiChanges : null,
  };
}

/** 목표 조건은 현재 스펙을 대체하지 않으며, 이미 보유한 조건을 다시 추가하지 않는다. */
export function validateSalaryAdditions(
  changes: SalaryChanges,
  profile: SpecProfileDraft | null,
): string | null {
  if (!profile) return "먼저 현재 스펙을 등록해 주세요.";

  const ownedIds = new Set(
    profile.certificates
      .map((item) => item.certificateId)
      .filter((id) => id !== null),
  );
  if (changes.addCertificateIds?.some((id) => ownedIds.has(id))) {
    return "이미 보유한 자격증은 다시 추가할 수 없어요.";
  }

  const languageIds = (changes.languageScores ?? []).map(
    (item) => item.languageExamId,
  );
  if (new Set(languageIds).size !== languageIds.length) {
    return "같은 어학 시험은 한 번만 추가할 수 있어요.";
  }
  const opicGrades = ["NL", "NM", "NH", "IL", "IM1", "IM2", "IM3", "IH", "AL"];
  for (const target of changes.languageScores ?? []) {
    const existing = profile.languageScores.filter(
      (item) => item.languageExamId === target.languageExamId,
    );
    if (target.scoreNumeric !== null) {
      if (
        !Number.isFinite(target.scoreNumeric) ||
        target.scoreNumeric < 0 ||
        (target.languageExamId === 1 &&
          (target.scoreNumeric > 990 || !Number.isInteger(target.scoreNumeric)))
      ) {
        return "올바른 목표 점수를 입력해 주세요.";
      }
      if (
        existing.some(
          (item) =>
            item.scoreNumeric !== "" &&
            Number(item.scoreNumeric) >= target.scoreNumeric!,
        )
      ) {
        return "현재 보유한 어학 점수보다 높은 목표를 입력해 주세요.";
      }
    } else if (target.scoreGrade) {
      if (target.languageExamId === 7) {
        const index = opicGrades.indexOf(
          target.scoreGrade.trim().toUpperCase(),
        );
        if (index < 0) return "올바른 OPIc 등급을 입력해 주세요.";
        if (
          existing.some(
            (item) =>
              item.scoreGrade &&
              opicGrades.indexOf(item.scoreGrade.trim().toUpperCase()) >= index,
          )
        ) {
          return "현재 보유한 어학 등급보다 높은 목표를 입력해 주세요.";
        }
      }
    } else {
      return "목표 어학 점수 또는 등급을 입력해 주세요.";
    }
  }

  if (changes.academic?.type === "GRADUATE_SCHOOL") {
    if (!changes.academic.details) return "석사 과정은 상세 학력 정보가 없어 아직 시뮬레이션할 수 없어요.";
    if (!profile.educations.some((item) => item.type === "UNIVERSITY")) {
      return "석사 진학 목표를 설정하려면 학사 정보가 필요해요.";
    }
    if (
      profile.educations.some(
        (item) =>
          item.type === "GRADUATE_SCHOOL_MASTER" ||
          item.type === "GRADUATE_SCHOOL_DOCTORAL",
      )
    ) {
      return "이미 등록된 대학원 학력이 있어 중복 추가할 수 없어요.";
    }
  }

  if (changes.academic?.type === "UNIVERSITY") {
    const universities = profile.educations.filter(
      (item) => item.type === "UNIVERSITY",
    );
    if (universities.length !== 1)
      return "학점 변경은 학사 정보가 하나 있을 때만 가능해요.";
    const currentGrade = Number(universities[0].universityGrade);
    const gradeScale = Number(universities[0].universityStandardGrade);
    const targetGrade = changes.academic.universityGrade;
    if (
      !universities[0].universityGrade ||
      !universities[0].universityStandardGrade ||
      !Number.isFinite(currentGrade) ||
      !Number.isFinite(gradeScale) ||
      targetGrade === undefined ||
      !Number.isFinite(targetGrade) ||
      targetGrade <= currentGrade ||
      targetGrade > gradeScale
    ) {
      return "현재 학점보다 높고 만점 이하인 목표 학점을 입력해 주세요.";
    }
  }
  return null;
}
