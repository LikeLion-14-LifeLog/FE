import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ApiError } from "@/apis/client";
import { getJobPostingDetail } from "@/apis/jobPostings";
import type { JobPostingDetail } from "@/types/jobs";
import BookmarkButton from "./components/BookmarkButton";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const SEOUL_JOB_PORTAL_URL = "https://job.seoul.go.kr/";

/** "2026-11-05" 또는 "2026-11-05T23:59:00" → "2026.11.05 (목) 23:59" */
const formatDeadline = (closesAt: string) => {
  const [datePart, timePart] = closesAt.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()];
  const pad = (n: number) => String(n).padStart(2, "0");
  const time = timePart ? ` ${timePart.slice(0, 5)}` : "";
  return `${y}.${pad(m)}.${pad(d)} (${weekday})${time}`;
};

const formatDDay = ({ isClosed, daysLeft }: JobPostingDetail) => {
  if (isClosed || daysLeft === null || daysLeft < 0) return "마감";
  return daysLeft === 0 ? "D-Day" : `D-${daysLeft}`;
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

const DetailSection = ({
  title,
  lines,
  last = false,
}: {
  title: string;
  lines: string[];
  last?: boolean;
}) => (
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

const PANEL =
  "min-h-[720px] rounded-xl border border-[#e2e8f0] bg-white drop-shadow-[0px_1px_1.5px_rgba(15,23,42,0.04)]";

const DetailSkeleton = () => (
  <div
    className="flex animate-pulse items-start gap-[30px] pb-6"
    aria-busy="true"
    aria-label="공고 상세 불러오는 중"
  >
    <div className={`${PANEL} flex w-90 shrink-0 flex-col gap-4 px-5.5 py-6`}>
      <div className="h-6 w-2/3 rounded-full bg-slate-200/80" />
      <div className="h-4 w-1/3 rounded-full bg-slate-200/80" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="h-10 w-full rounded-lg bg-slate-200/60" />
      ))}
    </div>
    <div className={`${PANEL} flex min-w-0 flex-1 flex-col gap-4 px-9 py-[30px]`}>
      <div className="h-7 w-3/4 rounded-full bg-slate-200/80" />
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-4 w-full rounded-full bg-slate-200/60" />
      ))}
    </div>
  </div>
);

type LoadState = {
  jobId: string;
  detail: JobPostingDetail | null;
  error: unknown;
};

const JobDetailPage = () => {
  const { jobId = "" } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState | null>(null);
  // TODO: 공고 저장/저장취소 API 연동 시 제거 (현재는 화면에서만 토글)
  const [bookmarkOverride, setBookmarkOverride] = useState<{
    jobId: string;
    bookmarked: boolean;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getJobPostingDetail(jobId, controller.signal)
      .then((detail) => setState({ jobId, detail, error: null }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setState({ jobId, detail: null, error });
      });
    return () => controller.abort();
  }, [jobId]);

  if (!state || state.jobId !== jobId) return <DetailSkeleton />;

  if (state.error instanceof ApiError && state.error.status === 404)
    return <Navigate to="/jobs" replace />;

  const backButton = (
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
  );

  if (!state.detail) {
    const message =
      state.error instanceof ApiError && state.error.status === 401
        ? "로그인이 필요합니다."
        : "공고를 불러오지 못했습니다.";
    return (
      <div className="relative flex items-start gap-[30px] pb-6">
        {backButton}
        <p className={`${PANEL} flex flex-1 items-center justify-center text-[18px] font-extrabold text-[#0f172a]`}>
          {message}
        </p>
      </div>
    );
  }

  const job = state.detail;
  const isSaved =
    bookmarkOverride?.jobId === job.id
      ? bookmarkOverride.bookmarked
      : job.bookmarked;
  const bookmarkCount = Math.max(
    0,
    job.bookmarkCount + (isSaved === job.bookmarked ? 0 : isSaved ? 1 : -1)
  );

  return (
    <div className="relative flex items-start gap-[30px] pb-6">
      {backButton}

      <aside className={`${PANEL} relative flex w-90 shrink-0 flex-col px-5.5 py-6`}>
        <BookmarkButton
          count={bookmarkCount}
          isBookmarked={isSaved}
          onClick={() =>
            setBookmarkOverride({ jobId: job.id, bookmarked: !isSaved })
          }
          className="absolute top-[-1px] right-5.5"
        />
        <div className="border-b border-[#f1f5f9] pr-10 pb-3.5">
          <p className="truncate text-[18px] leading-[27px] font-extrabold tracking-[-0.4px] text-[#0f172a]">
            {job.company}
          </p>
          {job.companyDescription && (
            <p className="mt-0.5 text-[12.5px] leading-[18.75px] font-semibold text-[#64748b]">
              {job.companyDescription}
            </p>
          )}
        </div>

        <dl>
          <InfoRow label="포지션">
            <span className="font-bold">{job.position}</span>
          </InfoRow>
          <InfoRow label="급여 조건">
            <span className="font-extrabold text-[#0d9488]">
              {job.payText ?? "급여 정보 없음"}
            </span>
          </InfoRow>
          <InfoRow label="근무 지역">
            <span className="font-bold">{job.address ?? "-"}</span>
          </InfoRow>
          <InfoRow label="고용 형태">
            <span className="font-bold">{job.employmentType}</span>
          </InfoRow>
          <InfoRow label="접수 기한" last>
            <span className="font-extrabold">
              {job.closesAt === null ? (
                job.isClosed ? "마감" : "상시 채용"
              ) : (
                <>
                  {formatDeadline(job.closesAt)}{" "}
                  <span className="text-[#e01316]">({formatDDay(job)})</span>
                </>
              )}
            </span>
          </InfoRow>
        </dl>

        <a
          href={job.applyUrl ?? SEOUL_JOB_PORTAL_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-auto flex h-12 w-full items-center justify-center gap-1.5 rounded-lg border border-[#334155] bg-[#f8fafc] text-[14.5px] font-extrabold tracking-[-0.2px] text-[#334155] transition-colors hover:bg-[#f1f5f9]"
        >
          채용 공고 지원하기 <span aria-hidden>↗</span>
        </a>
      </aside>

      <article className={`${PANEL} min-w-0 flex-1 px-9 py-[30px]`}>
        <div className="max-w-[736px]">
          <h1 className="mb-[22px] border-b border-[#f1f5f9] pt-2.5 pb-[21px] text-[22px] leading-[28.6px] font-extrabold tracking-[-0.5px] text-[#0f172a]">
            {job.title}
          </h1>
          {job.sections.map((section, i) => (
            <DetailSection
              key={section.title}
              title={section.title}
              lines={section.lines}
              last={i === job.sections.length - 1}
            />
          ))}
        </div>
      </article>
    </div>
  );
};

export default JobDetailPage;
