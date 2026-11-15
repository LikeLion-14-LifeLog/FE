/**
 * 로그인 후 돌아갈 경로를 `?redirect=` 쿼리로 주고받는다.
 * 외부 사이트로 튀는 것을 막기 위해 같은 사이트 경로("/..." 이면서 "//..." 아님)만 허용한다.
 */
const REDIRECT_KEY = "redirect";

const isSafePath = (path: string | null): path is string =>
  !!path && path.startsWith("/") && !path.startsWith("//");

/** 현재 URL의 쿼리에서 안전한 redirect 경로를 꺼낸다 (없으면 null) */
export const getRedirect = (search: string): string | null => {
  const value = new URLSearchParams(search).get(REDIRECT_KEY);
  return isSafePath(value) ? value : null;
};

/** path 뒤에 redirect 쿼리를 붙인다 (redirect가 없으면 path 그대로) */
export const withRedirect = (path: string, redirect: string | null) =>
  isSafePath(redirect)
    ? `${path}?${new URLSearchParams({ [REDIRECT_KEY]: redirect })}`
    : path;
