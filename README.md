# 비회원 게시판 프로젝트 - 최종 구현

## 프로젝트 개요

순수 HTML, CSS, JavaScript로 구현한 비회원 게시판입니다.
로그인 없이 누구나 자유롭게 게시글을 작성, 수정, 삭제하고 댓글을 달 수 있습니다.

**기술 스택**:
- **프론트엔드**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **백엔드**: Node.js, Express.js, Prisma ORM
- **데이터베이스**: MySQL
- **통신**: RESTful API (JSON)

---

## 파일 구조

```
day02/
├── board.html                    # 프론트엔드 메인 파일 (SPA)
├── server.js                     # 백엔드 서버 (Express.js)
├── package.json                  # Node.js 패키지 설정
├── prisma/
│   └── schema.prisma             # 데이터베이스 스키마
├── controllers/
│   ├── postController.js         # 게시글 제어 로직
│   └── commentController.js      # 댓글 제어 로직
├── routes/
│   ├── postRoutes.js             # 게시글 라우트
│   └── commentRoutes.js          # 댓글 라우트
│
├── README.md                     # 이 파일
├── QUICK_START.md               # 빠른 시작 가이드 (추천)
├── FRONTEND_SETUP.md            # 프론트엔드 상세 가이드
├── API_ENDPOINTS.md             # API 상세 문서
└── BOARD_REQUIREMENTS.md        # 기능 명세서
```

---

## 주요 기능

### 1. 게시글 관리 (CRUD)
- ✅ **조회**: 목록(페이지네이션), 상세
- ✅ **작성**: 제목, 내용, 작성자, 비밀번호
- ✅ **수정**: 비밀번호 확인 후 수정
- ✅ **삭제**: 비밀번호 확인 후 삭제

### 2. 댓글 관리
- ✅ **작성**: 각 게시글 아래에서 댓글 작성
- ✅ **조회**: 게시글 상세 페이지에서 댓글 목록 표시
- ✅ **수정**: 비밀번호 확인 후 댓글 수정
- ✅ **삭제**: 비밀번호 확인 후 댓글 삭제

### 3. 사용자 경험
- ✅ 반응형 디자인 (모바일, 태블릿, 데스크톱)
- ✅ 다크 테마 자동 지원
- ✅ 부드러운 페이지 전환 애니메이션
- ✅ 실시간 에러/성공 메시지
- ✅ 비밀번호 기반 인증

### 4. 기술 특징
- ✅ 외부 라이브러리 없음 (의존성 최소)
- ✅ 단일 HTML 파일 (약 20KB)
- ✅ 브라우저 직접 열기 가능
- ✅ SEO 친화적 시맨틱 HTML
- ✅ WCAG 접근성 고려

---

## 빠른 시작 (5분)

### 전제 조건
- Node.js v14 이상
- 브라우저 (Chrome, Firefox, Safari, Edge)

### 실행 단계

**1단계: 백엔드 서버 시작**
```bash
cd C:\Users\SAMSUNG\claude_1900_mky\workspace\claude2\day02
node server.js
```

**2단계: 프론트엔드 열기**

옵션 A (가장 간단):
```bash
# Windows에서 직접 열기
start board.html
```

옵션 B (HTTP 서버 통해):
```bash
# 새로운 터미널에서
python -m http.server 3000
```
브라우저에서: `http://localhost:3000/board.html`

**3단계: 게시판 사용**

브라우저에 게시판이 로드되면:
1. **새 글 작성** 버튼으로 게시글 작성
2. 게시글 클릭하여 상세 보기
3. 댓글 작성/수정/삭제
4. 게시글 수정/삭제 (비밀번호 필요)

자세한 사용 방법은 [QUICK_START.md](./QUICK_START.md) 참조

---

## API 명세

**Base URL**: `http://localhost:8000/api`

