import { useSyncExternalStore } from "react";

/**
 * 로그인한 사용자 정보와 JWT Access Token.
 * "로그인 상태 유지"면 localStorage, 아니면 sessionStorage(탭을 닫으면 로그아웃)에 저장한다.
 */
export type CurrentUser = {
  nickname: string;
  email: string;
  accessToken: string;
};

const STORAGE_KEY = "lifelog:currentUser";
const listeners = new Set<() => void>();

type StorageSelector = () => Storage;

const getLocal: StorageSelector = () => localStorage;
const getSession: StorageSelector = () => sessionStorage;

/**
 * 저장소 접근을 try 안에서 수행한다.
 * 브라우저 정책으로 저장소가 막혀 있으면 localStorage/sessionStorage getter 자체가
 * SecurityError를 던질 수 있으므로, 저장소 객체도 반드시 try 안에서 꺼내야 한다.
 */
const withStorage = <T>(
  getStorage: StorageSelector,
  action: (storage: Storage) => T,
  fallback: T,
): T => {
  try {
    return action(getStorage());
  } catch {
    return fallback;
  }
};

const read = (getStorage: StorageSelector): CurrentUser | null =>
  withStorage(
    getStorage,
    (storage) => {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const user = JSON.parse(raw) as Partial<CurrentUser>;
      // 토큰이 없는 예전(Mock) 로그인 정보는 무효 처리
      return user.accessToken && user.email
        ? (user as CurrentUser)
        : null;
    },
    null,
  );

const remove = (getStorage: StorageSelector) =>
  withStorage(getStorage, (storage) => storage.removeItem(STORAGE_KEY), undefined);

let currentUser: CurrentUser | null = read(getLocal) ?? read(getSession);

const emit = () => listeners.forEach((listener) => listener());

export const login = (user: CurrentUser, keepLoggedIn = false) => {
  // 저장소를 쓸 수 없는 환경이면 메모리에만 유지
  remove(getLocal);
  remove(getSession);
  withStorage(
    keepLoggedIn ? getLocal : getSession,
    (storage) => storage.setItem(STORAGE_KEY, JSON.stringify(user)),
    undefined,
  );
  currentUser = user;
  emit();
};

export const logout = () => {
  remove(getLocal);
  remove(getSession);
  currentUser = null;
  emit();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** API 요청에 붙일 Access Token (비로그인이면 undefined) */
export const getAccessToken = () => currentUser?.accessToken;

/** 현재 로그인한 사용자 (없으면 null) */
export const useCurrentUser = () =>
  useSyncExternalStore(subscribe, () => currentUser);
