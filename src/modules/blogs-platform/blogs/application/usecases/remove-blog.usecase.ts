import { BlogsRepository } from '../../infrastracture/repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainNotFoundException } from '../../../../../core/exceptions/domain-exceptions';

export class RemoveBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(RemoveBlogCommand)
export class RemoveBlogUseCase implements ICommandHandler<RemoveBlogCommand> {
  constructor(private blogsRepo: BlogsRepository) {}

  async execute({ blogId }: RemoveBlogCommand) {
    const isDeleted = await this.blogsRepo.remove(blogId);
    if (!isDeleted) {
      throw new DomainNotFoundException('Blog not found');
    }
  }
}
