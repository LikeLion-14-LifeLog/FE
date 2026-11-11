import { Outlet, useMatches } from "react-router-dom";

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
      {/* 헤더 자리 (추가 예정) */}
      <div className="h-16" aria-hidden />

      {/* 공통 컨테이너 */}
      <main className="mx-auto w-full max-w-[1560px] px-4 pt-[58px] pb-12 md:px-6 2xl:px-0">
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
      </main>
    </div>
  );
};

export default MainLayout;
