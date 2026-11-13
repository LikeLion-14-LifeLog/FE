import { useSyncExternalStore } from "react";
import type { JobPosting } from "@/types/jobs";
// TODO: API 연동 시 저장 목록·찜 수는 서버 값으로 교체
import { INITIAL_SAVED_IDS } from "@/pages/JobChance/mockData";

const initialSaved = new Set(INITIAL_SAVED_IDS);
let savedIds: ReadonlySet<string> = new Set(INITIAL_SAVED_IDS);
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const toggleSavedJob = (id: string) => {
  const next = new Set(savedIds);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  savedIds = next;
  listeners.forEach((listener) => listener());
};

export const useSavedJobIds = () =>
  useSyncExternalStore(subscribe, () => savedIds);

export const getBookmarkCount = (
  job: JobPosting,
  saved: ReadonlySet<string>
) => {
  const wasSaved = initialSaved.has(job.id);
  const isSaved = saved.has(job.id);
  if (isSaved === wasSaved) return job.bookmarkCount;
  return job.bookmarkCount + (isSaved ? 1 : -1);
};
