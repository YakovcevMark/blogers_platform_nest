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
import { BlogsQueryRepository } from '../infrastracture/query-repo';
import { BlogsService } from '../application/blogs.service';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { CreateBlogInputDto } from './input-dto/blog.input-dto';
import { UpdateBlogDto } from './input-dto/update-blog.input-dto';
import { PostsQueryRepository } from '../../posts/infrastracture/query-repo';
import { PostsService } from '../../posts/application/posts.service';
import { CreateBlogPostInputDto } from './input-dto/blog-post.input-dto';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { BasicAuthGuard } from '../../../users/guards/basic-auth.guard';
import { JwtOptionalAuthGuard } from '../../../users/guards/jwt-optional-auth.guard';
import { ExtractNotNecessaryUserFromRequest } from '../../../users/guards/decorators/param/extract-user-from-request.decorator';
import { NotNecessaryUserContextDto } from '../../../users/guards/dto/user-context.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postQueryRepository: PostsQueryRepository,
    private blogsService: BlogsService,
    private postsService: PostsService,
  ) {}

  @Get()
  async gelBlogs(@Query() query: GetBlogsQueryParams) {
    return this.blogsQueryRepository.getAll(query);
  }

  @Get(':id')
  async getBlog(@Param('id') id: string) {
    return this.blogsQueryRepository.getById(id);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() body: CreateBlogInputDto) {
    const id = await this.blogsService.create(body);
    return this.blogsQueryRepository.getById(id);
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateBlog(@Param('id') id: string, @Body() body: UpdateBlogDto) {
    return this.blogsService.update(id, body);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id/posts')
  async getPosts(
    @Query() query: GetPostsQueryParams,
    @Param('id') id: string,
    @ExtractNotNecessaryUserFromRequest() user: NotNecessaryUserContextDto,
  ) {
    await this.blogsQueryRepository.getById(id);
    query.blogId = id;
    return this.postQueryRepository.getAll(query, user?.id);
  }

  @UseGuards(BasicAuthGuard)
  @Post(':id/posts')
  async createPosts(
    @Param('id') id: string,
    @Body() body: CreateBlogPostInputDto,
  ) {
    const blog = await this.blogsQueryRepository.getById(id);
    const newPostId = await this.postsService.create({
      ...body,
      blogId: id,
      blogName: blog.name,
    });
    return this.postQueryRepository.getById(newPostId);
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteBlog(@Param('id') id: string) {
    await this.blogsService.remove(id);
  }
}