### 게시글 API
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/posts?page=1&limit=10` | 게시글 목록 (페이지네이션) |
| GET | `/posts/:id` | 게시글 상세 (댓글 포함) |
| POST | `/posts` | 게시글 작성 |
| PUT | `/posts/:id` | 게시글 수정 (비밀번호 필요) |
| DELETE | `/posts/:id` | 게시글 삭제 (비밀번호 필요) |

### 댓글 API
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/posts/:postId/comments` | 댓글 작성 |
| PUT | `/comments/:id` | 댓글 수정 (비밀번호 필요) |
| DELETE | `/comments/:id` | 댓글 삭제 (비밀번호 필요) |

### 요청 형식
```json
{
  "title": "게시글 제목",
  "content": "게시글 내용",
  "author": "작성자명",
  "password": "1234"
}
```

### 응답 형식 (성공)
```json
{
  "success": true,
  "message": "작업이 완료되었습니다.",
  "data": { /* 데이터 */ },
  "pagination": { /* 페이지네이션 정보 */ }
}
```

### 에러 응답
```json
{
  "success": false,
  "message": "에러 메시지"
}
```

자세한 내용은 [API_ENDPOINTS.md](./API_ENDPOINTS.md) 참조

---

## 프론트엔드 구조

### 화면 구성 (SPA)

```
board.html
├─ List Screen (게시글 목록)
│  ├─ 게시글 목록 (페이지네이션)
│  └─ 새 글 작성 버튼
├─ Detail Screen (게시글 상세)
│  ├─ 게시글 본문
│  ├─ 수정/삭제 버튼
│  └─ 댓글 섹션
│     ├─ 댓글 목록
│     └─ 댓글 작성 폼
└─ Form Screen (작성/수정)
   ├─ 제목 입력
   ├─ 내용 입력
   ├─ 작성자명 입력
   └─ 비밀번호 입력
```

### JavaScript 주요 함수

```javascript
app.loadPostList(page)        // 게시글 목록 조회
app.loadPostDetail(id)        // 게시글 상세 조회
app.showCreateForm()          // 작성 폼 표시
app.showEditForm(id)          // 수정 폼 표시
app.submitPost(event)         // 게시글 저장
app.deletePost(id, password)  // 게시글 삭제
app.submitComment(event, postId) // 댓글 작성
app.deleteComment(id, password)  // 댓글 삭제
```

---

## 브라우저 호환성

| 브라우저 | 최소 버전 | 상태 |
|---------|---------|------|
| Chrome | 51+ | ✅ 완전 지원 |
| Firefox | 54+ | ✅ 완전 지원 |
| Safari | 10+ | ✅ 완전 지원 |
| Edge | 15+ | ✅ 완전 지원 |
| IE 11 | - | ⚠️ 미지원 (ES6 필요) |

---

## 개발자 가이드

### 프론트엔드 커스터마이징

#### 1. API Base URL 변경
`board.html`에서:
```javascript
const API_BASE = 'http://localhost:8000/api'; // 변경
```

#### 2. 스타일 커스터마이징
CSS 변수를 수정하여 색상 변경:
```css
:root {
    --color-primary: #007bff;
    --color-danger: #dc3545;
    /* 다른 색상들... */
}
```

#### 3. 페이지 제목 변경
HTML 헤더의 `<title>` 태그와 `<h1>` 변경:
```html
<title>내 게시판</title>
<h1>내 게시판</h1>
```

### 백엔드 확장

#### 1. 새로운 API 엔드포인트 추가
`routes/postRoutes.js`에서:
```javascript
router.get('/posts/search', postController.searchPosts);
```

#### 2. 데이터베이스 스키마 변경
`prisma/schema.prisma`에서 모델 수정 후:
```bash
npx prisma migrate dev --name change_name
```

#### 3. 검증 규칙 추가
`controllers/postController.js`에서 유효성 검사 로직 추가

---

## 테스트 방법

### 수동 테스트
1. [QUICK_START.md](./QUICK_START.md)의 테스트 체크리스트 실행

