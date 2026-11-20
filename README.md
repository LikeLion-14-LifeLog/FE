# 🪪 라이프로그 (LifeLog) — Frontend

> **막연했던 커리어, 숫자로 선명하게.**
>
> _"공공 고용 데이터로 보는 내 연봉과 다음 커리어."_

학력·전공·경험 등 **내 스펙**을 입력하면
공공 고용 패널 데이터를 기반으로 **예상 연봉 진단 · 조건별 연봉 시뮬레이션 · 선배들의 커리어 경로 · 맞춤 채용 공고**까지 제공하는 커리어 진단 서비스의 프론트엔드입니다.

**React + TypeScript + Vite** 기반의 웹 앱으로,
**이메일 회원가입·로그인**, **스펙 프로필 관리**, **AI 연봉 진단**, **커리어 경로 분석**, **채용 공고 추천**을 담당합니다.

---

## 🔹 주요 기능

### 1. 🔐 인증
- 이메일 회원가입 (이메일 중복 확인 · 입력값 검증) 및 로그인 / 로그아웃
- JWT Access Token 기반 인증, Axios 인터셉터로 `Authorization` 헤더 자동 첨부
- **로그인 상태 유지** 선택 시 `localStorage`, 아니면 `sessionStorage`에 저장
- `RequireLogin` 라우트 가드로 로그인이 필요한 화면 보호

### 2. 📝 스펙 프로필
- 기본 정보 · 학력 · 경험 · 자격증 입력 및 수정
- 학교·전공·자격증 **검색 모달**로 정확한 항목 선택
- 입력한 스펙은 연봉 진단과 맞춤 커리어·채용 추천에 활용

### 3. 💰 연봉 진단 & 시뮬레이션
- 스펙 기반 **예상 연봉 진단** — 분석 진행 상황을 SSE(`text/event-stream`)로 실시간 표시
- 초봉부터 5년 차까지의 **예상 연봉 범위와 근거** 리포트
- 학력·경험·기업 규모(스타트업 ~ 대기업) 등 **조건을 바꿔 보는 연봉 시뮬레이션** 및 목표 저장

### 4. 🧭 커리어 경로
- 동일 전공·조건 선배들의 **취업·이직 경로 그래프** (청년패널 실데이터 기반)
- 경로별 상세 분석 — 연도별 관측치, 이동 시점 분포, 요구 조건, 연봉 변화
- 내 스펙에 맞춘 **개인화 경로** 추천

### 5. 💼 채용 기회 & 대시보드
- 프로필 조건과 준비 목표를 바탕으로 한 **맞춤 채용 공고** (직무·필터·페이지네이션)
- 공고 상세 조회 및 **북마크**
- 대시보드에서 최근 진단 요약 · 추천 공고 · 스펙 입력 현황을 한눈에 확인

### 6. ⚠️ 예외 처리
- 404 · 서버 오류(500) · 네트워크 오류 · 로그인 필요 · 점검 중 · 스펙 미등록 전용 안내 페이지

---

## 🚀 기술 스택

- **Language**: TypeScript 5.9

  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />

- **Framework**: React 19

  <img src="https://img.shields.io/badge/React%2019-61DAFB?style=flat-square&logo=react&logoColor=black" />

- **빌드 도구**: Vite 8

  <img src="https://img.shields.io/badge/Vite%208-646CFF?style=flat-square&logo=vite&logoColor=white" />

- **스타일링**: Tailwind CSS 4

  <img src="https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />

- **애니메이션**: Motion

  <img src="https://img.shields.io/badge/Motion-000000?style=flat-square&logo=framer&logoColor=white" />

- **라우팅**: React Router DOM 7

  <img src="https://img.shields.io/badge/React%20Router%207-CA4245?style=flat-square&logo=reactrouter&logoColor=white" />

- **HTTP 통신**: Axios + Fetch (SSE 스트리밍)

  <img src="https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white" />

- **인증**: JWT (`localStorage` / `sessionStorage`)

  <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" />

- **배포**: Vercel

  <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" />

- **Linting / Formatting**: ESLint 10 + Prettier 3

  <img src="https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white" />
  <img src="https://img.shields.io/badge/Prettier-F7B93E?style=flat-square&logo=prettier&logoColor=black" />

---

## 🏗️ 아키텍처 개요

