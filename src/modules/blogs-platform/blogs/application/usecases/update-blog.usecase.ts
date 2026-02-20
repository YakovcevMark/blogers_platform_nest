import { BlogsRepository } from '../../infrastracture/repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainNotFoundException } from '../../../../../core/exceptions/domain-exceptions';
import { UpdateBlogDto } from '../../api/input-dto/update-blog.input-dto';

export class UpdateBlogCommand {
  constructor(
    public blogId: string,
    public dto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepo: BlogsRepository) {}

  async execute({ blogId, dto }: UpdateBlogCommand) {
    const blog = await this.blogsRepo.getById(blogId);
    if (!blog) throw new DomainNotFoundException('Blog not found');
    blog.update(dto);
    await this.blogsRepo.save(blog);
  }
}
