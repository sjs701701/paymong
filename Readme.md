# Paymong Remake

`paymong.kr` 랜딩과 주요 사용자 플로우를 Next.js로 재구성한 프로젝트입니다.

현재 저장소에는 아래 화면이 포함되어 있습니다.

- `/` : 메인 랜딩 페이지
- `/login` : 로그인 화면
- `/signup` : 회원가입 화면
- `/contracts/new` : 계약 등록 화면
- `/contracts/new/complete` : 계약 등록 완료 화면
- `/mypage-v2` : 현재 주력 계약리스트/마이페이지 화면
- `/mypage` : 이전 계약리스트 화면 보존본

## Important Note

현재 기준으로 계약리스트와 마이페이지의 기본 기준 화면은 `/mypage-v2` 입니다.

- 로그인 성공 후 이동 경로는 `/mypage-v2`
- 계약 등록 완료 후 복귀 경로도 `/mypage-v2`
- 기존 `/mypage`는 비교 및 백업 용도로만 유지 중

즉, 문서와 대화에서 `계약리스트`, `마이페이지`라고 부르는 경우 기본적으로 `/mypage-v2`를 의미합니다.

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
- shadcn/ui 기반 UI 컴포넌트 일부

## Requirements

- Node.js `20.9.0` 이상
- npm

`.nvmrc` 기준 버전은 `20.9.0` 입니다.

## Quick Start

저장소를 받은 뒤 아래 순서로 실행하면 됩니다.

```bash
git clone <repository-url>
cd Paymong
npm ci
npm run dev
```

개발 서버가 올라오면 브라우저에서 아래 주소로 확인할 수 있습니다.

- [http://localhost:3000](http://localhost:3000)
- [http://localhost:3000/login](http://localhost:3000/login)
- [http://localhost:3000/mypage-v2](http://localhost:3000/mypage-v2)

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

- Hero 키워드 스토리
- Hero 이후 비디오 스토리 섹션
- 리뷰 섹션
- 성과/신뢰 섹션
- 가로 스크롤 기능 소개 섹션
- 기프티콘/마일리지 섹션
- FAQ
- Footer

### Login page

`/login` 화면은 좌우 2단 레이아웃입니다.

- 왼쪽: Google / NAVER / Kakao 로그인 버튼 + 휴대폰 번호 인증 흐름
- 오른쪽: 애니메이션 이미지 컬럼 기반 비주얼 영역

현재 인증번호 검증은 임시 값 `000000` 기준으로 동작하며, 실제 인증 모듈 연동 전까지 UI 검증용으로 유지됩니다.

### Contract list / My page

현재 주력 계약리스트 화면은 `/mypage-v2` 입니다.

- 좌측: 계약 검색 + 계약 리스트
- 우측: 계약 상세 / 결제 / 이용내역 상세
- 모바일: 리스트 -> 상세 -> 결제 흐름으로 전환

기존 `/mypage` 화면은 이전 버전 UI 비교용으로 남겨두고 있습니다.

### Contract registration

`/contracts/new` 는 전체 화면 계약 등록 폼입니다.

- 계약 유형 선택
- 주소 또는 계약명 입력
- 거래 상대방 계좌 정보
- 송금 정보 입력
- 확인 서류 첨부
- 완료 후 `/contracts/new/complete` 이동

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

로그인 화면 로고 경로:

- `public/logo-icon.svg`

### Hero keyword assets

키워드 섹션 에셋 경로:

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

추가 가이드는 아래 문서를 참고하면 됩니다.

- `public/design/hero-keywords/README.md`
