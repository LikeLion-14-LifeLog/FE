export const DIAGNOSIS_STORAGE_KEY = "lifelog:diagnosis:mock";
export const DIAGNOSIS_CANCEL_DELAY_MS = 15_000;
export const DIAGNOSIS_COMPLETE_DELAY_MS = 26_000;

const DIAGNOSIS_SESSION_MAX_AGE_MS = 30 * 60 * 1000;

type MockDiagnosisSession = {
  startedAt: number;
};

export function getMockDiagnosisSession(): MockDiagnosisSession | null {
  try {
    const saved = sessionStorage.getItem(DIAGNOSIS_STORAGE_KEY);
    if (!saved) return null;

    const session: unknown = JSON.parse(saved);

    if (
      !session ||
      typeof session !== "object" ||
      !("startedAt" in session) ||
      typeof session.startedAt !== "number" ||
      !Number.isFinite(session.startedAt) ||
      session.startedAt > Date.now() ||
      Date.now() - session.startedAt > DIAGNOSIS_SESSION_MAX_AGE_MS
    ) {
      clearMockDiagnosisSession();
      return null;
    }

    return { startedAt: session.startedAt };
  } catch {
    clearMockDiagnosisSession();
    return null;
  }
}

export function startMockDiagnosis(): MockDiagnosisSession {
  const session = { startedAt: Date.now() };

  try {
    sessionStorage.setItem(DIAGNOSIS_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // 저장소를 사용할 수 없으면 새로고침 복원은 지원하지 않습니다.
  }

  return session;
}

export function clearMockDiagnosisSession(): void {
  try {
    sessionStorage.removeItem(DIAGNOSIS_STORAGE_KEY);
  } catch {
    // 저장소 접근이 제한된 경우 무시합니다.
  }
}

export function getMockDiagnosisStep(elapsedMs: number): 0 | 1 | 2 | 3 {
  if (elapsedMs >= DIAGNOSIS_COMPLETE_DELAY_MS) return 3;
  if (elapsedMs >= 18_000) return 2;
  if (elapsedMs >= 6_000) return 1;
  return 0;
}