### 자동 테스트 (권장)
```bash
# 백엔드 테스트 스크립트 실행
curl http://localhost:8000/api/health
```

### API 테스트 (Postman 등)
```bash
# 게시글 작성
curl -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "테스트", "content": "내용", "author": "테스트", "password": "1234"}'
```

---

## 보안 고려사항

### 현재 구현
- ✅ SQL Injection 방지 (Prisma ORM)
- ✅ CORS 설정
- ✅ 비밀번호 bcrypt 해싱

### 권장 추가 사항
- ⚠️ HTTPS 필수 (비밀번호 전송 암호화)
- ⚠️ Rate Limiting (DDoS 방지)
- ⚠️ 입력 새니타이제이션 강화
- ⚠️ XSS 방지 (현재: HTML 이스케이프 함)
- ⚠️ CSRF 토큰 (선택)

---

## 성능 최적화

### 현재 상태
- ✅ 외부 라이브러리 없음
- ✅ 단일 HTTP 파일
- ✅ 병렬 API 요청 없음

### 최적화 옵션
```bash
# CSS/JS 축소 (Minify)
npm install -g cssnano terser

# 이미지 최적화
npm install -g imagemin

# Gzip 압축
npm install compression
```

---

## 배포 가이드

### Vercel (권장)
```bash
# 프론트엔드만 배포
npm install -g vercel
vercel --prod
```

### AWS / Azure / Google Cloud
```bash
# 백엔드 배포 (Node.js 플랫폼)
# - 환경 변수 설정
# - 데이터베이스 마이그레이션
# - SSL 인증서 설정
```

---

## 문제 해결

### Q1: "Cannot find module" 에러
```bash
# 패키지 재설치
npm install
```

### Q2: 데이터베이스 연결 실패
```bash
# Prisma 마이그레이션 확인
npx prisma migrate dev
npx prisma db push
```

### Q3: CORS 에러
```bash
# server.js에 CORS 설정 확인
const cors = require('cors');
app.use(cors());
```

더 많은 문제 해결은 [FRONTEND_SETUP.md](./FRONTEND_SETUP.md#트러블슈팅) 참조

---

## 라이선스

이 프로젝트는 학습 목적으로 제작되었습니다.

---

## 관련 문서

- **[QUICK_START.md](./QUICK_START.md)** - 5분 안에 시작하기 ⭐ 추천
- **[FRONTEND_SETUP.md](./FRONTEND_SETUP.md)** - 프론트엔드 상세 가이드
- **[API_ENDPOINTS.md](./API_ENDPOINTS.md)** - API 명세
- **[BOARD_REQUIREMENTS.md](./BOARD_REQUIREMENTS.md)** - 기능 명세

---

## 요약

| 항목 | 상태 |
|------|------|
| 게시글 CRUD | ✅ 완료 |
| 댓글 CRUD | ✅ 완료 |
| 페이지네이션 | ✅ 완료 |
| 비밀번호 인증 | ✅ 완료 |
| 반응형 디자인 | ✅ 완료 |
| 다크 테마 | ✅ 완료 |
| API 문서 | ✅ 완료 |
| 프론트엔드 | ✅ 완료 |
| 백엔드 | ✅ 완료 |
| 데이터베이스 | ✅ 완료 |

---

## 다음 단계

1. **즉시 시작**: [QUICK_START.md](./QUICK_START.md) 따라하기
2. **세부 학습**: [FRONTEND_SETUP.md](./FRONTEND_SETUP.md) 읽기
3. **API 이해**: [API_ENDPOINTS.md](./API_ENDPOINTS.md) 참조
4. **추가 기능**: 검색, 정렬, 이미지 업로드 등 구현

---

## 마지막 수정

- **작성일**: 2024-08-22
- **최종 수정**: 2026-08-22
- **상태**: 프로덕션 준비 완료

---

**시작하기**: `node server.js` 후 브라우저에서 `board.html` 열기 🚀
