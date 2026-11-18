import type { DropdownOption, JobRegion, JobSort, JobTab } from "@/types/jobs";

export const ALL_REGION = "ALL";
export type RegionFilter = JobRegion | typeof ALL_REGION;

export const REGION_OPTIONS: DropdownOption<RegionFilter>[] = [
  { value: ALL_REGION, label: "전체" },
  { value: "SEOUL", label: "서울 전체" },
  { value: "SEOUL_PANGYO", label: "서울·판교 전체" },
  { value: "GYEONGGI", label: "경기 전체" },
  { value: "INCHEON", label: "인천" },
  { value: "BUSAN", label: "부산" },
  { value: "DAEGU", label: "대구" },
  { value: "DAEJEON", label: "대전" },
  { value: "GWANGJU", label: "광주" },
];

export const SORT_OPTIONS: DropdownOption<JobSort>[] = [
  { value: "latest", label: "최신순", description: "마감 임박 D-day 순" },
  { value: "popular", label: "찜한순", description: "찜이 많은 공고 순" },
];

export const JOB_TABS: JobTab[] = ["recommended", "saved", "offers"];

export const DEFAULT_REGION: RegionFilter = ALL_REGION;
export const DEFAULT_SORT: JobSort = "latest";
export const DEFAULT_TAB: JobTab = "recommended";
