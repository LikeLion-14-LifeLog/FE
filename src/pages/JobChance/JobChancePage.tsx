import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBookmarkCount,
  toggleSavedJob,
  useSavedJobIds,
} from "@/store/savedJobsStore";
import type { JobPosting, JobSort, JobTab } from "@/types/jobs";
import EmptyJobs from "./components/EmptyJobs";
import FilterDropdown from "./components/FilterDropdown";
import JobCard from "./components/JobCard";
import JobRolePicker from "./components/JobRolePicker";
import JobTabs from "./components/JobTabs";
import Pagination from "./components/Pagination";
import {
  DEFAULT_JOB_ROLE,
  DEFAULT_REGION,
  JOB_ROLE_CATEGORIES,
  JOB_ROLES,
  MOCK_JOBS,
  REGION_FILTERS,
  REGION_OPTIONS,
  SORT_OPTIONS,
} from "./mockData";

const PAGE_SIZE = 6;

const EMPTY_MESSAGES: Record<JobTab, string> = {
  recommended: "조건에 맞는 기업의 공고가 없습니다.",
  saved: "아직 저장한 공고가 없습니다.",
  offers: "추후 확장 예정입니다.",
};

// TODO: 받은 제안 API 연동
const OFFERS: JobPosting[] = [];

const matchesRegion = (job: JobPosting, region: string) => {
  const prefixes = REGION_FILTERS.find((r) => r.label === region)?.match ?? [];
  return prefixes.length === 0 || prefixes.some((p) => job.location.startsWith(p));
};

const sortJobs = (jobs: JobPosting[], sort: JobSort) =>
  [...jobs].sort((a, b) =>
    sort === "latest"
      ? (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity)
      : b.bookmarkCount - a.bookmarkCount
  );

const JobChancePage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<JobTab>("recommended");
  const [jobRole, setJobRole] = useState(DEFAULT_JOB_ROLE);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [sort, setSort] = useState<JobSort>("latest");
  const [page, setPage] = useState(1);
  const savedIds = useSavedJobIds();
  const jobs = useMemo(
    () =>
      MOCK_JOBS.map((job) => ({
        ...job,
        bookmarkCount: getBookmarkCount(job, savedIds),
      })),
    [savedIds]
  );

  const visibleJobs = useMemo(() => {
    if (tab === "offers") return OFFERS;
    const base =
      tab === "saved"
        ? jobs.filter((job) => savedIds.has(job.id))
        : jobs.filter(
            (job) =>
              (jobRole === "전체" || job.jobRole === jobRole) &&
              matchesRegion(job, region)
          );
    return sortJobs(base, sort);
  }, [tab, jobs, savedIds, jobRole, region, sort]);

  const totalPages = Math.max(1, Math.ceil(visibleJobs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageJobs = visibleJobs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="pb-6">
      <JobTabs
        value={tab}
        onChange={resetPage(setTab)}
        counts={{
          recommended: jobs.length,
          saved: savedIds.size,
          offers: OFFERS.length,
        }}
      />

      {tab !== "offers" && (
        <div className="mb-6 flex items-center justify-between gap-4">
          {tab === "recommended" ? (
            <div className="flex items-center gap-2">
              <JobRolePicker
                categories={JOB_ROLE_CATEGORIES}
                roles={JOB_ROLES}
                value={jobRole}
                onChange={resetPage(setJobRole)}
              />
              <FilterDropdown
                label="지역"
                options={REGION_OPTIONS}
                value={region}
                onChange={resetPage(setRegion)}
                width={160}
                menuWidth={180}
              />
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-4">
            <p className="text-[13px] leading-[19.5px] whitespace-nowrap text-[#64748b]">
              {tab === "recommended" ? "현재 조건에서 지원 가능한 공고 " : "저장한 공고 "}
              <strong className="font-bold text-[#0f172a]">
                {visibleJobs.length}건
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

      {pageJobs.length === 0 ? (
        <EmptyJobs message={EMPTY_MESSAGES[tab]} />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-x-15 gap-y-11">
            {pageJobs.map((job) => (
              <JobCard
                key={job.id}
                category={job.industry}
                dDay={job.daysLeft === null ? "상시" : `D-${job.daysLeft}`}
                title={job.title}
                details={[job.education, job.location]}
                salary={`예상 초봉 ${job.salaryMin.toLocaleString()}만 ~ ${job.salaryMax.toLocaleString()}만 원`}
                company={job.company}
                bookmarkCount={job.bookmarkCount}
                isBookmarked={savedIds.has(job.id)}
                onBookmarkClick={() => toggleSavedJob(job.id)}
                onDetailClick={() => navigate(`/jobs/${job.id}`)}
              />
            ))}
          </div>
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
};

export default JobChancePage;
