import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostModelName, PostSchema } from './posts/domain/post.entity';
import {
  PostLikeModelName,
  PostLikeSchema,
} from './posts/domain/post-likes.entity';
import {
  CommentModelName,
  CommentSchema,
} from './comments/domain/comment.entity';
import {
  CommentLikeModelName,
  CommentLikeSchema,
} from './comments/domain/comment-like.entity';
import { BlogsController } from './blogs/api/blogs.conrtoller';
import { PostsController } from './posts/api/posts.controller';
import { CommentsController } from './comments/api/comments.controller';
import { BlogsQueryRepository } from './blogs/infrastracture/query-repo';
import { BlogsRepository } from './blogs/infrastracture/repo';
import { PostsRepository } from './posts/infrastracture/repo';
import { PostsQueryRepository } from './posts/infrastracture/query-repo';
import { CommentsRepository } from './comments/infrastracture/repo';
import { CommentsQueryRepository } from './comments/infrastracture/query-repo';
import { BlogModelName, BlogSchema } from './blogs/domain/blog.entity';
import { UserModule } from '../users/user.module';
import { ChangeCommentLikeStatusUseCase } from './comments/application/usecases/change-comment-like-status.usecase';
import { ChangePostLikeStatusUseCase } from './posts/application/usecases/change-post-like-status.usecase';
import { CreateCommentUseCase } from './comments/application/usecases/create-comment.usecase';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { RemoveCommentUseCase } from './comments/application/usecases/remove-comment.usecase';
import { GetCommentsQueryHandler } from './comments/application/queries/get-comments.query';
import { GetCommentByIdQueryHandler } from './comments/application/queries/get-comment-by-id.query';
import { CreatePostUseCase } from './posts/application/usecases/create-post.usecase';
import { UpdatePostUseCase } from './posts/application/usecases/update-post.usecase';
import { GetPostsQueryHandler } from './posts/application/queries/get-posts.query';
import { GetPostByIdQueryHandler } from './posts/application/queries/get-post-by-id.query';
import { GetBlogByIdQueryHandler } from './blogs/application/queries/get-blog-by-id.query';
import { CreateBlogUseCase } from './blogs/application/usecases/create-blog.usecase';
import { UpdateBlogUseCase } from './blogs/application/usecases/update-blog.usecase';
import { GetBlogsQueryHandler } from './blogs/application/queries/get-blogs.query';
import { RemoveBlogUseCase } from './blogs/application/usecases/remove-blog.usecase';
import { RemovePostUseCase } from './posts/application/usecases/remove-post.usecase';

const commandHandlers = [
  ChangeCommentLikeStatusUseCase,
  ChangePostLikeStatusUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  RemoveCommentUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  RemovePostUseCase,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  RemoveBlogUseCase,
];
const queryHandlers = [
  GetCommentsQueryHandler,
  GetCommentByIdQueryHandler,
  GetPostsQueryHandler,
  GetPostByIdQueryHandler,
  GetBlogByIdQueryHandler,
  GetBlogsQueryHandler,
];

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([{ name: BlogModelName, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: PostModelName, schema: PostSchema }]),
    MongooseModule.forFeature([
      { name: PostLikeModelName, schema: PostLikeSchema },
    ]),
    MongooseModule.forFeature([
      { name: CommentModelName, schema: CommentSchema },
    ]),
    MongooseModule.forFeature([
      { name: CommentLikeModelName, schema: CommentLikeSchema },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    ...queryHandlers,
    ...commandHandlers,
    BlogsQueryRepository,
    BlogsRepository,
    PostsRepository,
    PostsQueryRepository,
    CommentsRepository,
    CommentsQueryRepository,
  ],
  exports: [],
})
export class BlogPlatformModule {}
