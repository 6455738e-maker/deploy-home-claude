import express from 'express';
import {
  getPosts,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/postController.js';

const router = express.Router();

/**
 * GET /api/posts - 게시글 목록 조회 (페이지네이션)
 * Query: page, limit
 */
router.get('/', getPosts);

/**
 * POST /api/posts - 게시글 작성
 * Body: { title, content, author, password }
 */
router.post('/', createPost);

/**
 * GET /api/posts/:id - 게시글 상세 조회
 */
router.get('/:id', getPostDetail);

/**
 * PUT /api/posts/:id - 게시글 수정
 * Body: { title?, content?, password }
 */
router.put('/:id', updatePost);

/**
 * DELETE /api/posts/:id - 게시글 삭제
 * Body: { password }
 */
router.delete('/:id', deletePost);

export default router;
