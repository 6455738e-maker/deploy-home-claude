import express from 'express';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/commentController.js';

const router = express.Router();

/**
 * GET /api/posts/:postId/comments - 댓글 목록 조회
 */
router.get('/posts/:postId/comments', getComments);

/**
 * POST /api/posts/:postId/comments - 댓글 작성
 * Body: { content, author, password }
 */
router.post('/posts/:postId/comments', createComment);

/**
 * PUT /api/comments/:id - 댓글 수정
 * Body: { content, password }
 */
router.put('/comments/:id', updateComment);

/**
 * DELETE /api/comments/:id - 댓글 삭제
 * Body: { password }
 */
router.delete('/comments/:id', deleteComment);

export default router;