```scss
🖥️ Web App (Vercel)
    │  JWT (localStorage / sessionStorage)
    ├─ React Router       (클라이언트 라우팅 · RequireLogin 가드)
    ├─ authStore          (useSyncExternalStore 기반 인증 상태)
    ├─ Tailwind CSS       (UI 스타일링)
    ├─ Motion             (애니메이션)
    └─ Axios / Fetch      (API 통신 · SSE 스트리밍)
          │
          ▼
    🌐 Server API (VITE_API_BASE_URL)
          ├─ /api/auth             회원가입 · 로그인 · 로그아웃
          ├─ /api/spec-profile     스펙 프로필 · 연봉 진단(분석 실행)
          ├─ /api/v1/career-paths  커리어 경로 · 연봉 분석
          └─ /api/job-postings     채용 공고 · 북마크
```

---

## 📁 프로젝트 구조

```csharp
FE/
└─ src/
   ├─ pages/                  # 화면 및 페이지별 컴포넌트
   │  ├─ Landing/             # 서비스 소개 랜딩
   │  ├─ Login/               # 로그인 · 회원가입 · 비밀번호 재설정 · 웰컴
   │  ├─ DashBoard/           # 대시보드 (진단 요약 · 추천 공고)
   │  ├─ Spec/                # 스펙 프로필 입력·수정
   │  ├─ Diagnosis/           # 연봉 진단 로딩 · 결과 리포트
   │  ├─ Salary/              # 조건별 연봉 시뮬레이션
   │  ├─ Career/              # 커리어 경로 그래프 · 상세 분석
   │  ├─ JobChance/           # 맞춤 채용 공고 · 상세
   │  ├─ Exception/           # 오류·점검 등 예외 페이지
   │  └─ NotFound/            # 404
   ├─ components/             # 공통 UI 컴포넌트 (Header, SalaryChart 등)
   ├─ layouts/                # MainLayout (Outlet)
   ├─ apis/                   # 도메인별 API 요청 · Axios 클라이언트
   ├─ routes/                 # React Router 설정 · RequireLogin
   ├─ store/                  # 인증 등 전역 상태
   ├─ hooks/                  # 공통 커스텀 훅
   ├─ constants/              # 상수 및 정적 데이터
   ├─ mocks/                  # 목 데이터
   ├─ types/                  # TypeScript 타입
   ├─ utils/                  # 공통 유틸리티 (매퍼 · 계산)
   ├─ styles/                 # 전역 스타일
   └─ assets/                 # 이미지 · 아이콘 · 폰트
```

- 각 `pages` 폴더 안의 `components`에는 해당 페이지에서만 쓰는 컴포넌트를 둡니다.
- 여러 페이지에서 쓰이는 것은 공통 `components`에 둡니다.
- `@`는 `src` 폴더를 가리킵니다. (예: `import MainLayout from '@/layouts/MainLayout'`)

---

## 🤝 협업 규칙

- **브랜치**: `작업형식/깃허브아이디-작업페이지#이슈번호` (예: `feature/hys127-login#5`)
- **명명 규칙**: 폴더·파일·함수·변수·훅은 카멜 케이스, 컴포넌트 관련 파일·함수와 `pages` 하위 폴더는 파스칼 케이스
- **이슈**: 제목에 `SETTING` / `FEATURE` / `REFACTOR` 등 작업 유형을 표시하고 TODO를 함께 작성
- **PR**: 제목은 이슈와 동일하게, 리뷰어·담당자·라벨 설정, 구현 내용은 `- [x]`, 보완 사항은 `- [ ]`로 작성하고 스크린샷(`width="200"`) 첨부
- **머지**: 상대의 `approve`를 받은 뒤 본인이 머지

---

## 👥 팀 구성 (Frontend)

<table>
  <tr>
    <td align="center" width="180">
      <a href="https://github.com/hys127">
        <img src="https://github.com/hys127.png" width="120" height="120" style="border-radius:50%" /><br/>
        <b>@hys127</b>
      </a>
    </td>
    <td align="center" width="180">
      <a href="https://github.com/mi0zzi">
        <img src="https://github.com/mi0zzi.png" width="120" height="120" style="border-radius:50%" /><br/>
        <b>@mi0zzi</b>
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">Frontend</td>
    <td align="center">Frontend</td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/hys127">@hys127</a></td>
    <td align="center"><a href="https://github.com/mi0zzi">@mi0zzi</a></td>
  </tr>
</table>
