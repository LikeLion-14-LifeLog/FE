import { useNavigate } from "react-router-dom";
import ExceptionLayout from "./components/ExceptionLayout";
import {
  ExceptionGhostButton,
  ExceptionPrimaryButton,
} from "./components/ExceptionButtons";

const ICON = {
  notFound: "/exception/404.svg",
  server: "/exception/500.svg",
  network: "/exception/network.svg",
  login: "/exception/needLogin.svg",
  maintenance: "/exception/fixing.svg",
  spec: "/exception/spec.svg",
};

/** 이전 화면으로, 히스토리가 없으면 홈으로 */
const useGoBack = () => {
  const navigate = useNavigate();
  return () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };
};

/* 404 페이지 없음 */
export const NotFoundPage = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  return (
    <ExceptionLayout
      icon={ICON.notFound}
      title="페이지를 찾을 수 없어요"
      description={
        "주소가 바뀌었거나 삭제된 페이지예요.\n입력한 주소를 다시 한번 확인해 주세요."
      }
      actions={
        <>
          <ExceptionPrimaryButton onClick={() => navigate("/")}>
            홈으로 가기
          </ExceptionPrimaryButton>
          <ExceptionGhostButton onClick={goBack}>이전 페이지로</ExceptionGhostButton>
        </>
      }
    />
  );
};

/* 500 서버 오류 */
export const ServerErrorPage = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  return (
    <ExceptionLayout
      icon={ICON.server}
      title="일시적인 오류가 발생했어요"
      description={
        "요청을 처리하는 중 문제가 생겼어요.\n잠시 후 다시 시도해 주세요."
      }
      actions={
        <>
          <ExceptionPrimaryButton onClick={goBack}>다시 시도하기</ExceptionPrimaryButton>
          <ExceptionGhostButton onClick={() => navigate("/")}>
            홈으로 가기
          </ExceptionGhostButton>
        </>
      }
    />
  );
};

/* 네트워크 오류 */
export const NetworkErrorPage = () => {
  const goBack = useGoBack();
  return (
    <ExceptionLayout
      icon={ICON.network}
      title="인터넷 연결이 불안정해요"
      description={
        "Wi-Fi나 모바일 데이터 연결을 확인한 뒤\n다시 시도해 주세요."
      }
      actions={
        <ExceptionPrimaryButton onClick={goBack}>다시 시도하기</ExceptionPrimaryButton>
      }
    />
  );
};

/* 로그인 필요 */
export const LoginRequiredPage = () => {
  const navigate = useNavigate();
  return (
    <ExceptionLayout
      icon={ICON.login}
      title="로그인이 필요해요"
      description={
        "이 기능은 로그인 후 이용할 수 있어요.\n내 스펙과 저장한 공고가 안전하게 보관돼요."
      }
      actions={
        <>
          <ExceptionPrimaryButton onClick={() => navigate("/login")}>
            로그인하기
          </ExceptionPrimaryButton>
          <ExceptionGhostButton onClick={() => navigate("/signup")}>
            회원가입
          </ExceptionGhostButton>
        </>
      }
    />
  );
};

/* 서비스 점검 중 */
type MaintenancePageProps = {
  /** 점검 일정 문구 */
  schedule?: string;
  /** 공지사항 링크 */
  noticeUrl?: string;
};

export const MaintenancePage = ({
  schedule = "2026.11.10 (화) 02:00 ~ 06:00",
  noticeUrl = "/",
}: MaintenancePageProps) => {
  const navigate = useNavigate();
  return (
    <ExceptionLayout
      icon={ICON.maintenance}
      title="더 나은 서비스를 위해 점검 중이에요"
      description="점검 시간 동안 서비스 이용이 잠시 중단돼요."
      extra={
        <span className="inline-flex items-center gap-2 rounded-full border border-[#99f6e4] bg-white/60 px-4 py-2 text-[14px] leading-[17px] font-medium text-[#0f766e]">
          <svg
            aria-hidden
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {schedule}
        </span>
      }
      actions={
        <ExceptionPrimaryButton onClick={() => navigate(noticeUrl)}>
          공지사항 보기
        </ExceptionPrimaryButton>
      }
    />
  );
};

/* 분석 불가 스펙 — 모델이 입력한 스펙으로 결과를 도출하지 못했을 때 */
export const SpecUnavailablePage = () => {
  const navigate = useNavigate();
  return (
    <ExceptionLayout
      icon={ICON.spec}
      title="입력한 스펙으로는 분석이 어려워요"
      description={
        "AI 모델이 결과를 도출하지 못했어요.\n아래 항목을 확인하고 스펙을 보완해 주세요."
      }
      actions={
        <>
          <ExceptionPrimaryButton onClick={() => navigate("/spec")}>
            스펙 수정하기
          </ExceptionPrimaryButton>
          <ExceptionGhostButton onClick={() => navigate("/spec")}>
            다른 직무로 다시 분석하기
          </ExceptionGhostButton>
        </>
      }
    />
  );
};
