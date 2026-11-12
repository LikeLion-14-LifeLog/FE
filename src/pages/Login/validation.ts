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
  emailNotRegistered: "가입되지 않은 이메일입니다. 회원가입 후 로그인해 주세요.",
  emailAlreadyRegistered: "이미 가입된 이메일입니다.",
  signupSaveFailed:
    "회원가입 정보를 저장하지 못했어요. 브라우저 저장소 설정을 확인한 뒤 다시 시도해 주세요.",
};

/** 로그인 성공 화면으로 넘기는 정보 */
export type WelcomeState = {
  nickname: string;
  email: string;
};
