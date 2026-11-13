/**
 * 모든 화면이 공유하는 가로 컨테이너 (대시보드 기준 콘텐츠 너비 1040px).
 * 헤더·본문·섹션이 같은 클래스를 써야 로고와 본문 시작선이 어떤 화면 너비에서도 맞는다.
 * 좌우 여백(px-4 / md:px-6)을 max-w 안에 포함시켜, 큰 화면에선 콘텐츠가 정확히 1040px 이 된다.
 */
export const PAGE_CONTAINER = "mx-auto w-full max-w-[1088px] px-4 md:px-6";
