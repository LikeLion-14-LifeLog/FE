import { useSyncExternalStore } from "react";

/**
 * 로그인한 사용자 정보 — API 연동 전 임시 구현.
 * "로그인 상태 유지"면 localStorage, 아니면 sessionStorage(탭을 닫으면 로그아웃)에 저장한다.
 * TODO: 백엔드 API 연동 시 토큰/세션 기반으로 교체
 */
export type CurrentUser = {
  nickname: string;
  email: string;
};

const STORAGE_KEY = "lifelog:currentUser";
const listeners = new Set<() => void>();

const read = (storage: Storage): CurrentUser | null => {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  } catch {
    return null;
  }
};

let currentUser: CurrentUser | null =
  read(localStorage) ?? read(sessionStorage);

const emit = () => listeners.forEach((listener) => listener());

export const login = (user: CurrentUser, keepLoggedIn = false) => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    (keepLoggedIn ? localStorage : sessionStorage).setItem(
      STORAGE_KEY,
      JSON.stringify(user),
    );
  } catch {
    // 저장소를 쓸 수 없는 환경이면 메모리에만 유지
  }
  currentUser = user;
  emit();
};

export const logout = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // 무시
  }
  currentUser = null;
  emit();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** 현재 로그인한 사용자 (없으면 null) */
export const useCurrentUser = () =>
  useSyncExternalStore(subscribe, () => currentUser);
