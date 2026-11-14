// organizationName은 Figma UI 전용이며 서버 PUT DTO에서 제외합니다.
export type Experience = {
  localId: number;
  experienceId: number | null;
  type: string;
  organizationName?: string;
  title: string;
  startedYearMonth: string;
  endedYearMonth: string;
  description: string;
  awarded: boolean;
  organizerName: string;
  awardGrade: string;
};