import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import SalaryChart from "@/components/SalaryChart";
import chevronDown from "@/assets/icons/chevronDown.svg";
import { getDiagnosisView, type DiagnosisViewState } from "@/apis/diagnosis";
import { useCurrentUser } from "@/store/authStore";
import type { SalaryResult } from "@/types/diagnosis";

const formatSalary = (won: number) =>
  (won / 10000).toLocaleString("ko-KR", { maximumFractionDigits: 1 });

const validSalaries = (items: SalaryResult[] | undefined) =>
  Array.isArray(items) &&
  items.length === 3 &&
  [0, 3, 5].every(
    (year) =>
      items.filter(
        (item) =>
          item.annual === year &&
          Number.isFinite(item.annualIncomeMin) &&
          Number.isFinite(item.annualIncomeExpected) &&
          Number.isFinite(item.annualIncomeMax) &&
          item.annualIncomeMin > 0 &&
          item.annualIncomeMin <= item.annualIncomeExpected &&
          item.annualIncomeExpected <= item.annualIncomeMax
      ).length === 1
  );

function UnavailableResult({ message }: { message: string }) {
  return (
    <section className="flex min-h-[320px] flex-col items-center justify-center text-center">
      <h2 className="text-[18px] font-semibold text-text-primary">
        진단 결과를 표시할 수 없습니다
      </h2>
      <p className="mt-3 text-[12px] leading-5 text-text-secondary">
        {message}
      </p>
      <Link
        to="/spec"
        className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-text-primary px-5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        스펙 등록으로 돌아가기
      </Link>
    </section>
  );
}

