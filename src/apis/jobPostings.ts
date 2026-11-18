import { apiClient, unwrap, type ApiResponse, type PageMeta } from "@/apis/client";
import type {
  DesiredJob,
  JobPostingCard,
  JobPostingDetail,
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

/**
 * 서버 JobPostingDetailResponse.
 * 명세와 BE(develop) 구현이 달라 양쪽 형태를 모두 받는다.
 * - sections: BE 는 content(문자열), 명세는 items(label·content 배열)
 * - applyUrl·position·company.sizeLabel: 명세에만 있음
 */
type JobPostingSectionDto = {
  title: string;
  content?: string | null;
  items?: { label?: string | null; content: string }[] | null;
};

type JobPostingDetailDto = {
  jobPostingId: number;
  title: string;
  status?: JobPostingStatus;
  company: {
    name: string;
    sizeLabel?: string | null;
    industryLabel: string | null;
  };
  position?: string | null;
  pay: {
    text: string;
    amountMin: number | null;
    amountMax: number | null;
  } | null;
  workRegion?: string | null;
  workplaceAddress: string | null;
  employmentType: string;
  employmentTypeLabel: string;
  educationRequirement?: string | null;
  closesAt: string | null;
  dDay: number | null;
  sections: JobPostingSectionDto[];
  applyUrl?: string | null;
  bookmarked: boolean;
  bookmarkCount?: number;
};

const toSectionLines = ({ content, items }: JobPostingSectionDto) => {
  const raw = items
    ? items.map(({ label, content }) =>
        label ? `${label} ${content}` : content
      )
    : (content ?? "").split(/\r?\n/);
  return raw.map((line) => line.trim()).filter(Boolean);
};

const toJobPostingDetail = (dto: JobPostingDetailDto): JobPostingDetail => {
  const companyDescription = [dto.company.industryLabel, dto.company.sizeLabel]
    .filter(Boolean)
    .join(" · ");
  return {
    id: String(dto.jobPostingId),
    title: dto.title,
    isClosed:
      dto.status === "CLOSE" || (dto.dDay !== null && dto.dDay < 0),
    company: dto.company.name,
    companyDescription: companyDescription || null,
    position: dto.position || dto.title,
    payText: dto.pay?.text || null,
    location: dto.workRegion ?? null,
    address: dto.workplaceAddress || dto.workRegion || null,
    employmentType: dto.employmentTypeLabel,
    education: dto.educationRequirement ?? null,
    closesAt: dto.closesAt,
    daysLeft: dto.dDay,
    sections: dto.sections
      .map((section) => ({
        title: section.title,
        lines: toSectionLines(section),
      }))
      .filter((section) => section.lines.length > 0),
    applyUrl: dto.applyUrl || null,
    bookmarkCount: dto.bookmarkCount ?? 0,
    bookmarked: dto.bookmarked,
  };
};

/** 공고 상세. 없는 공고면 ApiError(status 404, code JOB_POSTING_404) */
export async function getJobPostingDetail(
  jobPostingId: string,
  signal?: AbortSignal
): Promise<JobPostingDetail> {
  const { data } = await apiClient.get<ApiResponse<JobPostingDetailDto>>(
    `/api/job-postings/${encodeURIComponent(jobPostingId)}`,
    { signal }
  );
  return toJobPostingDetail(unwrap(data));
}
