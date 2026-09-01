# 백엔드 구현 가이드

## 프로젝트 구조

```
day02/
├── src/
│   ├── controllers/
│   │   ├── postController.js      # 게시글 컨트롤러
│   │   └── commentController.js   # 댓글 컨트롤러
│   ├── routes/
│   │   ├── postRoutes.js          # 게시글 라우터
│   │   └── commentRoutes.js       # 댓글 라우터
│   └── utils/
│       └── passwordUtils.js       # 비밀번호 해싱/검증 유틸
├── prisma/
│   ├── schema.prisma              # Prisma 데이터 모델 정의
│   └── migrations/
│       └── 0_init/
│           └── migration.sql      # 마이그레이션 SQL 파일
├── server.js                      # Express 메인 서버
├── package.json                   # 프로젝트 의존성
├── .env                           # 환경 변수
├── API_ENDPOINTS.md               # API 엔드포인트 상세 가이드
└── test-api.sh / test-api.ps1    # API 테스트 스크립트
```

## 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database ORM**: Prisma
- **Password Hashing**: bcrypt
- **CORS**: cors 패키지

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 데이터베이스 설정

#### 마이그레이션 실행 (DB 연결 필요)
```bash
npx prisma migrate deploy
```

#### Prisma Client 생성
```bash
npx prisma generate
```

### 3. 서버 실행

#### 개발 모드 (자동 리로드)
```bash
npm run dev
```

#### 프로덕션 모드
```bash
npm start
```

기본 포트는 8000입니다. `.env` 파일에서 포트를 변경할 수 있습니다.

```env
PORT=8000
DATABASE_URL="mysql://user:password@localhost:3306/database"
```

## 구현 상세

### 1. 비밀번호 처리 (passwordUtils.js)

#### hashPassword(plainPassword)
- bcrypt로 평문 비밀번호를 해싱
- Salt rounds: 10
- 게시글/댓글 작성 시 호출

```javascript
const hashedPassword = await hashPassword('1234');
// 결과: $2b$10$... (bcrypt 해시)
```

#### verifyPassword(plainPassword, hashedPassword)
- 평문 비밀번호와 저장된 해시 비교
- 수정/삭제 시 권한 확인에 사용

```javascript
const isValid = await verifyPassword('1234', storedHash);
// 결과: boolean
```

### 2. 게시글 컨트롤러 (postController.js)

#### getPosts(req, res)
- 페이지네이션을 지원하는 게시글 목록 조회
- Query: `page` (기본: 1), `limit` (기본: 10)
- 응답에 댓글 수(`_count`) 포함
- 비밀번호는 응답에서 제외

#### getPostDetail(req, res)
- 특정 게시글과 관련된 모든 댓글 조회
- 게시글이 없으면 404 반환
- include 옵션으로 댓글 관계 포함

#### createPost(req, res)
- 게시글 작성 (비밀번호 해싱)
- 입력값 검증: 필드 필수, 길이 제약
- 201 상태 코드로 응답

#### updatePost(req, res)
- 제목/내용 수정 (선택적)
- 비밀번호 검증 필수
- 검증 실패 시 401 상태 코드

#### deletePost(req, res)
- 게시글 삭제 (비밀번호 검증)
- 게시글 삭제 시 댓글은 cascade delete로 자동 삭제
- 검증 실패 시 401 상태 코드

### 3. 댓글 컨트롤러 (commentController.js)

#### getComments(req, res)
- 특정 게시글의 댓글 목록 조회
- 시간순(오래된 순서)로 정렬

#### createComment(req, res)
- 댓글 작성 (비밀번호 해싱)
- 입력값 검증: 필드 필수, 길이 제약
- 게시글 존재 여부 확인
- 201 상태 코드로 응답

#### updateComment(req, res)
- 댓글 내용 수정
- 비밀번호 검증 필수
- 검증 실패 시 401 상태 코드

#### deleteComment(req, res)
- 댓글 삭제 (비밀번호 검증)
- 검증 실패 시 401 상태 코드

### 4. 라우팅 구조

#### postRoutes.js
```javascript
GET    /api/posts              → getPosts
POST   /api/posts              → createPost
GET    /api/posts/:id          → getPostDetail
PUT    /api/posts/:id          → updatePost
DELETE /api/posts/:id          → deletePost
```

#### commentRoutes.js
```javascript
GET    /api/posts/:postId/comments  → getComments
POST   /api/posts/:postId/comments  → createComment
PUT    /api/comments/:id            → updateComment
DELETE /api/comments/:id            → deleteComment
```

### 5. 미들웨어 (server.js)

#### CORS
```javascript
app.use(cors());
```
- 모든 오리진에서 요청 수락
- 프로덕션에서는 특정 오리진만 허용하도록 수정 필요

#### JSON Parser
```javascript
app.use(express.json());
```
- JSON 요청 바디 파싱

#### 요청 로깅
```javascript
console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
```

