import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsQueryRepository } from '../infrastracture/query-repo';
import { PostsService } from '../application/posts.service';
import { CreatePostInputDto } from './input-dto/post.input-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { CommentsQueryRepository } from '../../comments/infrastracture/query-repo';
import { GetCommentsQueryParams } from '../../comments/api/input-dto/get-comments-query-params.input-dto';
import { CommentsService } from '../../comments/application/comments.service';
import { UpdatePostDto } from './input-dto/update-post.input-dto';
import { CreateCommentInputDto } from '../../comments/api/input-dto/comment.input-dto';
import { BlogsQueryRepository } from '../../blogs/infrastracture/query-repo';

@Controller('posts')
export class PostsController {
  constructor(
    private postQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
    private commentsQueryRepository: CommentsQueryRepository,
    private commentsService: CommentsService,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  async gelPosts(@Query() query: GetPostsQueryParams) {
    return this.postQueryRepository.getAll(query);
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.postQueryRepository.getById(id);
  }

  @Post()
  async createPost(@Body() body: CreatePostInputDto) {
    const blog = await this.blogsQueryRepository.getById(body.blogId);
    const id = await this.postsService.create({ ...body, blogName: blog.name });
    return this.postQueryRepository.getById(id);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updatePost(@Param('id') id: string, @Body() body: UpdatePostDto) {
    return this.postsService.update(id, body);
  }

  @Get(':postId/comments')
  async getComments(
    @Query() query: GetCommentsQueryParams,
    @Param('postId') postId: string,
  ) {
    return this.commentsQueryRepository.getAll(query, postId);
  }

  @Post(':postId/comments')
  async createComment(
    @Param('id') postId: string,
    @Body() body: CreateCommentInputDto,
  ) {
    const newCommentId = await this.commentsService.create(postId, body);
    return this.commentsQueryRepository.getById(newCommentId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
