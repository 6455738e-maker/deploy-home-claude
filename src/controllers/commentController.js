import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../utils/passwordUtils.js';

const prisma = new PrismaClient();

/**
 * 댓글 목록 조회
 */
export async function getComments(req, res) {
  try {
    const { postId } = req.params;
    const id = parseInt(postId);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'postId는 숫자여야 합니다.',
      });
    }

    // 게시글 존재 여부 확인
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 게시글입니다.',
      });
    }

    const comments = await prisma.comment.findMany({
      where: { postId: id },
      select: {
        id: true,
        content: true,
        author: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('[getComments Error]', error);
    res.status(500).json({
      success: false,
      message: '댓글을 조회하는 중 오류가 발생했습니다.',
    });
  }
}

/**
 * 댓글 작성
 */
export async function createComment(req, res) {
  try {
    const { postId } = req.params;
    const { content, author, password } = req.body;
    const id = parseInt(postId);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'postId는 숫자여야 합니다.',
      });
    }

    // 입력값 검증
    if (!content || !author || !password) {
      return res.status(400).json({
        success: false,
        message: '내용, 작성자명, 비밀번호는 필수입니다.',
      });
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '내용은 공백이 아닌 문자열이어야 합니다.',
      });
    }

    if (typeof author !== 'string' || author.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '작성자명은 공백이 아닌 문자열이어야 합니다.',
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        message: '댓글은 최대 500자까지 입력 가능합니다.',
      });
    }

    if (author.length > 50) {
      return res.status(400).json({
        success: false,
        message: '작성자명은 최대 50자까지 입력 가능합니다.',
      });
    }

    if (typeof password !== 'string' || password.length < 4) {
      return res.status(400).json({
        success: false,
        message: '비밀번호는 최소 4자 이상이어야 합니다.',
      });
    }

    // 게시글 존재 여부 확인
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 게시글입니다.',
      });
    }

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password);

    const comment = await prisma.comment.create({
      data: {
        postId: id,
        content: content.trim(),
        author: author.trim(),
        password: hashedPassword,
      },
      select: {
        id: true,
        postId: true,
        content: true,
        author: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: '댓글이 작성되었습니다.',
      data: comment,
    });
  } catch (error) {
    console.error('[createComment Error]', error);
    res.status(500).json({
      success: false,
      message: '댓글을 작성하는 중 오류가 발생했습니다.',
    });
  }
}

/**
 * 댓글 수정
 */
export async function updateComment(req, res) {
  try {
    const { id } = req.params;
    const { content, password } = req.body;
    const commentId = parseInt(id);

    if (isNaN(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'ID는 숫자여야 합니다.',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: '비밀번호를 입력하세요.',
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: '내용을 입력하세요.',
      });
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '내용은 공백이 아닌 문자열이어야 합니다.',
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        message: '댓글은 최대 500자까지 입력 가능합니다.',
      });
    }

    // 기존 댓글 조회
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 댓글입니다.',
      });
    }

    // 비밀번호 검증
    const isPasswordValid = await verifyPassword(password, comment.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '비밀번호가 일치하지 않습니다.',
      });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
      select: {
        id: true,
        postId: true,
        content: true,
        author: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: '댓글이 수정되었습니다.',
      data: updatedComment,
    });
  } catch (error) {
    console.error('[updateComment Error]', error);
    res.status(500).json({
      success: false,
      message: '댓글을 수정하는 중 오류가 발생했습니다.',
    });
  }
}

/**
 * 댓글 삭제
 */
export async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const commentId = parseInt(id);

    if (isNaN(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'ID는 숫자여야 합니다.',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: '비밀번호를 입력하세요.',
      });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 댓글입니다.',
      });
    }

    // 비밀번호 검증
    const isPasswordValid = await verifyPassword(password, comment.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '비밀번호가 일치하지 않습니다.',
      });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({
      success: true,
      message: '댓글이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('[deleteComment Error]', error);
    res.status(500).json({
      success: false,
      message: '댓글을 삭제하는 중 오류가 발생했습니다.',
    });
  }
}
