import { Router } from 'express';
import { postController } from '../controllers/posts.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import {
  createPostSchema,
  updatePostSchema,
  postIdParamSchema,
  listPostsQuerySchema,
} from '../validators/post.validator.js';

const router = Router();

router
  .route('/')
  .get(
    validate({ query: listPostsQuerySchema }),
    postController.findAll.bind(postController)
  )
  .post(
    authenticate,
    validate({ body: createPostSchema }),
    postController.create.bind(postController)
  );
router
  .route('/:id')
  .get(
    validate({params: postIdParamSchema}),
    postController.findById.bind(postController)
  )
    .patch(
    validate({params: postIdParamSchema, body: updatePostSchema}),
    postController.update.bind(postController)
  )
    .delete(
    validate({params: postIdParamSchema}),
    postController.delete.bind(postController)
  );

export {router as postRouter};