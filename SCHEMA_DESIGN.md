# 비회원 게시판 - Prisma DB 스키마 설계 가이드

## 개요
기능명세서(BOARD_REQUIREMENTS.md)를 기반으로 Prisma ORM을 이용한 MySQL 데이터베이스 스키마를 설계했습니다.

---

## 설계된 모델 (Models)

### 1. Post (게시글)
**테이블명**: `tbl_post`

| 필드명 | 타입 | 특성 | 설명 |
|--------|------|------|------|
| `id` | Int | PK, Auto Increment | 게시글 고유 ID |
| `title` | String(VarChar 200) | NOT NULL | 게시글 제목 (최대 200자) |
| `content` | String(LongText) | NOT NULL | 게시글 내용 (긴 텍스트) |
| `author` | String(VarChar 50) | NOT NULL | 작성자명 (최대 50자) |
| `password` | String | NOT NULL | bcrypt 해시된 비밀번호 |
| `createdAt` | DateTime | NOT NULL, Auto | 작성일시 (자동 생성) |
| `updatedAt` | DateTime | NOT NULL, Auto | 수정일시 (자동 갱신) |
| `comments` | Comment[] | Relation | 게시글의 댓글들 (1:N 관계) |

**주요 특성**:
- 게시글 ID는 자동 증분
- 댓글과 1:N 관계 (1개의 게시글에 여러 댓글)

---

### 2. Comment (댓글)
**테이블명**: `tbl_comment`

| 필드명 | 타입 | 특성 | 설명 |
|--------|------|------|------|
| `id` | Int | PK, Auto Increment | 댓글 고유 ID |
| `postId` | Int | NOT NULL, FK | 게시글 ID (외래키) |
| `content` | String(VarChar 500) | NOT NULL | 댓글 내용 (최대 500자) |
| `author` | String(VarChar 50) | NOT NULL | 작성자명 (최대 50자) |
| `password` | String | NOT NULL | bcrypt 해시된 비밀번호 |
| `createdAt` | DateTime | NOT NULL, Auto | 작성일시 (자동 생성) |
| `updatedAt` | DateTime | NOT NULL, Auto | 수정일시 (자동 갱신) |
| `post` | Post | Relation | 댓글의 부모 게시글 |

**주요 특성**:
- 댓글 ID는 자동 증분
- Post와 N:1 관계 (여러 댓글이 1개의 게시글에 속함)
- **onDelete: Cascade** 설정 - 게시글 삭제 시 해당 댓글들도 함께 삭제
- postId에 인덱스 설정 - 게시글별 댓글 조회 성능 최적화

---

## 관계 (Relationship)

```
Post (1) ──────── (N) Comment
  ↓
id ← postId (FK)
```

- **Post**: 게시글을 의미합니다
- **Comment**: 각 게시글에 속하는 댓글입니다
- 한 개의 게시글(Post)에는 여러 개의 댓글(Comment)이 포함될 수 있습니다
- 게시글이 삭제되면 해당하는 모든 댓글도 함께 삭제됩니다 (Cascade Delete)

---

## 데이터베이스 설정

**Provider**: MySQL  
**URL**: `.env`의 `DATABASE_URL` 환경변수에서 읽음

```
DATABASE_URL="mysql://[user]:[password]@[host]:[port]/[database]"
```

현재 설정 예시:
```
DATABASE_URL="mysql://hr:1234@localhost:3307/claude"
```

---

## Prisma 마이그레이션 및 실행

### 1. 스키마 형식 검증
```bash
npm exec prisma format
```

### 2. 마이그레이션 생성
```bash
npm exec prisma migrate dev --name init
```
- 데이터베이스에 테이블 생성
- 마이그레이션 파일 생성 (`prisma/migrations/` 디렉토리)

### 3. Prisma Client 생성
```bash
npm exec prisma generate
```
- Prisma Client 타입 정의 생성
- 자동으로 마이그레이션 시 실행됨

### 4. Prisma Studio (데이터 관리 대시보드)
```bash
npm exec prisma studio
```
- GUI 인터페이스로 데이터베이스 데이터 조회/관리
- `http://localhost:5555` 접속

