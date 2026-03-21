# KHU LikeLion Tech Blog — Frontend

🔗 **[khu-tech.blog](https://www.khu-tech.blog)**

멋쟁이사자처럼 경희대학교 기술블로그의 프론트엔드 레포지토리입니다.

## Tech Stack

- Vue 3 + TypeScript
- Tailwind CSS 4
- Three.js
- Vite

## Getting Started

```bash
git clone https://github.com/likelion-khu-BE/tech-blog-fe.git
cd study-fe
npm install
npm run dev
```

## Branch Strategy

- `main` — 배포 브랜치. 직접 push 금지
- `develop` — 개발 브랜치. PR 머지 대상
- `feat/#이슈번호-설명` — 기능 브랜치

## Contributing

1. [Issue](https://github.com/likelion-khu-BE/tech-blog-fe/issues)를 먼저 생성합니다
2. `develop`에서 브랜치를 만듭니다: `git checkout -b feat/#이슈번호-설명`
3. 작업 후 `develop`으로 PR을 올립니다
4. 최소 1명의 리뷰를 받고 머지합니다

리뷰 없이 머지하지 않습니다.

## Commit Convention

```
feat: 새로운 기능
fix: 버그 수정
style: UI/디자인 변경
refactor: 리팩토링
docs: 문서 수정
chore: 빌드, 설정 변경
```

예시: `feat: 아티클 상세 페이지 구현 (#12)`

## Build

```bash
npm run build    # dist/ 에 빌드 결과물 생성
npm run preview  # 빌드 결과물 로컬 미리보기
```
