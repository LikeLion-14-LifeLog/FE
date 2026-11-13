interface EmptyJobsProps {
  message?: string;
}

export default function EmptyJobs({
  message = "조건에 맞는 기업의 공고가 없습니다.",
}: EmptyJobsProps) {
  return (
    <div className="flex flex-col items-center pt-[154px] pb-12">
      <img
        src="/jobs/emptyIcon.svg"
        alt=""
        className="h-[210px] w-120 max-w-full"
        draggable={false}
      />
      <p className="mt-2 text-[22px] leading-[30px] font-extrabold tracking-[-0.5px] text-[#0f172a]">
        {message}
      </p>
    </div>
  );
}
