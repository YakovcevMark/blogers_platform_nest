import { BlogsRepository } from '../../infrastracture/repo';
import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogModel, BlogModelName } from '../../domain/blog.entity';
import { CreateBlogInputDto } from '../../api/input-dto/blog.input-dto';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogInputDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<
  CreateBlogCommand,
  string
> {
  constructor(
    @InjectModel(BlogModelName) private BlogModel: BlogModel,
    private blogsRepo: BlogsRepository,
  ) {}

  async execute({ dto }: CreateBlogCommand) {
    const blog = this.BlogModel.createBlog(dto);
    await this.blogsRepo.save(blog);
    return blog._id.toString();
  }
}
