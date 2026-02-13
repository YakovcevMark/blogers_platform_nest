import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
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
import { JwtAuthGuard } from '../../../users/guards/jwt-auth.guard';
import {
  ExtractNotNecessaryUserFromRequest,
  ExtractUserFromRequest,
} from '../../../users/guards/decorators/param/extract-user-from-request.decorator';
import {
  NotNecessaryUserContextDto,
  UserContextDto,
} from '../../../users/guards/dto/user-context.dto';
import { ChangePostLikeStatusInputDto } from './input-dto/change-post-like-status.input-dto';
import { CommandBus } from '@nestjs/cqrs';
import { JwtOptionalAuthGuard } from '../../../users/guards/jwt-optional-auth.guard';
import { ChangePostLikeStatusCommand } from '../application/usecases/change-post-like-status.usecase';
import { BasicAuthGuard } from '../../../users/guards/basic-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private postQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
    private commentsQueryRepository: CommentsQueryRepository,
    private commentsService: CommentsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePostLikeStatus(
    @ExtractUserFromRequest() user: UserContextDto,
    @Body() body: ChangePostLikeStatusInputDto,
    @Param('postId') postId: string,
  ) {
    return this.commandBus.execute(
      new ChangePostLikeStatusCommand({
        postId,
        userId: user.id,
        newLikeStatus: body.likeStatus,
      }),
    );
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':postId/comments')
  async getComments(
    @Query() query: GetCommentsQueryParams,
    @Param('postId') postId: string,
    @ExtractNotNecessaryUserFromRequest() user: NotNecessaryUserContextDto,
  ) {
    const post = await this.postQueryRepository.getById(postId);
    if (!post) throw new NotFoundException('Post not found');
    query.postId = post.id;
    return this.commentsQueryRepository.getAll(query, user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  async createComment(
    @Param('postId') postId: string,
    @Body() body: CreateCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    const newCommentId = await this.commentsService.create(
      postId,
      body,
      user.id,
    );
    return this.commentsQueryRepository.getById(newCommentId);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async getPosts(
    @Query() query: GetPostsQueryParams,
    @ExtractNotNecessaryUserFromRequest() user: NotNecessaryUserContextDto,
  ) {
    return this.postQueryRepository.getAll(query, user?.id);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(@Body() body: CreatePostInputDto) {
    const blog = await this.blogsQueryRepository.getById(body.blogId);
    const id = await this.postsService.create({ ...body, blogName: blog.name });
    return this.postQueryRepository.getById(id);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async getPost(
    @Param('id') id: string,
    @ExtractNotNecessaryUserFromRequest() user: NotNecessaryUserContextDto,
  ) {
    return this.postQueryRepository.getById(id, user?.id);
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updatePost(@Param('id') id: string, @Body() body: UpdatePostDto) {
    return this.postsService.update(id, body);
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
