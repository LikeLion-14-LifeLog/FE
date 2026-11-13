// UI 입력 모델입니다. 실제 PUT 요청 DTO와 동일하지 않습니다.
export type BasicInfo = {
  birthYear: string;
  residenceRegion: string;
  jobId: number | null;
  jobName: string;
};

export type Education = {
  localId: number;
  academicAbilityId: number | null;
  type: string;
  status: string;
  location: string;
  universityGrade: string;
  universityStandardGrade: string;
  graduatedYearMonth: string;
  majorAffiliation: string;
  majorId: number | null;
  majorName: string;
};

export type SelectOption = {
  value: string;
  label: string;
};

export type RegionOption = {
  code: string;
  name: string;
};

export type SpecFormOptions = {
  residentialAreas: RegionOption[];
  schoolLocations: RegionOption[];
  degreeTypes: SelectOption[];
  academicStatuses: SelectOption[];
  majorFields: SelectOption[];
  gradeScales: string[];
};