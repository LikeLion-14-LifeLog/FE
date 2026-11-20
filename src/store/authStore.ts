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

/** 현재 세션이 어디에 저장돼 있는지. local 만 다른 탭과 공유된다. */
type SessionSource = "local" | "session" | "memory";

const initialLocal = read(getLocal);
let currentUser: CurrentUser | null = initialLocal ?? read(getSession);
let currentSource: SessionSource | null = initialLocal
  ? "local"
  : currentUser
    ? "session"
    : null;

const emit = () => listeners.forEach((listener) => listener());

const isSameUser = (a: CurrentUser | null, b: CurrentUser | null) =>
  a?.accessToken === b?.accessToken && a?.email === b?.email;

/**
 * 다른 탭에서 "로그인 상태 유지" 세션(localStorage)이 바뀌면 따라간다.
 * 이 탭에만 있는 sessionStorage/메모리 세션은 건드리지 않는다.
 */
const syncFromOtherTab = (event: StorageEvent) => {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  if (!withStorage(getLocal, (storage) => event.storageArea === storage, false))
    return;
  if (currentSource !== null && currentSource !== "local") return;

  const next = read(getLocal);
  if (isSameUser(currentUser, next)) return;
  currentUser = next;
  currentSource = next ? "local" : null;
  emit();
};

if (typeof window !== "undefined")
  window.addEventListener("storage", syncFromOtherTab);

export const login = (user: CurrentUser, keepLoggedIn = false) => {
  // 쓸 저장소는 덮어쓰고 다른 쪽만 지운다 (다른 탭에 로그아웃→로그인 이벤트가 연달아 가지 않게)
  const target = keepLoggedIn ? getLocal : getSession;
  remove(keepLoggedIn ? getSession : getLocal);
  const saved = withStorage(
    target,
    (storage) => {
      storage.setItem(STORAGE_KEY, JSON.stringify(user));
      return true;
    },
    false,
  );
  // 저장소를 쓸 수 없는 환경이면 남은 예전 세션을 지우고 메모리에만 유지
  if (!saved) remove(target);
  currentUser = user;
  currentSource = saved ? (keepLoggedIn ? "local" : "session") : "memory";
  emit();
};

export const logout = () => {
  remove(getLocal);
  remove(getSession);
  currentUser = null;
  currentSource = null;
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
