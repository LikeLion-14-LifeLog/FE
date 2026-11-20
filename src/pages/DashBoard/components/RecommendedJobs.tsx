import type { JobPosting } from "@/types/dashboard";
import JobCard from "./JobCard";
import TextLink from "./TextLink";

type RecommendedJobsProps = {
  jobs: JobPosting[];
  totalCount: number;
  /** 불러오는 중이면 "공고 없음" 문구를 띄우지 않는다 */
  loading?: boolean;
  /** 제목 아래 안내 문구 */
  description?: string;
  allJobsPath?: string;
  onJobClick?: (job: JobPosting) => void;
};

const formatSalaryRange = (min: number | null, max: number | null) =>
  min !== null && max !== null
    ? `${min.toLocaleString()} ~ ${max.toLocaleString()}만 원`
    : undefined;

/** 추천 공고 섹션 */
const RecommendedJobs = ({
  jobs,
  totalCount,
  loading = false,
  description = "희망 직무와 학력 기준 맞춤 공고 중 마감이 가까운 순서입니다.",
  allJobsPath = "/jobs",
  onJobClick,
}: RecommendedJobsProps) => {
  return (
    <section className="flex flex-col pt-[47px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col">
          <h2 className="text-[19px] leading-[28.5px] tracking-[-0.608px] text-text-primary">
            현재 내 조건으로 지원 가능한 추천 공고
          </h2>
          <p className="mt-2 text-[9px] leading-[13.5px] tracking-[0.096px] text-text-muted">
            {description}
          </p>
        </div>
        <TextLink
          to={allJobsPath}
          className="gap-2 py-1 font-normal"
          arrowClassName="w-[8.6px]"
        >
          맞춤 공고 전체보기 ({totalCount}건)
        </TextLink>
      </div>

      {!loading && jobs.length === 0 && (
        <p className="mt-[22px] rounded-[14px] border-[1.067px] border-[#e1e7e5] bg-white py-10 text-center text-[11px] text-text-muted">
          지금 내 조건에 맞는 모집 중인 공고가 없어요.
        </p>
      )}
      <ul className="mt-[22px] grid grid-cols-1 gap-[18px] md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <li key={job.id} className="flex">
            <JobCard
              title={job.title}
              company={job.company}
              location={job.location}
              dDay={job.dDay}
              salary={formatSalaryRange(job.salaryMin, job.salaryMax)}
              skills={job.skills}
              onDetailClick={onJobClick ? () => onJobClick(job) : undefined}
              className="min-h-[205px]"
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RecommendedJobs;
