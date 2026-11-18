import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "@/apis/client";
import { getJobPostings, type JobPostingList } from "@/apis/jobPostings";
import {
  getBookmarkCount,
  toggleSavedJob,
  useSavedJobIds,
} from "@/store/savedJobsStore";
import type { JobPostingCard, JobSort, JobTab } from "@/types/jobs";
import EmptyJobs from "./components/EmptyJobs";
import FilterDropdown from "./components/FilterDropdown";
import JobCard from "./components/JobCard";
import JobTabs from "./components/JobTabs";
import Pagination from "./components/Pagination";
import {
  ALL_REGION,
  DEFAULT_REGION,
  MOCK_JOBS,
  REGION_OPTIONS,
  SORT_OPTIONS,
  type RegionFilter,
} from "./mockData";

const PAGE_SIZE = 6;

const EMPTY_MESSAGES: Record<JobTab, string> = {
  recommended: "조건에 맞는 기업의 공고가 없습니다.",
  saved: "아직 저장한 공고가 없습니다.",
  offers: "추후 확장 예정입니다.",
};

const errorMessage = (error: unknown) => {
  if (error instanceof ApiError && error.status === 401)
    return "로그인이 필요합니다.";
  return "공고를 불러오지 못했습니다.";
};

const formatDDay = (job: JobPostingCard) => {
  if (job.isClosed) return "마감";
  if (job.daysLeft === null) return "상시";
  return job.daysLeft === 0 ? "D-Day" : `D-${job.daysLeft}`;
};

const formatSalary = ({ salaryMin, salaryMax }: JobPostingCard) =>
  salaryMin === null || salaryMax === null
    ? "예상 초봉 산정 중"
    : `예상 초봉 ${salaryMin.toLocaleString()}만 ~ ${salaryMax.toLocaleString()}만 원`;

