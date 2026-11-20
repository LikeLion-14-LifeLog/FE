import { apiClient } from "@/apis/client";
import type { ApiResponse } from "@/types/spec/api";
import type { JobPostingListData, JobPostingSort } from "@/types/jobPosting";

/**
 * GET /api/job-postings — 내 희망 직무·학력 기준 맞춤 공고 (모집 중·마감 전).
 * 희망 직무가 없으면 personalized=false 로 전체 공고가 온다. page 는 1부터.
 */
export async function getJobPostings(
  options: {
    sort?: JobPostingSort;
    page?: number;
    size?: number;
    region?: string;
    signal?: AbortSignal;
  } = {},
): Promise<JobPostingListData> {
  const { signal, region, sort = "DEADLINE", page = 1, size = 6 } = options;
  const { data } = await apiClient.get<ApiResponse<JobPostingListData>>(
    "/api/job-postings",
    { params: { sort, page, size, ...(region && { region }) }, signal },
  );
  if (!data.success || !data.data || !Array.isArray(data.data.jobPostings))
    throw new Error(data.message ?? "맞춤 공고를 불러오지 못했습니다.");
  return data.data;
}
