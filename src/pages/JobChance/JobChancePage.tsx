import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "@/apis/client";
import {
  getBookmarkedJobPostings,
  getJobPostings,
  setJobPostingBookmark,
  type BookmarkedJobPostingList,
  type JobPostingList,
} from "@/apis/jobPostings";
import { useCurrentUser } from "@/store/authStore";
import type { JobPostingCard, JobSort, JobTab } from "@/types/jobs";
import EmptyJobs from "./components/EmptyJobs";
import FilterDropdown from "./components/FilterDropdown";
import JobCard from "./components/JobCard";
import JobTabs from "./components/JobTabs";
import Pagination from "./components/Pagination";
import {
  ALL_REGION,
  DEFAULT_REGION,
  DEFAULT_SORT,
  DEFAULT_TAB,
  JOB_TABS,
  REGION_OPTIONS,
  SORT_OPTIONS,
  type RegionFilter,
} from "@/constants/jobs";

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

/** URL 쿼리 값이 허용 목록에 있으면 그대로, 아니면 기본값 */
const pick = <T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T
): T => (allowed.includes(value as T) ? (value as T) : fallback);

const REGION_VALUES = REGION_OPTIONS.map((option) => option.value);
const SORT_VALUES = SORT_OPTIONS.map((option) => option.value);

type LoadResult =
  | { key: string; tab: "recommended"; data: JobPostingList; error: null }
  | { key: string; tab: "saved"; data: BookmarkedJobPostingList; error: null }
  | { key: string; tab: JobTab; data: null; error: unknown };

const JobChancePage = () => {
  const navigate = useNavigate();
  // 탭·지역·정렬·페이지는 URL 쿼리에 보관해 새로고침해도 유지한다
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = pick(searchParams.get("tab"), JOB_TABS, DEFAULT_TAB);
  const region = pick(searchParams.get("region"), REGION_VALUES, DEFAULT_REGION);
  const sort = pick(searchParams.get("sort"), SORT_VALUES, DEFAULT_SORT);
  const page = Math.max(1, Math.floor(Number(searchParams.get("page"))) || 1);

  /** 쿼리 갱신. page 를 지정하지 않으면 1페이지로 돌아간다. */
  const updateQuery = (next: {
    tab?: JobTab;
    region?: RegionFilter;
    sort?: JobSort;
    page?: number;
  }) => {
    const merged = { tab, region, sort, page: 1, ...next };
    const params = new URLSearchParams();
    if (merged.tab !== DEFAULT_TAB) params.set("tab", merged.tab);
    if (merged.region !== DEFAULT_REGION) params.set("region", merged.region);
    if (merged.sort !== DEFAULT_SORT) params.set("sort", merged.sort);
    if (merged.page > 1) params.set("page", String(merged.page));
    setSearchParams(params, { replace: true });
  };

  // 로그인/로그아웃으로 토큰이 바뀌면 다시 불러온다
  const accessToken = useCurrentUser()?.accessToken;
  // 북마크 변경 후 목록·개수를 새로 받기 위한 값
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(
    new Set()
  );
  const queryKey = `${tab}|${region}|${sort}|${page}|${accessToken ?? ""}|${reloadKey}`;
  const [loaded, setLoaded] = useState<LoadResult | null>(null);
  const [recommended, setRecommended] = useState<JobPostingList | null>(null);
  const isLoading = loaded?.key !== queryKey;

  useEffect(() => {
    if (tab === "offers") return;
    const controller = new AbortController();
    const key = `${tab}|${region}|${sort}|${page}|${accessToken ?? ""}|${reloadKey}`;
    const request =
      tab === "recommended"
        ? getJobPostings({
            region: region === ALL_REGION ? undefined : region,
            sort,
            page,
            size: PAGE_SIZE,
            signal: controller.signal,
          }).then((data) => {
            setRecommended(data);
            setLoaded({ key, tab, data, error: null });
          })
        : getBookmarkedJobPostings({
            page,
            size: PAGE_SIZE,
            signal: controller.signal,
          }).then((data) => setLoaded({ key, tab, data, error: null }));
    request.catch((error: unknown) => {
      if (!controller.signal.aborted)
        setLoaded({ key, tab, data: null, error });
    });
    return () => controller.abort();
  }, [tab, region, sort, page, accessToken, reloadKey]);

  const current = loaded?.tab === tab ? loaded : null;
  const error = current?.error ?? null;
  const view =
    tab === "offers" || !current?.data
      ? { jobs: [] as JobPostingCard[], total: 0, totalPages: 1 }
      : {
          jobs: current.data.jobs,
          total: current.data.totalElements,
          totalPages: Math.max(1, current.data.totalPages),
        };

  const toggleBookmark = async (job: JobPostingCard) => {
    if (pendingIds.has(job.id)) return;
    setPendingIds((prev) => new Set(prev).add(job.id));
    try {
      await setJobPostingBookmark(job.id, !job.bookmarked);
      setReloadKey((value) => value + 1);
    } catch {
      // 실패하면 화면 상태를 그대로 둔다
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(job.id);
        return next;
      });
    }
  };

  const isPending = tab !== "offers" && isLoading && !current;
  const listError = tab !== "offers" && error && !isLoading;

  return (
    <div className="pb-6">
      <JobTabs
        value={tab}
        onChange={(next) => updateQuery({ tab: next })}
        counts={{
          recommended: recommended?.tabCounts.recommended ?? 0,
          saved:
            current?.tab === "saved" && current.data
              ? current.data.totalElements
              : (recommended?.tabCounts.saved ?? 0),
          offers: 0,
        }}
      />

      {tab !== "offers" && (
        <div className="mb-6 flex items-center justify-between gap-4">
          {tab === "recommended" ? (
            <div className="flex items-center gap-3">
              {recommended && (
                <p className="text-[13px] leading-[19.5px] whitespace-nowrap text-[#64748b]">
                  {recommended.desiredJob ? (
                    <>
                      희망 직무{" "}
                      <strong className="font-bold text-[#0f172a]">
                        {recommended.desiredJob.name}
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
                onChange={(next) => updateQuery({ region: next })}
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
              onChange={(next) => updateQuery({ sort: next })}
              width={160}
              alignRight
            />
          </div>
        </div>
      )}

      {isPending ? null : listError ? (
        <EmptyJobs message={errorMessage(error)} />
      ) : view.jobs.length === 0 ? (
        <EmptyJobs message={EMPTY_MESSAGES[tab]} />
      ) : (
        <>
          <div
            className={`grid grid-cols-3 gap-x-15 gap-y-11 transition-opacity ${
              isLoading ? "opacity-60" : ""
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
            page={Math.min(page, view.totalPages)}
            totalPages={view.totalPages}
            onChange={(next) => updateQuery({ page: next })}
          />
        </>
      )}
    </div>
  );
};

export default JobChancePage;
