/** POST /api/auth/signup 요청 */
export type SignupRequest = {
  /** 1~30자, 중복 허용 */
  nickname: string;
  email: string;
  password: string;
  passwordConfirm: string;
  agreedTermIds: number[];
};

/** POST /api/auth/signup 응답 data */
export type SignupResponse = {
  memberId: number;
};

/** POST /api/auth/login 요청 */
export type LoginRequest = {
  email: string;
  password: string;
};

/** POST /api/auth/login 응답 data */
export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  /** 닉네임을 정하지 않은 기존 회원은 "사용자" */
  nickname: string;
};
