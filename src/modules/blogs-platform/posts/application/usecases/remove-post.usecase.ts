import { PostsRepository } from '../../infrastracture/repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainNotFoundException } from '../../../../../core/exceptions/domain-exceptions';

export class RemovePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(RemovePostCommand)
export class RemovePostUseCase implements ICommandHandler<RemovePostCommand> {
  constructor(private postsRepo: PostsRepository) {}

  async execute({ postId }: RemovePostCommand) {
    const isDeleted = await this.postsRepo.remove(postId);
    if (!isDeleted) {
      throw new DomainNotFoundException('Post not found');
    }
  }
}