const JobChancePage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<JobTab>("recommended");
  const [region, setRegion] = useState<RegionFilter>(DEFAULT_REGION);
  const [sort, setSort] = useState<JobSort>("latest");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<JobPostingList | null>(null);
  const [error, setError] = useState<unknown>(null);
  const queryKey = `${region}|${sort}|${page}`;
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const isLoading = settledKey !== queryKey;
  // TODO: 공고 저장/저장취소 API 연동 시 제거 (현재는 화면에서만 토글)
  const [bookmarkOverrides, setBookmarkOverrides] = useState<
    ReadonlyMap<string, boolean>
  >(new Map());
  // TODO: 저장한 공고 목록 API 연동 시 제거
  const savedIds = useSavedJobIds();

  useEffect(() => {
    const controller = new AbortController();
    const key = `${region}|${sort}|${page}`;
    getJobPostings({
      region: region === ALL_REGION ? undefined : region,
      sort,
      page,
      size: PAGE_SIZE,
      signal: controller.signal,
    })
      .then((data) => {
        setResult(data);
        setError(null);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(e);
      })
      .finally(() => {
        if (!controller.signal.aborted) setSettledKey(key);
      });
    return () => controller.abort();
  }, [region, sort, page]);

  const recommendedJobs = useMemo(
    () =>
      (result?.jobs ?? []).map((job) => {
        const override = bookmarkOverrides.get(job.id);
        if (override === undefined || override === job.bookmarked) return job;
        return {
          ...job,
          bookmarked: override,
          bookmarkCount: job.bookmarkCount + (override ? 1 : -1),
        };
      }),
    [result, bookmarkOverrides]
  );

  const savedJobs = useMemo<JobPostingCard[]>(
    () =>
      MOCK_JOBS.filter((job) => savedIds.has(job.id))
        .map((job) => ({
          id: job.id,
          title: job.title,
          isClosed: false,
          company: job.company,
          companySize: null,
          industry: job.industry,
          education: job.education,
          location: job.location,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          daysLeft: job.daysLeft,
          bookmarkCount: getBookmarkCount(job, savedIds),
          bookmarked: true,
        }))
        .sort((a, b) =>
          sort === "latest"
            ? (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity)
            : b.bookmarkCount - a.bookmarkCount
        ),
    [savedIds, sort]
  );

  const savedTotalPages = Math.max(1, Math.ceil(savedJobs.length / PAGE_SIZE));
  const view =
    tab === "recommended"
      ? {
          jobs: recommendedJobs,
          total: result?.totalElements ?? 0,
          totalPages: Math.max(1, result?.totalPages ?? 1),
          page,
        }
      : tab === "saved"
        ? {
            jobs: savedJobs.slice(
              (Math.min(page, savedTotalPages) - 1) * PAGE_SIZE,
              Math.min(page, savedTotalPages) * PAGE_SIZE
            ),
            total: savedJobs.length,
            totalPages: savedTotalPages,
            page: Math.min(page, savedTotalPages),
          }
        : { jobs: [], total: 0, totalPages: 1, page: 1 };

  const resetPage =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const toggleBookmark = (job: JobPostingCard) => {
    if (tab === "saved") {
      toggleSavedJob(job.id);
      return;
    }
    setBookmarkOverrides((prev) => {
      const next = new Map(prev);
      next.set(job.id, !job.bookmarked);
      return next;
    });
  };

  const isRecommendedPending = tab === "recommended" && isLoading && !result;
  const recommendedError = tab === "recommended" && error && !isLoading;

  return (
    <div className="pb-6">
      <JobTabs
        value={tab}
        onChange={resetPage(setTab)}
        counts={{
          recommended: result?.tabCounts.recommended ?? 0,
          saved: result?.tabCounts.saved ?? 0,
          offers: 0,
        }}
      />

      {tab !== "offers" && (
        <div className="mb-6 flex items-center justify-between gap-4">
          {tab === "recommended" ? (
            <div className="flex items-center gap-3">
              {result && (
                <p className="text-[13px] leading-[19.5px] whitespace-nowrap text-[#64748b]">
                  {result.desiredJob ? (
                    <>
                      희망 직무{" "}
                      <strong className="font-bold text-[#0f172a]">
                        {result.desiredJob.name}
                      </strong>{" "}
                      기준
                    </>
                  ) : (
                    "희망 직무가 없어 전체 공고를 보여드려요"
                  )}
                </p>
              )}
              <FilterDropdown
                label="지역"
                options={REGION_OPTIONS}
                value={region}
                onChange={resetPage<RegionFilter>(setRegion)}
                width={160}
                menuWidth={180}
              />
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-4">
            <p className="text-[13px] leading-[19.5px] whitespace-nowrap text-[#64748b]">
              {tab === "recommended"
                ? "현재 조건에서 지원 가능한 공고 "
                : "저장한 공고 "}
              <strong className="font-bold text-[#0f172a]">
                {view.total}건
              </strong>
            </p>
            <FilterDropdown
              options={SORT_OPTIONS}
              value={sort}
              onChange={resetPage<JobSort>(setSort)}
              width={160}
              alignRight
            />
          </div>
        </div>
      )}

      {isRecommendedPending ? null : recommendedError ? (
        <EmptyJobs message={errorMessage(error)} />
      ) : view.jobs.length === 0 ? (
        <EmptyJobs message={EMPTY_MESSAGES[tab]} />
      ) : (
        <>
          <div
            className={`grid grid-cols-3 gap-x-15 gap-y-11 transition-opacity ${
              tab === "recommended" && isLoading ? "opacity-60" : ""
            }`}
          >
            {view.jobs.map((job) => (
              <JobCard
                key={job.id}
                category={job.industry ?? ""}
                dDay={formatDDay(job)}
                title={job.title}
                details={[job.education, job.location].filter(
                  (line): line is string => !!line
                )}
                salary={formatSalary(job)}
                company={job.company}
                bookmarkCount={job.bookmarkCount}
                isBookmarked={job.bookmarked}
                onBookmarkClick={() => toggleBookmark(job)}
                onDetailClick={() => navigate(`/jobs/${job.id}`)}
              />
            ))}
          </div>
          <Pagination
            page={view.page}
            totalPages={view.totalPages}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default JobChancePage;
