import { Outlet, useMatches } from "react-router-dom";
import Header from "../components/Header";
import { PAGE_CONTAINER } from "@/constants/layout";

/** 1560px 기준 디자인 → 대시보드 1040px 기준으로 축소하는 비율 */
const DESIGN_SCALE = 1040 / 1560;

export interface PageTitleHandle {
  /** 영어 제목 (상단 작은 라벨) */
  eyebrow?: string;
  /** 메인 제목 */
  title?: string;
  /** 메인 제목 아래 설명 (선택) */
  description?: string;
}

const usePageTitle = (): PageTitleHandle => {
  const matches = useMatches();
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i].handle as PageTitleHandle | undefined;
    if (handle?.title || handle?.eyebrow) return handle;
  }
  return {};
};

const MainLayout = () => {
  const { eyebrow, title, description } = usePageTitle();

  return (
    <div className="min-h-screen bg-bg-page font-sans text-text-primary">
      <Header />

      {/* 공통 컨테이너 (헤더·대시보드와 같은 1040px 폭) */}
      <main className={PAGE_CONTAINER}>
        {/*
          이 레이아웃의 화면들은 1560px 폭 기준으로 디자인되어 대시보드(1040px)보다 크다.
          레이아웃은 그대로 두고 zoom 으로 통째로 축소해 비율을 맞춘다.
          (transform 과 달리 zoom 은 레이아웃 크기도 함께 줄여 아래 여백이 생기지 않음)
        */}
        <div className="pt-[58px] pb-12" style={{ zoom: DESIGN_SCALE }}>
          {(eyebrow || title) && (
            <section className="mb-[18px] flex flex-col">
              {eyebrow && (
                <p className="pt-[7px] text-[10px] leading-[15px] font-extrabold tracking-[1.6px] text-brand-strong uppercase">
                  {eyebrow}
                </p>
              )}

              {title && (
                <h1 className="mt-2 text-[30px] leading-[37.5px] font-extrabold tracking-[-0.6px] text-text-primary">
                  {title}
                </h1>
              )}

              {description && (
                <p className="mt-2 text-[15.5px] leading-6 text-text-secondary">
                  {description}
                </p>
              )}
            </section>
          )}

          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
