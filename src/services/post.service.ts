import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import type { CreatePostInput, UpdatePostInput, ListPostsQuery } from '../validators/post.validator.js';

export class PostService {
  async create(data: CreatePostInput, authorId: string) {
    return prisma.post.create({
      data: {
        ...data,
        authorId,
      },
    });
  }
    async findById(id: string) {
    const post = await prisma.post.findUnique({
      where: { id },
    });
    if (!post) {
      throw AppError.notFound('Post not found');
    }
    return post;
  }
    async findAll(query: ListPostsQuery) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { content: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
          skip,
          take: limit,
        }),
        prisma.post.count({ where }),
      ]);
    return { posts, total, page, limit };
  }
    async update(id: string, data: UpdatePostInput) {
    const existing = await prisma.post.findUnique({
      where: { id },
    });
    if (!existing) {
      throw AppError.notFound('Post not found');
    }
    return prisma.post.update({
      where: { id },
      data,
    }); 
    }
    async delete(id: string) {
    const existing = await prisma.post.findUnique({
      where: { id },
    });
    if (!existing) {
      throw AppError.notFound('Post not found');
    }
    return prisma.post.delete({
      where: { id },
    });
    }
}

export const postService = new PostService();