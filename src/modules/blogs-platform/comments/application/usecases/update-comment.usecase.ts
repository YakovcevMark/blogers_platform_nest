import { CommentsRepository } from '../../infrastracture/repo';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainNotFoundException } from '../../../../../core/exceptions/domain-exceptions';
import { UpdateCommentDto } from '../../api/input-dto/update-comment.input-dto';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public dto: UpdateCommentDto,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(private commentsRepo: CommentsRepository) {}

  async execute({ commentId, dto, userId }: UpdateCommentCommand) {
    const comment = await this.commentsRepo.getById(commentId);
    if (!comment) throw new DomainNotFoundException('Comment not found');
    comment.checkIsOwner(userId);
    comment.update(dto);
    await this.commentsRepo.saveComment(comment);
  }
}
