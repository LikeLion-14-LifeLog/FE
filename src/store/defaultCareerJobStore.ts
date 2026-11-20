/**
 * 사용자가 처음 스펙을 등록할 때 고른 희망 직무.
 * 커리어 경로 페이지에서 "출발 직업" 초기값으로 쓴다.
 * 처음 한 번만 저장하고, 이후 스펙을 수정해도 바꾸지 않는다.
 */
export type DefaultCareerJob = {
  jobId: number | null;
  /** 직무 검색 응답의 직업 코드 (서버 조회로 불러온 스펙에는 없을 수 있음) */
  code?: string;
  name: string;
};

const key = (email: string) =>
  `lifelog:defaultCareerJob:${email.trim().toLowerCase()}`;

export const getDefaultCareerJob = (email: string): DefaultCareerJob | null => {
  try {
    const raw = localStorage.getItem(key(email));
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<DefaultCareerJob>;
    return typeof data.name === "string" && data.name
      ? {
          jobId: typeof data.jobId === "number" ? data.jobId : null,
          code: typeof data.code === "string" ? data.code : undefined,
          name: data.name,
        }
      : null;
  } catch {
    return null;
  }
};

/** 아직 저장된 값이 없을 때만 저장 (처음 등록한 직무 유지) */
export const saveDefaultCareerJobOnce = (
  email: string,
  job: DefaultCareerJob,
) => {
  if (!job.name.trim() || getDefaultCareerJob(email)) return;
  try {
    localStorage.setItem(key(email), JSON.stringify(job));
  } catch {
    // 저장소를 쓸 수 없으면 기본 출발 직업으로 대체
  }
};
