# 운명의 숫자 (Numerology) 🔢

수비학으로 당신의 인생 경로를 해석하는 바이럴 테스트 웹앱입니다.

## 기능 (Features)

### 1. 인생 경로 숫자 (Life Path Number)
- 생년월일 입력으로 인생 경로 숫자 자동 계산
- 1~9, 11, 22, 33 마스터 넘버 특별 처리
- 각 숫자별 성격, 강점, 약점, 적합 직업, 연애 성향 해석
- AI 심층 분석: 소명(Life Purpose), 숨겨진 잠재력, 도전 과제, 성공의 열쇠

### 2. 표현 숫자 (Expression Number)
- 이름 입력으로 표현 숫자 계산 (A=1, B=2, ... Z=26)
- 한글 이름도 지원
- 표현 방식, 재능, 도전 과제 제시

### 3. 숫자 궁합 (Number Compatibility)
- 두 숫자의 조화도 계산 (1~100%)
- 궁합 설명, 장점, 주의점 제공

### 4. 바이럴 최적화
- SNS 공유 버튼 (클립보드 복사)
- Canvas 결과 이미지 생성 (향후)
- Open Graph 메타태그로 카카오톡/인스타 공유 최적화

## 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **PWA**: Progressive Web App (오프라인 작동)
- **다국어**: 12개 언어 지원 (ko, en, ja, es, pt, zh, id, tr, de, fr, hi, ru)
- **광고**: AdMob, AdSense 플레이스홀더

## 파일 구조

```
numerology/
├── index.html              # 메인 HTML (GA4, AdSense, PWA, OG태그)
├── manifest.json           # PWA 설정
├── sw.js                   # Service Worker (오프라인 지원)
├── icon-192.svg            # 192x192 아이콘
├── icon-512.svg            # 512x512 아이콘
├── README.md               # 이 파일
├── .gitignore
├── css/
│   └── style.css          # 반응형 다크모드 스타일 (2026 UI/UX 트렌드)
└── js/
    ├── i18n.js            # 다국어 로더
    ├── numerology-data.js  # 수비학 데이터 및 계산 로직
    ├── app.js             # 앱 메인 로직
    └── locales/
        ├── ko.json        # 한국어
        ├── en.json        # English
        ├── ja.json        # 日本語
        ├── es.json        # Español
        ├── pt.json        # Português
        ├── zh.json        # 简体中文
        ├── id.json        # Bahasa Indonesia
        ├── tr.json        # Türkçe
        ├── de.json        # Deutsch
        ├── fr.json        # Français
        ├── hi.json        # हिन्दी
        └── ru.json        # Русский
```

## 디자인 특징

### 2026 UI/UX 트렌드 적용
1. **Glassmorphism 2.0** - 블러 배경, 투명 카드
2. **Microinteractions** - 마우스 호버, 숫자 글로우 애니메이션
3. **Dark Mode First** - 기본은 다크 모드, 테마 토글 지원
4. **골드 테마** - `#f1c40f` 프라이머리 컬러로 신비로운 분위기
5. **별/우주 배경** - 수비학의 신비로운 감성
6. **숫자 글로우 이펙트** - 텍스트 쉐도우로 네온 스타일

### 색상
- **Primary**: `#f1c40f` (골드)
- **Background Dark**: `#0f0f23` (깊은 남색)
- **Accent**: 보라색, 핑크색 그라데이션

### 반응형
- 모바일 (360px~480px)
- 태블릿 (768px)
- 데스크톱 (1024px+)

## 다국어 지원 (i18n)

모든 UI 텍스트는 `data-i18n` 속성으로 관리되며, 12개 언어를 자동 로드합니다.

```html
<h1 data-i18n="header.title">기본값</h1>
```

사용자 언어 설정은 localStorage에 저장되어 다음 방문 시 유지됩니다.

## 광고 전략

### 상단/하단 배너
- AdSense 플레이스홀더 적용
- 높이: 60px+, 반응형

### 전면 광고 (Interstitial)
- 결과 표시 시 5초 카운트다운
- 자동 닫기 또는 수동 닫기

### 프리미엄 콘텐츠
- "AI 심층 분석" 버튼 클릭 시 광고 시청
- 광고 완료 후 분석 결과 표시

## 로컬 테스트

```bash
# 디렉토리로 이동
cd projects/numerology

# 로컬 서버 실행
python -m http.server 8000

# 브라우저에서 열기
http://localhost:8000
```

## 배포

1. **Google Play**: APK 빌드 후 등록
2. **웹**: dopabrain.com/numerology/ 에 배포
3. **PWA**: 설치 가능한 웹앱으로 제공

## SEO 최적화

- **메타태그**: title, description, keywords, og:*, twitter:*
- **hreflang**: 12개 언어 크로스링크
- **Schema.org**: SoftwareApplication 구조화 데이터
- **Mobile-friendly**: 모바일 우선 설계

## 추가 개선 계획

- [ ] Canvas로 결과 이미지 생성 (공유용)
- [ ] 날짜 선택 시 생년월일별 유명인 표시
- [ ] 숫자별 호환 숫자 목록 자동 생성
- [ ] 월별, 년별 수치 운세 기능
- [ ] 사용자 저장 결과 히스토리

## 라이선스

Copyright (c) 2026 DopaBrain. All rights reserved.

---

**개발**: DopaBrain Team
**업데이트**: 2026-02-10
**상태**: Production Ready
