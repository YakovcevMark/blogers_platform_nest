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
import { BlogsService } from './blogs/application/blogs.service';
import { PostsRepository } from './posts/infrastracture/repo';
import { PostsQueryRepository } from './posts/infrastracture/query-repo';
import { PostsService } from './posts/application/posts.service';
import { CommentsRepository } from './comments/infrastracture/repo';
import { CommentsQueryRepository } from './comments/infrastracture/query-repo';
import { CommentsService } from './comments/application/comments.service';
import { BlogModelName, BlogSchema } from './blogs/domain/blog.entity';
import { UserModule } from '../users/user.module';

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
    BlogsQueryRepository,
    BlogsRepository,
    BlogsService,
    PostsRepository,
    PostsQueryRepository,
    PostsService,
    CommentsRepository,
    CommentsQueryRepository,
    CommentsService,
  ],
  exports: [],
})
export class BlogPlatformModule {}
