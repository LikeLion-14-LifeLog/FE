export type Experience = {
  localId: number;
  experienceId: number | null;
  type: string;
  title: string;
  startedYearMonth: string;
  endedYearMonth: string;
  description: string;
  awarded: boolean;
  organizerName: string;
  awardGrade: string;
};