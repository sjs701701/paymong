# Paymong Remake

`paymong.kr` 랜딩 경험을 Next.js로 재구성한 프로젝트입니다.

현재 이 저장소에는 아래 화면이 포함되어 있습니다.

- `/` : 메인 랜딩 페이지
- `/login` : 로그인 화면

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- GSAP + ScrollTrigger
- Lenis
- Lottie
- Matter.js

## Requirements

- Node.js `20.9.0` 이상
- npm

`.nvmrc` 기준 버전은 `20.9.0`입니다.

## Quick Start

저장소를 받은 뒤 아래 순서로 실행하면 됩니다.

```bash
git clone <repository-url>
cd Paymong
npm ci
npm run dev
```

개발 서버가 올라오면 브라우저에서 아래 주소로 확인합니다.

- [http://localhost:3000](http://localhost:3000)
- [http://localhost:3000/login](http://localhost:3000/login)

## Available Scripts

```bash
npm run dev
```

개발 서버 실행

```bash
npm run build
```

프로덕션 빌드 생성

```bash
npm run start
```

빌드 결과 실행

```bash
npm run lint
```

ESLint 검사 실행

## Project Notes

### Main landing

메인 랜딩은 스크롤 기반 인터랙션 중심으로 구성되어 있습니다.

- Hero 키워드 시퀀스
- Hero 이후 비디오/스토리 섹션
- 리뷰 섹션
- 증빙/신뢰 섹션
- 가로 스크롤 기능 소개 섹션
- 기프티콘/마일리지 섹션
- FAQ
- Footer

### Login page

`/login` 화면은 좌우 2단 레이아웃입니다.

- 왼쪽: Google / NAVER / Kakao 로그인 버튼 + 휴대폰 번호 입력 폼
- 오른쪽: 애니메이션 이미지 컬럼 쇼케이스

현재 로그인 관련 버튼과 폼은 UI만 구현되어 있으며 실제 인증 로직은 연결되어 있지 않습니다.

## Workspace Defaults

이 저장소는 UTF-8 기반 작업을 기본으로 합니다.

- `.editorconfig` : `utf-8`, `lf`, final newline, trailing whitespace trim
- `.vscode/settings.json` : VS Code 인코딩 및 PowerShell 출력 설정

## Design Asset Paths

### Header logo

헤더 로고 경로:

- `public/brand/paymong-header-logo.svg`

화이트 로고 경로:

- `public/brand/white-logo/paymong-header-logo-white.svg`

로그인 화면 심볼 로고 경로:

- `public/logo-icon.svg`

### Hero keyword assets

키워드별 히어로 에셋 경로:

- `public/design/hero-keywords/rent/`
- `public/design/hero-keywords/tuition/`
- `public/design/hero-keywords/labor/`
- `public/design/hero-keywords/contract/`

각 폴더에서 사용하는 base filename:

- `orbit-shell`
- `right-ribbon`
- `left-sweep`
- `bottom-echo`

지원 확장자 순서:

1. `.svg`
2. `.png`
3. `.jpg`
4. `.jpeg`
5. `.webp`

첫 번째로 매칭되는 파일이 사용됩니다.

예시:

- `public/design/hero-keywords/rent/orbit-shell.svg`
- `public/design/hero-keywords/rent/right-ribbon.png`
- `public/design/hero-keywords/rent/left-sweep.webp`
- `public/design/hero-keywords/rent/bottom-echo.jpg`

추가 가이드는 아래 문서를 참고하면 됩니다.

- `public/design/hero-keywords/README.md`
