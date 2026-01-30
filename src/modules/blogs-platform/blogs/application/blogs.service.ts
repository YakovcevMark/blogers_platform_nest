import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogInputDto } from '../api/input-dto/blog.input-dto';
import { BlogsRepository } from '../infrastracture/repo';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateBlogDto } from '../api/input-dto/update-blog.input-dto';
import { BlogModel, BlogModelName } from '../domain/blog.entity';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(BlogModelName) protected BlogModel: BlogModel,
    protected blogsRepository: BlogsRepository,
  ) {}

  async create(body: CreateBlogInputDto): Promise<string> {
    const blog = this.BlogModel.createBlog(body);
    await this.blogsRepository.save(blog);
    return blog._id.toString();
  }

  async update(id: string, body: UpdateBlogDto) {
    const blog = await this.BlogModel.findById(id);
    if (!blog) throw new NotFoundException('Blog not found');
    blog.update(body);
    await this.blogsRepository.save(blog);
  }

  async remove(id: string) {
    const isDeleted = await this.blogsRepository.remove(id);
    if (!isDeleted) throw new NotFoundException('Blog not found');
  }
}
