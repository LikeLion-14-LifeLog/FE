import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser } from "@/store/authStore";
import { withRedirect } from "@/utils/redirect";

/**
 * 로그인해야 들어갈 수 있는 화면 묶음.
 * 비로그인이면 로그인 필요 안내 화면으로 보내고, 로그인 후 원래 화면으로 돌아오도록 redirect 를 붙인다.
 */
const RequireLogin = () => {
  const user = useCurrentUser();
  const { pathname, search } = useLocation();

  if (!user) {
    return (
      <Navigate
        to={withRedirect("/error/login-required", pathname + search)}
        replace
      />
    );
  }

  return <Outlet />;
};

export default RequireLogin;
