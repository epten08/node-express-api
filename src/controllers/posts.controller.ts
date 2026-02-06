import { type Request, type Response, type NextFunction } from 'express';
import { postService } from '../services/post.service.js';
import { sendSuccess } from '../utils/response.js';
import type {
  CreatePostInput,
  ListPostsQuery,
} from '../validators/post.validator.js';

export class PostController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await postService.create(req.body as CreatePostInput, req.user!.id);
      sendSuccess(res, post, 'Post created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await postService.findAll(req.query as unknown as ListPostsQuery);
      sendSuccess(res, result.posts, 'Posts retrieved successfully', 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await postService.findById(req.params.id);
      sendSuccess(res, post, 'Post retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await postService.update(req.params.id, req.body);
      sendSuccess(res, post, 'Post updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await postService.delete(req.params.id);
      sendSuccess(res, null, 'Post deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const postController = new PostController();