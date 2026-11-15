import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  getBookmarkCount,
  toggleSavedJob,
  useSavedJobIds,
} from "@/store/savedJobsStore";
import BookmarkButton from "./components/BookmarkButton";
// TODO: API 연동 후 목데이터 제거
import { getMockJobDetail, MOCK_JOBS } from "./mockData";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const SEOUL_JOB_PORTAL_URL = "https://job.seoul.go.kr/";

const formatDeadline = (daysLeft: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysLeft);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} (${WEEKDAYS[date.getDay()]}) 23:59`;
};

const InfoRow = ({
  label,
  children,
  last = false,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) => (
  <div
    className={`flex flex-col gap-[3px] py-2.5 ${last ? "" : "border-b border-[#f1f5f9]"}`}
  >
    <dt className="text-[11.5px] leading-[17.25px] font-semibold tracking-[-0.1px] text-[#64748b]">
      {label}
    </dt>
    <dd className="text-[14px] leading-[21px] tracking-[-0.2px] text-[#0f172a]">
      {children}
    </dd>
  </div>
);

const splitLines = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const DetailSection = ({
  title,
  text,
  last = false,
}: {
  title: string;
  text: string;
  last?: boolean;
}) => {
  const lines = splitLines(text);
  if (lines.length === 0) return null;

  return (
    <section className={last ? "" : "mb-5 border-b border-[#f1f5f9] pb-5"}>
      <h2 className="mb-2.5 flex items-center gap-2 text-[13.5px] leading-[20.25px] font-extrabold tracking-[-0.3px] text-[#0f172a]">
        <span aria-hidden className="h-[13px] w-[3px] rounded-[2px] bg-[#0d9488]" />
        {title}
      </h2>
      <div className="flex flex-col gap-2 text-[13px] leading-[19.5px] text-[#334155]">
        {lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </section>
  );
};

const JobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const savedIds = useSavedJobIds();
  const job = MOCK_JOBS.find((j) => j.id === jobId);

  if (!job) return <Navigate to="/jobs" replace />;

  const detail = getMockJobDetail(job);
  const isSaved = savedIds.has(job.id);

  return (
    <div className="relative flex items-start gap-[30px] pb-6">
      <button
        type="button"
        onClick={() => navigate("/jobs")}
        className="absolute top-1/2 right-full mr-4 flex -translate-y-1/2 cursor-pointer flex-col items-center gap-2 max-[1249px]:static max-[1249px]:mr-0 max-[1249px]:translate-y-0 min-[1440px]:mr-[67px]"
      >
        <span className="flex size-12 items-center justify-center rounded-full border border-[#e2e8f0] bg-white shadow-[0px_6px_16px_0px_rgba(15,23,41,0.08)] transition-colors hover:bg-[#f8fafc]">
          <img src="/jobs/backArrow.svg" alt="" className="size-5" />
        </span>
        <span className="text-[12px] font-medium text-[#64748b]">목록</span>
      </button>

        <aside className="relative flex min-h-[720px] w-90 shrink-0 flex-col rounded-xl border border-[#e2e8f0] bg-white px-5.5 py-6 drop-shadow-[0px_1px_1.5px_rgba(15,23,42,0.04)]">
          <BookmarkButton
            count={getBookmarkCount(job, savedIds)}
            isBookmarked={isSaved}
            onClick={() => toggleSavedJob(job.id)}
            className="absolute top-[-1px] right-5.5"
          />
          <div className="border-b border-[#f1f5f9] pr-10 pb-3.5">
            <p className="truncate text-[18px] leading-[27px] font-extrabold tracking-[-0.4px] text-[#0f172a]">
              {job.company}
            </p>
            <p className="mt-0.5 text-[12.5px] leading-[18.75px] font-semibold text-[#64748b]">
              {detail.companyDescription}
            </p>
          </div>

          <dl>
            <InfoRow label="포지션">
              <span className="font-bold">{detail.position}</span>
            </InfoRow>
            <InfoRow label="급여 조건">
              <span className="font-extrabold text-[#0d9488]">
                {job.salaryMin.toLocaleString()}만 ~ {job.salaryMax.toLocaleString()}만 원 (
                {detail.salaryNote})
              </span>
            </InfoRow>
            <InfoRow label="근무 지역">
              <span className="font-bold">{detail.address}</span>
            </InfoRow>
            <InfoRow label="고용 형태">
              <span className="font-bold">{detail.employmentType}</span>
            </InfoRow>
            <InfoRow label="접수 기한" last>
              <span className="font-extrabold">
                {job.daysLeft === null ? (
                  "상시 채용"
                ) : (
                  <>
                    {formatDeadline(job.daysLeft)}{" "}
                    <span className="text-[#e01316]">(D-{job.daysLeft})</span>
                  </>
                )}
              </span>
            </InfoRow>
          </dl>

          <a
            href={detail.applyUrl ?? SEOUL_JOB_PORTAL_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-auto flex h-12 w-full items-center justify-center gap-1.5 rounded-lg border border-[#334155] bg-[#f8fafc] text-[14.5px] font-extrabold tracking-[-0.2px] text-[#334155] transition-colors hover:bg-[#f1f5f9]"
          >
            채용 공고 지원하기 <span aria-hidden>↗</span>
          </a>
        </aside>

        <article className="min-h-[720px] min-w-0 flex-1 rounded-xl border border-[#e2e8f0] bg-white px-9 py-[30px] drop-shadow-[0px_1px_1.5px_rgba(15,23,42,0.04)]">
          <div className="max-w-[736px]">
            <h1 className="mb-[22px] border-b border-[#f1f5f9] pt-2.5 pb-[21px] text-[22px] leading-[28.6px] font-extrabold tracking-[-0.5px] text-[#0f172a]">
              {job.title}
            </h1>
            <DetailSection title="주요 업무" text={detail.duties} />
            <DetailSection title="지원 요건" text={detail.requirements} />
            <DetailSection title="근무 환경 및 혜택" text={detail.benefits} last />
          </div>
        </article>
    </div>
  );
};

export default JobDetailPage;
