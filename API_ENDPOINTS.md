# 비회원 게시판 API 엔드포인트

## 기본 정보

**Base URL**: `http://localhost:8000/api`  
**Content-Type**: `application/json`  
**Response Format**: JSON

## 공통 응답 형식

### 성공 응답 (2xx)
```json
{
  "success": true,
  "message": "작업이 완료되었습니다.",
  "data": { /* 데이터 */ },
  "pagination": { /* 페이지네이션 정보 (해당하는 경우만) */ }
}
```

### 실패 응답 (4xx, 5xx)
```json
{
  "success": false,
  "message": "에러 메시지"
}
```

---

## 게시글 (Post) API

### 1. 게시글 목록 조회
**엔드포인트**: `GET /posts`

**Query Parameters**:
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|-------|------|
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 10 | 페이지당 게시글 수 |

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "첫 번째 게시글",
      "author": "김철수",
      "createdAt": "2024-08-22T10:30:00.000Z",
      "updatedAt": "2024-08-22T10:30:00.000Z",
      "_count": { "comments": 3 }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Example**:
```bash
curl http://localhost:8000/api/posts?page=1&limit=10
```

---

### 2. 게시글 상세 조회
**엔드포인트**: `GET /posts/:id`

**Path Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 게시글 ID |

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "첫 번째 게시글",
    "content": "게시글 내용입니다.",
    "author": "김철수",
    "createdAt": "2024-08-22T10:30:00.000Z",
    "updatedAt": "2024-08-22T10:30:00.000Z",
    "comments": [
      {
        "id": 1,
        "content": "좋은 글이네요",
        "author": "이영희",
        "createdAt": "2024-08-22T11:00:00.000Z",
        "updatedAt": "2024-08-22T11:00:00.000Z"
      }
    ]
  }
}
```

**Example**:
```bash
curl http://localhost:8000/api/posts/1
```

---

### 3. 게시글 작성
**엔드포인트**: `POST /posts`

**Request Body**:
```json
{
  "title": "새로운 게시글",
  "content": "게시글 내용입니다.",
  "author": "김철수",
  "password": "1234"
}
```

**Body Fields**:
| 필드 | 타입 | 필수 | 제약조건 |
|------|------|------|---------|
| `title` | string | O | 1-200자 |
| `content` | string | O | 1자 이상 |
| `author` | string | O | 1-50자 |
| `password` | string | O | 최소 4자 |

**Response** (201 Created):
```json
{
  "success": true,
  "message": "게시글이 작성되었습니다.",
  "data": {
    "id": 1,
    "title": "새로운 게시글",
    "content": "게시글 내용입니다.",
    "author": "김철수",
    "createdAt": "2024-08-22T10:30:00.000Z",
    "updatedAt": "2024-08-22T10:30:00.000Z"
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "새로운 게시글",
    "content": "게시글 내용입니다.",
    "author": "김철수",
    "password": "1234"
  }'
```

---

### 4. 게시글 수정
**엔드포인트**: `PUT /posts/:id`

**Path Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 게시글 ID |

**Request Body**:
```json
{
  "title": "수정된 제목",
  "content": "수정된 내용",
  "password": "1234"
}
```

**Body Fields**:
| 필드 | 타입 | 필수 | 제약조건 |
|------|------|------|---------|
| `title` | string | X | 1-200자 |
| `content` | string | X | 1자 이상 |
| `password` | string | O | 최소 4자 |

**Response**:
```json
{
  "success": true,
  "message": "게시글이 수정되었습니다.",
  "data": { /* 수정된 게시글 */ }
}
```

**Example**:
```bash
curl -X PUT http://localhost:8000/api/posts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "수정된 제목",
    "password": "1234"
  }'
```

---

### 5. 게시글 삭제
**엔드포인트**: `DELETE /posts/:id`

**Path Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 게시글 ID |

**Request Body**:
```json
{
  "password": "1234"
}
```

**Response**:
```json
{
  "success": true,
  "message": "게시글이 삭제되었습니다."
}
```

**Example**:
```bash
curl -X DELETE http://localhost:8000/api/posts/1 \
  -H "Content-Type: application/json" \
  -d '{"password": "1234"}'
```

---

## 댓글 (Comment) API

### 1. 댓글 목록 조회
**엔드포인트**: `GET /posts/:postId/comments`

**Path Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `postId` | number | 게시글 ID |

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "content": "좋은 글이네요",
      "author": "이영희",
      "createdAt": "2024-08-22T11:00:00.000Z",
      "updatedAt": "2024-08-22T11:00:00.000Z"
    }
  ]
}
```

