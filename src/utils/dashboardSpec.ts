import type { SpecProfileDraft } from "@/apis/spec";
import { specFormOptions } from "@/constants/specFormOptions";
import type { Education } from "@/types/spec/education";

/** 대시보드에 보여 줄 저장된 스펙 요약 */
export type DashboardSpec = {
  /** 사원증의 학과 (전공명 → 전공 계열 → "") */
  major: string;
  /** 핵심 스펙 칩 */
  specs: string[];
  /**
   * 스펙을 한 번이라도 저장했는지 — 회원가입 때 빈 CURRENT 가 만들어지므로
   * 응답이 있어도 희망 직무·학력이 모두 비어 있으면 미등록으로 본다
   */
  registered: boolean;
};

/** 칩이 너무 많으면 한 줄을 넘기므로 이만큼만 보이고 나머지는 "외 N개" */
const MAX_CHIPS = 6;

/** 학력 우선순위 — 높은 학위일수록 앞 */
const DEGREE_RANK = [
  "GRADUATE_SCHOOL_DOCTORAL",
  "GRADUATE_SCHOOL_MASTER",
  "UNIVERSITY",
  "COLLEGE",
  "HIGH_SCHOOL",
];

const labelOf = (
  options: readonly { value: string; label: string }[],
  value: string,
) => options.find((option) => option.value === value)?.label ?? "";

/** 가장 높은 학력 (같은 학위면 나중에 등록한 것) */
function pickMainEducation(educations: Education[]) {
  const rank = (type: string) => {
    const index = DEGREE_RANK.indexOf(type);
    return index === -1 ? DEGREE_RANK.length : index;
  };
  return educations.reduce<Education | null>(
    (best, item) => (!best || rank(item.type) <= rank(best.type) ? item : best),
    null,
  );
}

function educationChips(education: Education | null) {
  if (!education) return [];
  const degree = labelOf(specFormOptions.degreeTypes, education.type);
  const status = labelOf(specFormOptions.academicStatuses, education.status);
  const major = education.majorName.trim();
  const chips = [[major, degree, status].filter(Boolean).join(" ")];
  if (education.universityGrade && education.universityStandardGrade)
    chips.push(
      `학점 ${education.universityGrade} / ${education.universityStandardGrade}`,
    );
  return chips.filter(Boolean);
}

/** 빈 값·중복 제거 (칩 key 가 겹치지 않게) */
const unique = (items: string[]) => [...new Set(items.filter(Boolean))];

/** 서버에 저장된 CURRENT 스펙 →사원증 학과 + 핵심 스펙 칩 */
export function toDashboardSpec(profile: SpecProfileDraft): DashboardSpec {
  const main = pickMainEducation(profile.educations);
  const major =
    main?.majorName.trim() ||
    (main ? labelOf(specFormOptions.majorFields, main.majorAffiliation) : "");

  const chips = unique([
    ...educationChips(main),
    ...profile.certificates.map((item) => item.certificateName.trim()),
    ...profile.languageScores.map((item) =>
      [item.languageExamName.trim(), item.scoreNumeric || item.scoreGrade]
        .filter(Boolean)
        .join(" "),
    ),
    ...(profile.experiences.length
      ? [`경험·활동 ${profile.experiences.length}건`]
      : []),
    ...(profile.basicInfo.jobName.trim()
      ? [`희망 직무 ${profile.basicInfo.jobName.trim()}`]
      : []),
  ]);

  const specs =
    chips.length > MAX_CHIPS
      ? [...chips.slice(0, MAX_CHIPS - 1), `외 ${chips.length - MAX_CHIPS + 1}개`]
      : chips;

  const registered =
    profile.basicInfo.jobId !== null ||
    !!profile.basicInfo.jobName.trim() ||
    profile.educations.length > 0;

  return { major, specs, registered };
}
