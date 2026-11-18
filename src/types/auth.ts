/** POST /api/auth/signup 요청 */
export type SignupRequest = {
  email: string;
  password: string;
  passwordConfirm: string;
  agreedTermIds: number[];
};

/** POST /api/auth/signup 응답 data */
export type SignupResponse = {
  memberId: number;
};
