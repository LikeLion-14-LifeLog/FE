/**
 * 임시 계정 저장소 — 회원가입/로그인 API 연동 전까지 사용.
 * 이메일 → 닉네임만 이 브라우저(localStorage)에 저장한다. 비밀번호는 저장하지 않는다.
 * TODO: 백엔드 API 연동 시 이 파일을 제거하고 서버 응답의 닉네임을 사용
 */
const STORAGE_KEY = "lifelog:accounts";

type Accounts = Record<string, string>;

const normalize = (email: string) => email.trim().toLowerCase();

const readAccounts = (): Accounts => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Accounts) : {};
  } catch {
    return {};
  }
};

export const isRegistered = (email: string) =>
  normalize(email) in readAccounts();

export const saveAccount = (email: string, nickname: string): boolean => {
  const key = normalize(email);
  try {
    const accounts = readAccounts();
    accounts[key] = nickname;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    return false;
  }
  return readAccounts()[key] === nickname;
};

export const findNickname = (email: string): string | undefined =>
  readAccounts()[normalize(email)];