## 데이터 모델

### Post 모델 (tbl_post)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | Int | PK, Auto Increment |
| title | String(200) | 게시글 제목 |
| content | Text | 게시글 내용 |
| author | String(50) | 작성자명 |
| password | String | bcrypt 해시 |
| createdAt | DateTime | 생성 시간 |
| updatedAt | DateTime | 수정 시간 |

### Comment 모델 (tbl_comment)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | Int | PK, Auto Increment |
| postId | Int | FK, Cascade Delete |
| content | String(500) | 댓글 내용 |
| author | String(50) | 작성자명 |
| password | String | bcrypt 해시 |
| createdAt | DateTime | 생성 시간 |
| updatedAt | DateTime | 수정 시간 |

## 입력값 검증 규칙

### 게시글

| 필드 | 규칙 |
|------|------|
| title | 필수, 1-200자 |
| content | 필수, 1자 이상 |
| author | 필수, 1-50자 |
| password (작성) | 필수, 최소 4자 |
| password (수정/삭제) | 필수 |

### 댓글

| 필드 | 규칙 |
|------|------|
| content | 필수, 1-500자 |
| author | 필수, 1-50자 |
| password (작성) | 필수, 최소 4자 |
| password (수정/삭제) | 필수 |

## 에러 처리

### 상태 코드

- **201**: Created (성공적인 리소스 생성)
- **400**: Bad Request (입력값 검증 실패)
- **401**: Unauthorized (비밀번호 불일치)
- **404**: Not Found (리소스 없음)
- **500**: Internal Server Error (서버 오류)

### 응답 형식

#### 성공
```json
{
  "success": true,
  "message": "작업 메시지",
  "data": { /* 데이터 */ }
}
```

#### 실패
```json
{
  "success": false,
  "message": "에러 메시지"
}
```

## 주의사항

### 보안

1. **HTTPS 필수**: 비밀번호를 평문으로 전송하므로 프로덕션에서는 HTTPS를 반드시 사용해야 합니다.
2. **CORS 설정**: 프로덕션에서는 특정 오리진만 허용하도록 수정해야 합니다.
3. **환경 변수**: `.env` 파일을 `.gitignore`에 추가해야 합니다.
4. **SQL Injection**: Prisma ORM을 사용하므로 SQL Injection에는 안전합니다.

### 성능

1. **인덱싱**: Comment의 `postId`에 인덱스를 설정하여 조회 성능을 최적화했습니다.
2. **페이지네이션**: 게시글 목록 조회 시 페이지네이션을 사용하여 대량 데이터 조회를 제한합니다.
3. **Cascade Delete**: 게시글 삭제 시 댓글을 자동으로 삭제하므로 고아 데이터 문제를 방지합니다.

### 제약사항

1. **미디어 미지원**: 현재 텍스트 기반 게시판이므로 사진/영상 업로드는 지원하지 않습니다.
2. **회원 기능 없음**: 비회원 게시판이므로 사용자 인증은 비밀번호만 사용합니다.
3. **수정 권한**: 게시글/댓글은 작성자의 비밀번호로만 수정/삭제 가능합니다.

## 테스트

### 테스트 스크립트 실행

#### Bash
```bash
chmod +x test-api.sh
./test-api.sh
```

#### PowerShell
```powershell
powershell -ExecutionPolicy Bypass -File test-api.ps1
```

### 수동 테스트 (cURL)

```bash
# 게시글 작성
curl -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "테스트",
    "content": "내용",
    "author": "작성자",
    "password": "1234"
  }'

# 게시글 목록
curl http://localhost:8000/api/posts?page=1&limit=10

# 게시글 상세
curl http://localhost:8000/api/posts/1

# 댓글 작성
curl -X POST http://localhost:8000/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "댓글",
    "author": "작성자",
    "password": "1234"
  }'
```

## 디버깅

### 로그 확인
- 모든 요청/응답은 콘솔에 로깅됩니다.
- 요청 바디도 함께 출력되므로 데이터 검증에 도움이 됩니다.

### Prisma Studio (데이터 확인)
```bash
npx prisma studio
```
- GUI 인터페이스로 데이터베이스 데이터를 확인하고 관리할 수 있습니다.
- 기본 포트: http://localhost:5555

## 향후 확장 가능성

1. **캐싱**: Redis를 사용하여 자주 조회되는 게시글 캐시
2. **검색**: 제목/내용으로 게시글 검색 기능
3. **정렬**: 최신순, 인기순 등 다양한 정렬 옵션
4. **필터링**: 게시글 카테고리 필터링
5. **레이트 제한**: IP 기반 요청 제한
6. **모니터링**: 요청 로그 및 성능 모니터링
7. **미디어 지원**: 사진/영상 업로드 기능
8. **회원 기능**: 사용자 계정 및 인증 추가

---

**구현 완료일**: 2026-08-22  
**담당자**: 백엔드 CRUD 로직 구현 에이전트
