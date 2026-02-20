import { CommentsRepository } from '../../infrastracture/repo';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainNotFoundException } from '../../../../../core/exceptions/domain-exceptions';

export class RemoveCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(RemoveCommentCommand)
export class RemoveCommentUseCase implements ICommandHandler<RemoveCommentCommand> {
  constructor(private commentsRepo: CommentsRepository) {}

  async execute({ commentId, userId }: RemoveCommentCommand) {
    const comment = await this.commentsRepo.getById(commentId);
    if (!comment) throw new DomainNotFoundException('Comment not found');
    comment.checkIsOwner(userId);
    return await this.commentsRepo.remove(commentId);
  }
}
