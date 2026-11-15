import type { JobPosting } from "@/types/dashboard";
import JobCard from "./JobCard";
import TextLink from "./TextLink";

type RecommendedJobsProps = {
  jobs: JobPosting[];
  totalCount: number;
  allJobsPath?: string;
  onJobClick?: (job: JobPosting) => void;
};

const formatSalaryRange = (min: number, max: number) =>
  `${min.toLocaleString()} ~ ${max.toLocaleString()}만 원`;

/** 추천 공고 섹션 */
const RecommendedJobs = ({
  jobs,
  totalCount,
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
            현재 보유 스펙 기준 서류 통과율 80% 이상 추천 공고입니다.
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
