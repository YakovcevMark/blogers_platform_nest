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
  UseGuards,
} from '@nestjs/common';
import { CreatePostInputDto } from './input-dto/post.input-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { GetCommentsQueryParams } from '../../comments/api/input-dto/get-comments-query-params.input-dto';
import { UpdatePostDto } from './input-dto/update-post.input-dto';
import { CreateCommentInputDto } from '../../comments/api/input-dto/comment.input-dto';
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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtOptionalAuthGuard } from '../../../users/guards/jwt-optional-auth.guard';
import { ChangePostLikeStatusCommand } from '../application/usecases/change-post-like-status.usecase';
import { BasicAuthGuard } from '../../../users/guards/basic-auth.guard';
import { CreateCommentCommand } from '../../comments/application/usecases/create-comment.usecase';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CommentViewDto } from '../../comments/api/view-dto/comment.view-dto';
import { GetCommentsQuery } from '../../comments/application/queries/get-comments.query';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { UpdatePostCommand } from '../application/usecases/update-post.usecase';
import { RemovePostCommand } from '../application/usecases/remove-post.usecase';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id.query';
import { PostViewDto } from './view-dto/posts.view-dto';
import { GetPostsQuery } from '../application/queries/get-posts.query';
import { GetCommentByIdQuery } from '../../comments/application/queries/get-comment-by-id.query';

@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
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
    return this.queryBus.execute<
      GetCommentsQuery,
      PaginatedViewDto<CommentViewDto[]>
    >(new GetCommentsQuery(postId, query, user?.id));
  }

  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  async createComment(
    @Param('postId') postId: string,
    @Body() body: CreateCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    const newCommentId = await this.commandBus.execute<
      CreateCommentCommand,
      string
    >(new CreateCommentCommand(postId, body, user.id));

    return this.queryBus.execute<GetCommentByIdQuery, CommentViewDto>(
      new GetCommentByIdQuery(newCommentId),
    );
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async getPosts(
    @Query() query: GetPostsQueryParams,
    @ExtractNotNecessaryUserFromRequest() user: NotNecessaryUserContextDto,
  ) {
    return this.queryBus.execute<
      GetPostsQuery,
      PaginatedViewDto<PostViewDto[]>
    >(new GetPostsQuery(query, user?.id));
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(@Body() body: CreatePostInputDto) {
    const id = await this.commandBus.execute<CreatePostCommand, string>(
      new CreatePostCommand(body),
    );
    return this.queryBus.execute<GetPostByIdQuery, PostViewDto>(
      new GetPostByIdQuery(id),
    );
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async getPost(
    @Param('id') id: string,
    @ExtractNotNecessaryUserFromRequest() user: NotNecessaryUserContextDto,
  ) {
    return this.queryBus.execute<GetPostByIdQuery, PostViewDto>(
      new GetPostByIdQuery(id, user?.id),
    );
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updatePost(@Param('id') id: string, @Body() body: UpdatePostDto) {
    return this.commandBus.execute(new UpdatePostCommand(id, body));
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    return this.commandBus.execute(new RemovePostCommand(id));
  }
}