---

## Prisma Client 초기화 코드 (참고용)

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 사용 후 연결 해제
await prisma.$disconnect();
```

---

## CRUD 예제 (참고용)

### Create (생성)
```javascript
// 게시글 생성
const post = await prisma.post.create({
  data: {
    title: "안녕하세요",
    content: "첫 번째 게시글입니다",
    author: "김철수",
    password: "$2b$10$hashedPassword..." // bcrypt 해시
  }
});

// 댓글 생성
const comment = await prisma.comment.create({
  data: {
    postId: 1,
    content: "좋은 글이네요",
    author: "이영희",
    password: "$2b$10$hashedPassword..."
  }
});
```

### Read (조회)
```javascript
// 게시글 목록 조회
const posts = await prisma.post.findMany({
  orderBy: { createdAt: 'desc' },
  take: 10, // 페이지네이션
  skip: 0
});

// 게시글 상세 조회 (댓글 포함)
const post = await prisma.post.findUnique({
  where: { id: 1 },
  include: { comments: true }
});

// 댓글 목록 조회
const comments = await prisma.comment.findMany({
  where: { postId: 1 },
  orderBy: { createdAt: 'asc' }
});
```

### Update (수정)
```javascript
// 게시글 수정
const updated = await prisma.post.update({
  where: { id: 1 },
  data: {
    title: "수정된 제목",
    content: "수정된 내용"
  }
});

// 댓글 수정
const updatedComment = await prisma.comment.update({
  where: { id: 1 },
  data: {
    content: "수정된 댓글"
  }
});
```

### Delete (삭제)
```javascript
// 게시글 삭제 (댓글도 함께 삭제됨)
const deleted = await prisma.post.delete({
  where: { id: 1 }
});

// 댓글 삭제
const deletedComment = await prisma.comment.delete({
  where: { id: 1 }
});
```

---

## 주요 설계 결정 사항

### 1. 필드명 규칙
- **camelCase** 사용 (JavaScript 표준)
- `createdAt`, `updatedAt` (ISO 8601 표준)

### 2. 데이터 타입
- `title`, `content`: 텍스트 기반
  - title: VarChar(200) - 고정 길이 제약
  - content: LongText - 긴 텍스트 지원
- `author`: VarChar(50) - 작성자명 길이 제약
- `password`: String - bcrypt 해시 저장용 (가변 길이)

### 3. 시간 필드
- `createdAt`: `@default(now())` - 생성 시간 자동 기록
- `updatedAt`: `@updatedAt` - 수정 시 자동 갱신

### 4. 관계 설정
- Comment의 `postId`는 Post의 `id`를 참조
- `onDelete: Cascade` - 게시글 삭제 시 댓글도 함께 삭제
- `@@index([postId])` - 특정 게시글의 댓글 조회 성능 최적화

### 5. 인덱싱
- Comment의 `postId` 필드에 인덱스 적용
  - 게시글별 댓글 조회 시 쿼리 성능 향상

---

## 파일 경로

**스키마 파일**:
```
C:\Users\SAMSUNG\claude_1900_mky\workspace\claude2\day02\prisma\schema.prisma
```

**마이그레이션 디렉토리** (마이그레이션 후 생성):
```
C:\Users\SAMSUNG\claude_1900_mky\workspace\claude2\day02\prisma\migrations\
```

---

## 다음 단계

다음 담당자(백엔드 CRUD 로직 구현자)는 이 스키마를 기반으로:

1. ✅ **스키마 확인**: 이 설계가 요구사항을 만족하는지 검증
2. **마이그레이션 실행**: 데이터베이스에 테이블 생성
3. **API 구현**: Express.js 라우트에서 Prisma를 이용한 CRUD 로직 구현
4. **비밀번호 해싱**: bcrypt 라이브러리를 이용한 비밀번호 해싱 로직 추가
5. **테스트**: API 테스트 및 통합 테스트 수행

---

**설계 완료일**: 2026-08-22  
**담당자**: 데이터베이스 설계 에이전트