export default function DiagnosisResultPage() {
  const [params] = useSearchParams();
  const user = useCurrentUser();
  const runId = Number(params.get("runId"));
  const email = user?.email;
  const requestKey = `${email ?? ""}:${runId}`;
  const [request, setRequest] = useState<{
    key: string;
    result: DiagnosisViewState | null;
    error: boolean;
  } | null>(null);
  const [retry, setRetry] = useState(0);
  const validRequest = !!email && Number.isSafeInteger(runId) && runId > 0;

  useEffect(() => {
    if (!email || !Number.isSafeInteger(runId) || runId <= 0) return;
    let active = true;
    getDiagnosisView(email, runId)
      .then((result) => {
        if (active) setRequest({ key: requestKey, result, error: false });
      })
      .catch(() => {
        if (active) setRequest({ key: requestKey, result: null, error: true });
      });
    return () => {
      active = false;
    };
  }, [email, runId, requestKey, retry]);

  if (validRequest && request?.key !== requestKey) {
    return (
      <p
        role="status"
        className="py-12 text-center text-[12px] text-text-secondary"
      >
        진단 결과를 불러오는 중입니다.
      </p>
    );
  }

  if (validRequest && request?.error) {
    return (
      <section className="flex min-h-[320px] flex-col items-center justify-center text-center">
        <h2 className="text-[18px] font-semibold text-text-primary">
          결과 조회에 실패했습니다
        </h2>
        <p className="mt-3 text-[12px] text-text-secondary">
          잠시 후 다시 시도해 주세요.
        </p>
        <button
          type="button"
          onClick={() => {
            setRequest(null);
            setRetry((value) => value + 1);
          }}
          className="mt-6 rounded-lg bg-text-primary px-5 py-3 text-[12px] font-semibold text-white"
        >
          다시 시도
        </button>
      </section>
    );
  }

  const result = validRequest ? request?.result : null;
  if (result?.status === "pending") {
    return <Navigate to={`/diagnosis/loading?runId=${runId}`} replace />;
  }
  if (result?.status === "not-found") {
    return <UnavailableResult message="분석 실행 이력을 찾을 수 없습니다." />;
  }
  if (result?.status === "failed") {
    return (
      <UnavailableResult message="연봉 분석이 실패했습니다. 스펙을 확인하고 다시 진단해 주세요." />
    );
  }
  if (result?.status === "canceled") {
    return (
      <UnavailableResult message="취소된 분석입니다. 스펙 등록 화면에서 다시 진단해 주세요." />
    );
  }

  const data = result?.status === "completed" ? result.data : null;
  if (
    !data ||
    !validSalaries(data.salaryResults) ||
    !data.comparisonGroup ||
    !Array.isArray(data.specRows)
  ) {
    return (
      <UnavailableResult message="완료된 분석 결과가 없거나 연봉 정보가 올바르지 않습니다." />
    );
  }

  const {
    salaryResults,
    comparisonGroup,
    specRows,
    recommendation,
    salaryNotice,
  } = data;
  const startingSalary = salaryResults.find(
    (item) => item.annual === 0
  )!.annualIncomeExpected;
  const chartData = salaryResults.map((item) => ({
    year: item.annual,
    salary: item.annualIncomeExpected,
    lower: item.annualIncomeMin,
    upper: item.annualIncomeMax,
  }));

  return (
    <section className="w-full">
      <div className="mb-5">
        <p className="pt-[7px] text-[10px] font-extrabold uppercase leading-[15px] tracking-[1.6px] text-brand-strong">
          SALARY DIAGNOSIS REPORT
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-[30px] font-extrabold leading-[37.5px] tracking-[-0.6px] text-text-primary">
            내 조건 기반 예상 연봉 진단 결과
          </h1>
          <Link
            to="/spec?edit=1"
            className="inline-flex h-11 min-w-[142px] items-center justify-center rounded-lg bg-text-primary px-6 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            다시 진단하기
          </Link>
        </div>
        <p className="mt-2 text-[15.5px] leading-6 text-text-secondary">
          등록한 스펙을 바탕으로 분석 결과를 확인합니다.
        </p>
      </div>
      <section
        aria-label="예상 연봉 요약"
        className="mt-5 grid grid-cols-1 gap-y-6 border-b border-border pb-4 sm:grid-cols-3 sm:gap-y-0"
      >
        {salaryResults.map((item, index) => (
          <div
            key={item.annual}
            className={
              index === 0
                ? "sm:pr-7"
                : index === 1
                  ? "sm:border-l sm:border-border sm:px-7"
                  : "sm:border-l sm:border-border sm:pl-7"
            }
          >
            <p className="text-[12px] font-medium text-text-secondary">
              {item.annual === 0
                ? "첫 취업 초봉 예상"
                : `취업 ${item.annual}년 차 예상`}
            </p>
            <p
              className={`mt-2 text-[32px] font-bold leading-tight tracking-[-0.04em] ${
                index === 0 ? "text-brand-strong" : "text-text-primary"
              }`}
            >
              {formatSalary(item.annualIncomeExpected)}
              <span className="ml-0.5 text-[12px] font-semibold tracking-normal">
                만원
              </span>
            </p>
            <p className="mt-2 text-[11px] leading-5 text-text-muted">
              {item.annual === 0
                ? `${formatSalary(item.annualIncomeMin)}만 ~ ${formatSalary(item.annualIncomeMax)}만 원`
                : `${item.annualIncomeExpected >= startingSalary ? "+" : ""}${formatSalary(item.annualIncomeExpected - startingSalary)}만 원 성장`}
              {item.topPercent !== null && (
                <span className="ml-1 font-semibold text-brand-strong">
                  (비교 표본 내 상위 {item.topPercent}%)
                </span>
              )}
            </p>
          </div>
        ))}
      </section>

      <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] lg:gap-8">
        <section aria-labelledby="salary-trend-title" className="min-w-0">
          <h2
            id="salary-trend-title"
            className="text-[16px] font-semibold text-text-primary"
          >
            연차별 연봉 추이
          </h2>
          <p className="mt-2 text-[11px] text-text-secondary">
            분석 당시 스펙 기준 예상 연봉 변화
          </p>
          <div className="mt-4">
            <SalaryChart data={chartData} />
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-text-muted">
            {salaryNotice}
          </p>
        </section>

        <section
          aria-labelledby="diagnosis-detail-title"
          className="flex min-w-0 flex-col"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="diagnosis-detail-title"
              className="text-[16px] font-semibold text-text-primary"
            >
              분석 기준 및 스펙 점검
            </h2>
            <Link
              to="/salary"
              state={{
                diagnosisSalaryResults: salaryResults,
                diagnosisRunId: runId,
              }}
              className="inline-flex shrink-0 items-center gap-2 text-[12px] font-semibold text-brand-strong transition-opacity hover:opacity-70"
            >
              조건을 바꿔서 비교해보기
              <span aria-hidden="true" className="text-[17px]">
                →
              </span>
            </Link>
          </div>
          <div className="mt-6">
            <h3 className="text-[13px] font-semibold text-text-primary">
              비교 기준 집단
            </h3>
            <p className="mt-2 text-[12px] font-medium text-text-secondary">
              {comparisonGroup.jobSubCategoryName} ·{" "}
              {comparisonGroup.sampleCount.toLocaleString("ko-KR")}명
            </p>
            <p className="mt-1 text-[11px] leading-5 text-text-muted">
              {comparisonGroup.description}
            </p>
            <p className="mt-1 text-[10px] text-text-muted">
              관측 연도: {comparisonGroup.observationYears.join(", ")}
            </p>
          </div>

          <details className="group mt-5 border-y border-border py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-text-primary">
                  진단에 반영된 내 스펙
                </span>
                <span className="text-[11px] font-medium text-brand-strong group-open:hidden">
                  펼치기
                </span>
                <span className="hidden text-[11px] font-medium text-brand-strong group-open:inline">
                  접기
                </span>
              </span>
              <img
                src={chevronDown}
                alt=""
                className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <dl className="mt-6 space-y-5">
              {specRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[64px_minmax(0,1fr)] items-start gap-3"
                >
                  <dt className="text-[12px] text-text-muted">{row.label}</dt>
                  <dd className="min-w-0 text-right text-[12px] font-semibold leading-5 text-text-primary">
                    {row.value || "없음"}
                  </dd>
                </div>
              ))}
            </dl>
          </details>
          <div className="mt-5">
            <h3 className="text-[13px] font-semibold text-text-primary">
              연봉 성장을 위해 보완하면 좋은 점
            </h3>
            <p className="mt-2 text-[11px] leading-5 text-text-secondary">
              {recommendation}
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}
