## 기술 스택

- React + TypeScript
- Vite
- react-router-dom (라우팅)
- zustand (전역 상태 관리)
- ESLint, Prettier


## 폴더 구조

```
src
├── components             // 공통 컴포넌트
├── assets
│   ├── images             // 이미지
│   └── fonts              // 폰트
├── pages
│   ├── Login              // 로그인 페이지
│   │   ├── components     // 로그인 페이지에서만 쓰는 컴포넌트
│   │   └── LoginPage.tsx
│   ├── Main               // 메인 페이지
│   │   ├── components
│   │   └── MainPage.tsx
│   └── NotFound           // 404 페이지
│       └── NotFoundPage.tsx
├── store                  // zustand 전역 상태 관리
├── hooks                  // 커스텀 훅
├── apis                   // 서버 통신 함수
├── utils                  // 유틸리티 함수
├── styles                 // 전역 스타일 (컬러, 공통 스타일 등)
├── types                  // 타입 정의
├── constants              // 상수, 더미데이터 등
├── routes                 // 경로 관리 (라우터 설정)
└── layouts                // 레이아웃 구조 (Outlet 등)
```

- 각 `pages` 폴더 안에도 `components` 디렉토리가 있으며, 해당 페이지에서만 쓰는 컴포넌트와 스타일을 둡니다.
- 로고처럼 여러 페이지에서 쓰이는 것은 공통 `components`에 둡니다.

## 라우팅

`src/routes/index.tsx`에서 `createBrowserRouter`로 경로를 관리합니다.

| 경로 | 페이지 | 레이아웃 |
|---|---|---|
| `/` | `MainPage` | `MainLayout` 적용 |
| `/login` | `LoginPage` | 없음 |
| `*` | `NotFoundPage` | 없음 |

레이아웃이 필요한 페이지는 `MainLayout`의 `children`에 추가하면 `<Outlet />` 자리에 렌더링됩니다.

## 절대 경로

`@`는 `src` 폴더를 가리킵니다. (`vite.config.ts`, `tsconfig.app.json`에 설정)

```tsx
import MainLayout from '@/layouts/MainLayout';
```

설정이 바뀐 뒤에는 `npm install`을 다시 실행하고 개발 서버를 재시작하세요.

## 명명 규칙

- 폴더명, 파일명, 함수, 변수, 훅은 기본적으로 **카멜 케이스** (첫 글자 소문자)
- 컴포넌트와 직접 관련된 파일과 함수는 **파스칼 케이스** (첫 글자 대문자)
- `pages` 하위 폴더는 **파스칼 케이스** (예: `Login`, `Main`)

## 협업 규칙

### 1. 이슈 작성
- 작업 단위별로 `SETTING` / `FEATURE` / `REFACTOR` 등을 제목에서 알아볼 수 있게 작성합니다.
- 진행할 작업은 TODO로 함께 작성합니다.

### 2. 브랜치
- 형식: `작업형식/깃허브아이디-작업페이지#이슈번호`
- 예시: `feature/hys127-login#5`
- 이슈 생성하면 자동으로 만들수 있어 편합니다!

### 3. 코드 구현
- 공통 컴포넌트를 자세히 분리합니다.
- 커밋 메시지는 구체적으로 작성합니다.

### 4. PR 작성
- 제목은 이슈와 동일하게 설정합니다.
- `리뷰어`, `담당자`, `작업 라벨`을 설정합니다.
- 구현 완료 내용은 `- [x]` 형식으로 설명하고, 본인의 코드 구조를 이해한 상태로 작성합니다.
- 스크린샷은 가능한 모든 화면을 `width="200"`으로 첨부합니다.
- 추후 보완할 사항과 전달 사항은 `- [ ]` 형식으로 작성합니다.
- AI 피드백과 필요 시 팀원 코드 리뷰를 진행합니다.
- 상대의 `approve`를 받은 뒤 본인이 머지합니다.