**Example**:
```bash
curl http://localhost:8000/api/posts/1/comments
```

---

### 2. 댓글 작성
**엔드포인트**: `POST /posts/:postId/comments`

**Path Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `postId` | number | 게시글 ID |

**Request Body**:
```json
{
  "content": "좋은 글이네요",
  "author": "이영희",
  "password": "1234"
}
```

**Body Fields**:
| 필드 | 타입 | 필수 | 제약조건 |
|------|------|------|---------|
| `content` | string | O | 1-500자 |
| `author` | string | O | 1-50자 |
| `password` | string | O | 최소 4자 |

**Response** (201 Created):
```json
{
  "success": true,
  "message": "댓글이 작성되었습니다.",
  "data": {
    "id": 1,
    "postId": 1,
    "content": "좋은 글이네요",
    "author": "이영희",
    "createdAt": "2024-08-22T11:00:00.000Z",
    "updatedAt": "2024-08-22T11:00:00.000Z"
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:8000/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "좋은 글이네요",
    "author": "이영희",
    "password": "1234"
  }'
```

---

### 3. 댓글 수정
**엔드포인트**: `PUT /comments/:id`

**Path Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 댓글 ID |

**Request Body**:
```json
{
  "content": "수정된 댓글 내용",
  "password": "1234"
}
```

**Body Fields**:
| 필드 | 타입 | 필수 | 제약조건 |
|------|------|------|---------|
| `content` | string | O | 1-500자 |
| `password` | string | O | 최소 4자 |

**Response**:
```json
{
  "success": true,
  "message": "댓글이 수정되었습니다.",
  "data": { /* 수정된 댓글 */ }
}
```

**Example**:
```bash
curl -X PUT http://localhost:8000/api/comments/1 \
  -H "Content-Type: application/json" \
  -d '{
    "content": "수정된 댓글 내용",
    "password": "1234"
  }'
```

---

### 4. 댓글 삭제
**엔드포인트**: `DELETE /comments/:id`

**Path Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 댓글 ID |

**Request Body**:
```json
{
  "password": "1234"
}
```

**Response**:
```json
{
  "success": true,
  "message": "댓글이 삭제되었습니다."
}
```

**Example**:
```bash
curl -X DELETE http://localhost:8000/api/comments/1 \
  -H "Content-Type: application/json" \
  -d '{"password": "1234"}'
```

---

## 에러 코드

| HTTP 상태 | 상황 | 응답 예 |
|-----------|------|--------|
| 400 | 잘못된 요청 (입력값 검증 실패) | `{ "success": false, "message": "제목은 필수입니다." }` |
| 401 | 비밀번호 불일치 | `{ "success": false, "message": "비밀번호가 일치하지 않습니다." }` |
| 404 | 리소스를 찾을 수 없음 | `{ "success": false, "message": "존재하지 않는 게시글입니다." }` |
| 500 | 서버 오류 | `{ "success": false, "message": "게시글을 조회하는 중 오류가 발생했습니다." }` |

---

## 헬스 체크

**엔드포인트**: `GET /health`

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-08-22T10:30:00.000Z"
}
```

---

## 테스트 스크립트

### 게시글 작성 후 조회
```bash
# 1. 게시글 작성
POST_ID=$(curl -s -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "테스트 게시글",
    "content": "이것은 테스트 게시글입니다.",
    "author": "테스트",
    "password": "1234"
  }' | jq '.data.id')

# 2. 게시글 목록 조회
curl http://localhost:8000/api/posts

# 3. 게시글 상세 조회
curl http://localhost:8000/api/posts/$POST_ID

# 4. 댓글 작성
curl -X POST http://localhost:8000/api/posts/$POST_ID/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "댓글 테스트",
    "author": "댓글 작성자",
    "password": "1234"
  }'
```

---

## 주의사항

1. **비밀번호 보안**: 프론트엔드에서 비밀번호를 평문으로 전송하므로 HTTPS를 반드시 사용해야 합니다.
2. **비밀번호 저장**: 서버에서는 bcrypt로 비밀번호를 해싱하여 저장합니다.
3. **응답 제외**: 모든 응답에서 password 필드는 포함되지 않습니다.
4. **Cascade Delete**: 게시글 삭제 시 해당 게시글의 모든 댓글이 자동으로 삭제됩니다.
5. **페이지네이션**: 기본값은 page=1, limit=10입니다.
