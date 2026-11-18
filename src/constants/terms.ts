/**
 * 약관 ID (Term.term_id).
 * TODO: 백엔드 Term 데이터 확정 시 ID 확인 — 약관 조회 API가 생기면 서버 값으로 교체
 */
export const TERM_IDS = {
  /** [필수] 서비스 이용약관 + 개인정보 처리방침 (체크박스 하나로 함께 동의) */
  required: [1, 2],
  /** [선택] 맞춤 채용 정보 및 커리어 리포트 수신 */
  marketing: 3,
} as const;
