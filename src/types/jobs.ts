export type JobPosting = {
  id: string;
  industry: string;
  jobRole: string;
  title: string;
  company: string;
  education: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  daysLeft: number | null;
  bookmarkCount: number;
};

export type JobTab = "recommended" | "saved" | "offers";

export type JobSort = "latest" | "popular";

export type DropdownOption<T extends string = string> = {
  value: T;
  label: string;
  description?: string;
};

export type JobRole = {
  name: string;
  category: string;
  description: string;
};

export type JobDetail = {
  companyDescription: string;
  position: string;
  salaryNote: string;
  address: string;
  employmentType: string;
  duties: string;
  requirements: string;
  benefits: string;
  applyUrl?: string;
};
