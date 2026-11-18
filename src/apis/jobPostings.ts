import { apiClient, unwrap, type ApiResponse, type PageMeta } from "@/apis/client";
import type {
  DesiredJob,
  JobPostingCard,
  JobRegion,
  JobSort,
} from "@/types/jobs";

type JobPostingStatus = "OPEN" | "CLOSE";
type ServerJobSort = "DEADLINE" | "POPULAR";

/** 서버 JobPostingCardResponse */
export type JobPostingCardDto = {
  jobPostingId: number;
  title: string;
  status: JobPostingStatus;
  companyName: string;
  companySizeLabel: string | null;
  industryLabel: string | null;
  educationRequirement: string | null;
  workRegion: string | null;
  /** 원 단위 */
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  dDay: number | null;
  bookmarkCount: number;
  bookmarked: boolean;
};

type JobPostingListDto = PageMeta & {
  personalized: boolean;
  desiredJob: DesiredJob | null;
  tabCounts: { recommended: number; bookmarked: number };
  jobPostings: JobPostingCardDto[];
};

export type JobPostingListQuery = {
  region?: JobRegion;
  sort?: JobSort;
  page?: number;
  size?: number;
  signal?: AbortSignal;
};

export type JobPostingList = PageMeta & {
  /** false 면 희망 직무가 없어 전체 공고를 보여주는 중 */
  personalized: boolean;
  desiredJob: DesiredJob | null;
  tabCounts: { recommended: number; saved: number };
  jobs: JobPostingCard[];
};

const SORT_TO_SERVER: Record<JobSort, ServerJobSort> = {
  latest: "DEADLINE",
  popular: "POPULAR",
};

const toManwon = (won: number | null) =>
  won === null ? null : Math.round(won / 10_000);

export const toJobPostingCard = (dto: JobPostingCardDto): JobPostingCard => ({
  id: String(dto.jobPostingId),
  title: dto.title,
  isClosed: dto.status === "CLOSE",
  company: dto.companyName,
  companySize: dto.companySizeLabel,
  industry: dto.industryLabel,
  education: dto.educationRequirement,
  location: dto.workRegion,
  salaryMin: toManwon(dto.expectedSalaryMin),
  salaryMax: toManwon(dto.expectedSalaryMax),
  daysLeft: dto.dDay,
  bookmarkCount: dto.bookmarkCount,
  bookmarked: dto.bookmarked,
});

/** 맞춤 공고 목록. 직무는 항상 서버의 희망 직무 기준이며 지역·정렬·페이지만 지정한다. */
export async function getJobPostings({
  region,
  sort = "latest",
  page = 1,
  size = 6,
  signal,
}: JobPostingListQuery = {}): Promise<JobPostingList> {
  const { data } = await apiClient.get<ApiResponse<JobPostingListDto>>(
    "/api/job-postings",
    {
      params: { region, sort: SORT_TO_SERVER[sort], page, size },
      signal,
    }
  );
  const body = unwrap(data);
  return {
    personalized: body.personalized,
    desiredJob: body.desiredJob,
    tabCounts: {
      recommended: body.tabCounts.recommended,
      saved: body.tabCounts.bookmarked,
    },
    jobs: body.jobPostings.map(toJobPostingCard),
    page: body.page,
    size: body.size,
    totalElements: body.totalElements,
    totalPages: body.totalPages,
    hasNext: body.hasNext,
  };
}
