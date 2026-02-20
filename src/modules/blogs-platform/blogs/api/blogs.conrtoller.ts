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
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { CreateBlogInputDto } from './input-dto/blog.input-dto';
import { UpdateBlogDto } from './input-dto/update-blog.input-dto';
import { CreateBlogPostInputDto } from './input-dto/blog-post.input-dto';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { BasicAuthGuard } from '../../../users/guards/basic-auth.guard';
import { JwtOptionalAuthGuard } from '../../../users/guards/jwt-optional-auth.guard';
import { ExtractNotNecessaryUserFromRequest } from '../../../users/guards/decorators/param/extract-user-from-request.decorator';
import { NotNecessaryUserContextDto } from '../../../users/guards/dto/user-context.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id.query';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { CreatePostCommand } from '../../posts/application/usecases/create-post.usecase';
import { GetPostByIdQuery } from '../../posts/application/queries/get-post-by-id.query';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { GetBlogsQuery } from '../application/queries/get-blogs.query';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { GetPostsQuery } from '../../posts/application/queries/get-posts.query';
import { RemoveBlogCommand } from '../application/usecases/remove-blog.usecase';

@Controller('blogs')
export class BlogsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  async gelBlogs(@Query() query: GetBlogsQueryParams) {
    return this.queryBus.execute<
      GetBlogsQuery,
      PaginatedViewDto<BlogViewDto[]>
    >(new GetBlogsQuery(query));
  }

  @Get(':id')
  async getBlog(@Param('id') id: string) {
    return this.queryBus.execute<GetBlogByIdQuery, BlogViewDto>(
      new GetBlogByIdQuery(id),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() body: CreateBlogInputDto) {
    const id = await this.commandBus.execute<CreateBlogCommand, string>(
      new CreateBlogCommand(body),
    );
    return this.queryBus.execute<GetBlogByIdQuery, BlogViewDto>(
      new GetBlogByIdQuery(id),
    );
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateBlog(@Param('id') id: string, @Body() body: UpdateBlogDto) {
    return this.commandBus.execute(new UpdateBlogCommand(id, body));
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id/posts')
  async getPosts(
    @Query() query: GetPostsQueryParams,
    @Param('id') id: string,
    @ExtractNotNecessaryUserFromRequest() user: NotNecessaryUserContextDto,
  ) {
    const blog = await this.queryBus.execute<GetBlogByIdQuery, BlogViewDto>(
      new GetBlogByIdQuery(id),
    );
    query.blogId = blog.id;
    return this.queryBus.execute<
      GetPostsQuery,
      PaginatedViewDto<PostViewDto[]>
    >(new GetPostsQuery(query, user?.id));
  }

  @UseGuards(BasicAuthGuard)
  @Post(':id/posts')
  async createPosts(
    @Param('id') id: string,
    @Body() body: CreateBlogPostInputDto,
  ) {
    const newPostId = await this.commandBus.execute<CreatePostCommand, string>(
      new CreatePostCommand({
        ...body,
        blogId: id,
      }),
    );
    return this.queryBus.execute<GetPostByIdQuery, PostViewDto>(
      new GetPostByIdQuery(newPostId),
    );
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteBlog(@Param('id') id: string) {
    await this.commandBus.execute(new RemoveBlogCommand(id));
  }
}
