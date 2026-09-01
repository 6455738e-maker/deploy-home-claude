# 비회원 게시판 API 테스트 스크립트 (PowerShell)

$BASE_URL = "http://localhost:8000/api"
$null = @"
========================================
비회원 게시판 API 테스트
========================================
"@

Write-Host "========================================" -ForegroundColor Blue
Write-Host "비회원 게시판 API 테스트" -ForegroundColor Blue
Write-Host "========================================`n" -ForegroundColor Blue

# 1. 헬스 체크
Write-Host "[1] 헬스 체크" -ForegroundColor Green
$response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method Get -ContentType "application/json" | Select-Object -ExpandProperty Content | ConvertFrom-Json
$response | ConvertTo-Json -Depth 10 | Write-Host
Write-Host ""

# 2. 게시글 작성
Write-Host "[2] 게시글 작성" -ForegroundColor Green
$createPostBody = @{
    title = "테스트 게시글"
    content = "이것은 테스트 게시글입니다. 이 글은 API 테스트를 위해 작성되었습니다."
    author = "테스트 사용자"
    password = "testpass123"
} | ConvertTo-Json

$postResponse = Invoke-WebRequest -Uri "$BASE_URL/posts" -Method Post -ContentType "application/json" -Body $createPostBody | Select-Object -ExpandProperty Content | ConvertFrom-Json
$postResponse | ConvertTo-Json -Depth 10 | Write-Host

$POST_ID = $postResponse.data.id
Write-Host "`n생성된 게시글 ID: $POST_ID" -ForegroundColor Blue

# 3. 게시글 목록 조회
Write-Host "`n[3] 게시글 목록 조회 (페이지네이션)" -ForegroundColor Green
$listResponse = Invoke-WebRequest -Uri "$BASE_URL/posts?page=1&limit=10" -Method Get -ContentType "application/json" | Select-Object -ExpandProperty Content | ConvertFrom-Json
$listResponse | ConvertTo-Json -Depth 10 | Write-Host

# 4. 게시글 상세 조회
Write-Host "`n[4] 게시글 상세 조회" -ForegroundColor Green
$detailResponse = Invoke-WebRequest -Uri "$BASE_URL/posts/$POST_ID" -Method Get -ContentType "application/json" | Select-Object -ExpandProperty Content | ConvertFrom-Json
$detailResponse | ConvertTo-Json -Depth 10 | Write-Host

# 5. 게시글 수정
Write-Host "`n[5] 게시글 수정" -ForegroundColor Green
$updatePostBody = @{
    title = "수정된 게시글 제목"
    password = "testpass123"
} | ConvertTo-Json

$updateResponse = Invoke-WebRequest -Uri "$BASE_URL/posts/$POST_ID" -Method Put -ContentType "application/json" -Body $updatePostBody | Select-Object -ExpandProperty Content | ConvertFrom-Json
$updateResponse | ConvertTo-Json -Depth 10 | Write-Host

# 6. 댓글 작성
Write-Host "`n[6] 댓글 작성" -ForegroundColor Green
$createCommentBody = @{
    content = "좋은 글이네요! 이 주제에 대해 더 알고 싶습니다."
    author = "댓글 작성자"
    password = "comment1234"
} | ConvertTo-Json

$commentResponse = Invoke-WebRequest -Uri "$BASE_URL/posts/$POST_ID/comments" -Method Post -ContentType "application/json" -Body $createCommentBody | Select-Object -ExpandProperty Content | ConvertFrom-Json
$commentResponse | ConvertTo-Json -Depth 10 | Write-Host

$COMMENT_ID = $commentResponse.data.id
Write-Host "`n생성된 댓글 ID: $COMMENT_ID" -ForegroundColor Blue

# 7. 댓글 목록 조회
Write-Host "`n[7] 댓글 목록 조회" -ForegroundColor Green
$commentListResponse = Invoke-WebRequest -Uri "$BASE_URL/posts/$POST_ID/comments" -Method Get -ContentType "application/json" | Select-Object -ExpandProperty Content | ConvertFrom-Json
$commentListResponse | ConvertTo-Json -Depth 10 | Write-Host

# 8. 댓글 수정
Write-Host "`n[8] 댓글 수정" -ForegroundColor Green
$updateCommentBody = @{
    content = "정말 좋은 글입니다! 많은 도움이 되었습니다."
    password = "comment1234"
} | ConvertTo-Json

$updateCommentResponse = Invoke-WebRequest -Uri "$BASE_URL/comments/$COMMENT_ID" -Method Put -ContentType "application/json" -Body $updateCommentBody | Select-Object -ExpandProperty Content | ConvertFrom-Json
$updateCommentResponse | ConvertTo-Json -Depth 10 | Write-Host

# 9. 게시글 상세 조회 (수정된 버전과 댓글 확인)
Write-Host "`n[9] 게시글 상세 조회 (최신 버전)" -ForegroundColor Green
$latestDetailResponse = Invoke-WebRequest -Uri "$BASE_URL/posts/$POST_ID" -Method Get -ContentType "application/json" | Select-Object -ExpandProperty Content | ConvertFrom-Json
$latestDetailResponse | ConvertTo-Json -Depth 10 | Write-Host

# 10. 잘못된 비밀번호로 삭제 시도
Write-Host "`n[10] 잘못된 비밀번호로 게시글 삭제 시도" -ForegroundColor Green
$wrongPasswordBody = @{
    password = "wrongpassword"
} | ConvertTo-Json

$wrongPasswordResponse = Invoke-WebRequest -Uri "$BASE_URL/posts/$POST_ID" -Method Delete -ContentType "application/json" -Body $wrongPasswordBody | Select-Object -ExpandProperty Content | ConvertFrom-Json
$wrongPasswordResponse | ConvertTo-Json -Depth 10 | Write-Host

# 11. 댓글 삭제
Write-Host "`n[11] 댓글 삭제" -ForegroundColor Green
$deleteCommentBody = @{
    password = "comment1234"
} | ConvertTo-Json

$deleteCommentResponse = Invoke-WebRequest -Uri "$BASE_URL/comments/$COMMENT_ID" -Method Delete -ContentType "application/json" -Body $deleteCommentBody | Select-Object -ExpandProperty Content | ConvertFrom-Json
$deleteCommentResponse | ConvertTo-Json -Depth 10 | Write-Host

# 12. 게시글 삭제
Write-Host "`n[12] 게시글 삭제" -ForegroundColor Green
$deletePostBody = @{
    password = "testpass123"
} | ConvertTo-Json

$deletePostResponse = Invoke-WebRequest -Uri "$BASE_URL/posts/$POST_ID" -Method Delete -ContentType "application/json" -Body $deletePostBody | Select-Object -ExpandProperty Content | ConvertFrom-Json
$deletePostResponse | ConvertTo-Json -Depth 10 | Write-Host

# 13. 삭제된 게시글 조회 시도
Write-Host "`n[13] 삭제된 게시글 조회 시도" -ForegroundColor Green
try {
    $deletedResponse = Invoke-WebRequest -Uri "$BASE_URL/posts/$POST_ID" -Method Get -ContentType "application/json" | Select-Object -ExpandProperty Content | ConvertFrom-Json
    $deletedResponse | ConvertTo-Json -Depth 10 | Write-Host
}
catch {
    $errorResponse = $_.Exception.Response.Content | ConvertFrom-Json
    $errorResponse | ConvertTo-Json -Depth 10 | Write-Host
}

Write-Host "`n========================================" -ForegroundColor Blue
Write-Host "테스트 완료" -ForegroundColor Blue
Write-Host "========================================`n" -ForegroundColor Blue
