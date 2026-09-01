import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../utils/passwordUtils.js';

const prisma = new PrismaClient();

/**
 * 게시글 목록 조회 (페이지네이션)
 */
export async function getPosts(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: 'page와 limit은 1 이상이어야 합니다.',
      });
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          author: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.post.count(),
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[getPosts Error]', error);
    res.status(500).json({
      success: false,
      message: '게시글 목록을 조회하는 중 오류가 발생했습니다.',
    });
  }
}

/**
 * 게시글 상세 조회
 */
export async function getPostDetail(req, res) {
  try {
    const { id } = req.params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: 'ID는 숫자여야 합니다.',
      });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        comments: {
          select: {
            id: true,
            content: true,
            author: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 게시글입니다.',
      });
    }

    // 비밀번호 필드는 응답에서 제외
    const { password, ...postData } = post;

    res.json({
      success: true,
      data: postData,
    });
  } catch (error) {
    console.error('[getPostDetail Error]', error);
    res.status(500).json({
      success: false,
      message: '게시글을 조회하는 중 오류가 발생했습니다.',
    });
  }
}

/**
 * 게시글 작성
 */
export async function createPost(req, res) {
  try {
    const { title, content, author, password } = req.body;

    // 입력값 검증
    if (!title || !content || !author || !password) {
      return res.status(400).json({
        success: false,
        message: '제목, 내용, 작성자명, 비밀번호는 필수입니다.',
      });
    }

    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '제목은 공백이 아닌 문자열이어야 합니다.',
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

    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        message: '제목은 최대 200자까지 입력 가능합니다.',
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

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password);

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
        password: hashedPassword,
      },
    });

    const { password: _, ...postData } = post;

    res.status(201).json({
      success: true,
      message: '게시글이 작성되었습니다.',
      data: postData,
    });
  } catch (error) {
    console.error('[createPost Error]', error);
    res.status(500).json({
      success: false,
      message: '게시글을 작성하는 중 오류가 발생했습니다.',
    });
  }
}

/**
 * 게시글 수정
 */
export async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { title, content, password } = req.body;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: 'ID는 숫자여야 합니다.',
      });
    }

    // 비밀번호는 필수
    if (!password) {
      return res.status(400).json({
        success: false,
        message: '비밀번호를 입력하세요.',
      });
    }

    // 기존 게시글 조회
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 게시글입니다.',
      });
    }

    // 비밀번호 검증
    const isPasswordValid = await verifyPassword(password, post.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '비밀번호가 일치하지 않습니다.',
      });
    }

    // 수정 데이터 준비
    const updateData = {};
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: '제목은 공백이 아닌 문자열이어야 합니다.',
        });
      }
      if (title.length > 200) {
        return res.status(400).json({
          success: false,
          message: '제목은 최대 200자까지 입력 가능합니다.',
        });
      }
      updateData.title = title.trim();
    }

    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: '내용은 공백이 아닌 문자열이어야 합니다.',
        });
      }
      updateData.content = content.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: '수정할 내용을 입력하세요.',
      });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
    });

    const { password: _, ...postData } = updatedPost;

    res.json({
      success: true,
      message: '게시글이 수정되었습니다.',
      data: postData,
    });
  } catch (error) {
    console.error('[updatePost Error]', error);
    res.status(500).json({
      success: false,
      message: '게시글을 수정하는 중 오류가 발생했습니다.',
    });
  }
}

/**
 * 게시글 삭제
 */
export async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const postId = parseInt(id);

    if (isNaN(postId)) {
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

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 게시글입니다.',
      });
    }

    // 비밀번호 검증
    const isPasswordValid = await verifyPassword(password, post.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '비밀번호가 일치하지 않습니다.',
      });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    res.json({
      success: true,
      message: '게시글이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('[deletePost Error]', error);
    res.status(500).json({
      success: false,
      message: '게시글을 삭제하는 중 오류가 발생했습니다.',
    });
  }
}
