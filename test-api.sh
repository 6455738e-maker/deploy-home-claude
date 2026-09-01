#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8000/api"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}비회원 게시판 API 테스트${NC}"
echo -e "${BLUE}========================================${NC}\n"

# 1. 헬스 체크
echo -e "${GREEN}[1] 헬스 체크${NC}"
curl -s http://localhost:8000/health | jq .
echo ""

# 2. 게시글 작성
echo -e "${GREEN}[2] 게시글 작성${NC}"
POST_RESPONSE=$(curl -s -X POST $BASE_URL/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "테스트 게시글",
    "content": "이것은 테스트 게시글입니다. 이 글은 API 테스트를 위해 작성되었습니다.",
    "author": "테스트 사용자",
    "password": "testpass123"
  }')

echo "$POST_RESPONSE" | jq .
POST_ID=$(echo "$POST_RESPONSE" | jq -r '.data.id')
echo -e "생성된 게시글 ID: ${BLUE}$POST_ID${NC}\n"

# 3. 게시글 목록 조회
echo -e "${GREEN}[3] 게시글 목록 조회 (페이지네이션)${NC}"
curl -s "$BASE_URL/posts?page=1&limit=10" | jq .
echo ""

# 4. 게시글 상세 조회
echo -e "${GREEN}[4] 게시글 상세 조회${NC}"
curl -s "$BASE_URL/posts/$POST_ID" | jq .
echo ""

# 5. 게시글 수정
echo -e "${GREEN}[5] 게시글 수정${NC}"
curl -s -X PUT "$BASE_URL/posts/$POST_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "수정된 게시글 제목",
    "password": "testpass123"
  }' | jq .
echo ""

# 6. 댓글 작성
echo -e "${GREEN}[6] 댓글 작성${NC}"
COMMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/posts/$POST_ID/comments" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "좋은 글이네요! 이 주제에 대해 더 알고 싶습니다.",
    "author": "댓글 작성자",
    "password": "comment1234"
  }')

echo "$COMMENT_RESPONSE" | jq .
COMMENT_ID=$(echo "$COMMENT_RESPONSE" | jq -r '.data.id')
echo -e "생성된 댓글 ID: ${BLUE}$COMMENT_ID${NC}\n"

# 7. 댓글 목록 조회
echo -e "${GREEN}[7] 댓글 목록 조회${NC}"
curl -s "$BASE_URL/posts/$POST_ID/comments" | jq .
echo ""

# 8. 댓글 수정
echo -e "${GREEN}[8] 댓글 수정${NC}"
curl -s -X PUT "$BASE_URL/comments/$COMMENT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "정말 좋은 글입니다! 많은 도움이 되었습니다.",
    "password": "comment1234"
  }' | jq .
echo ""

# 9. 게시글 상세 조회 (수정된 버전과 댓글 확인)
echo -e "${GREEN}[9] 게시글 상세 조회 (최신 버전)${NC}"
curl -s "$BASE_URL/posts/$POST_ID" | jq .
echo ""

# 10. 잘못된 비밀번호로 삭제 시도
echo -e "${GREEN}[10] 잘못된 비밀번호로 게시글 삭제 시도${NC}"
curl -s -X DELETE "$BASE_URL/posts/$POST_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "wrongpassword"
  }' | jq .
echo ""

# 11. 댓글 삭제
echo -e "${GREEN}[11] 댓글 삭제${NC}"
curl -s -X DELETE "$BASE_URL/comments/$COMMENT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "comment1234"
  }' | jq .
echo ""

# 12. 게시글 삭제
echo -e "${GREEN}[12] 게시글 삭제${NC}"
curl -s -X DELETE "$BASE_URL/posts/$POST_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "testpass123"
  }' | jq .
echo ""

# 13. 삭제된 게시글 조회 시도
echo -e "${GREEN}[13] 삭제된 게시글 조회 시도${NC}"
curl -s "$BASE_URL/posts/$POST_ID" | jq .
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}테스트 완료${NC}"
echo -e "${BLUE}========================================${NC}"
