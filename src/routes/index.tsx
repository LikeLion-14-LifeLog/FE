import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import LoginPage from "@/pages/Login/LoginPage";
import MainPage from "@/pages/Main/components/MainPage";
import NotFoundPage from "@/pages/NotFound/NotFoundPage";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [{ path: "/", element: <MainPage /> }],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "*", element: <NotFoundPage /> },
]);

export default router;
