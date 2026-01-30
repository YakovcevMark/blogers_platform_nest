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
import { BlogsQueryRepository } from '../infrastracture/query-repo';
import { BlogsService } from '../application/blogs.service';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { CreateBlogInputDto } from './input-dto/blog.input-dto';
import { UpdateBlogDto } from './input-dto/update-blog.input-dto';
import { PostsQueryRepository } from '../../posts/infrastracture/query-repo';
import { PostsService } from '../../posts/application/posts.service';
import { CreateBlogPostInputDto } from './input-dto/blog-post.input-dto';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';

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

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto) {
    const id = await this.blogsService.create(body);
    return this.blogsQueryRepository.getById(id);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateBlog(@Param('id') id: string, @Body() body: UpdateBlogDto) {
    return this.blogsService.update(id, body);
  }

  @Get(':id/posts')
  async getPosts(@Query() query: GetPostsQueryParams, @Param('id') id: string) {
    await this.blogsQueryRepository.getById(id);
    query.blogId = id;
    return this.postQueryRepository.getAll(query);
  }

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

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteBlog(@Param('id') id: string) {
    await this.blogsService.remove(id);
  }
}
