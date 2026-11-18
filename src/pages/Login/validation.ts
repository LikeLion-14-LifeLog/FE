export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 8자 이상, 영문·숫자 각각 1자 이상 포함 */
export const isValidPassword = (value: string) =>
  value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);

export const isValidEmail = (value: string) => EMAIL_REGEX.test(value.trim());

export const MESSAGES = {
  emailInvalid: "올바른 이메일 주소를 입력해 주세요.",
  passwordInvalid: "비밀번호는 8자 이상이어야 합니다. (영문·숫자 포함)",
  passwordMismatch: "비밀번호가 일치하지 않습니다. 다시 확인해 주세요.",
  nicknameRequired: "닉네임을 2자 이상 입력해 주세요.",
  termsRequired: "회원가입을 위해 필수 약관에 동의해 주세요.",
  emailAlreadyRegistered: "이미 가입된 이메일입니다.",
  signupInvalidRequest:
    "입력 정보를 다시 확인해 주세요.",
  signupFailed:
    "회원가입에 실패했어요. 잠시 후 다시 시도해 주세요.",
  passwordRequired: "비밀번호를 입력해 주세요.",
  loginFailed: "이메일 또는 비밀번호가 올바르지 않습니다.",
  loginForbidden: "이용이 제한된 계정입니다. 고객센터에 문의해 주세요.",
  serverError: "일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.",
  networkError:
    "서버에 연결할 수 없어요. 네트워크 상태를 확인해 주세요.",
};

/** 로그인 성공 화면으로 넘기는 정보 */
export type WelcomeState = {
  nickname: string;
  email: string;
};

/** 회원가입 → 로그인 화면으로 넘기는 정보 */
export type LoginState = {
  email: string;
  fromSignup?: boolean;
};
