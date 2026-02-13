import { LikeStatus } from '../../../../../core/enums/like-status';
import { CommentsRepository } from '../../infrastracture/repo';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainNotFoundException } from '../../../../../core/exceptions/domain-exceptions';
import {
  CommentLikeModelName,
  CommentLikeModel,
} from '../../domain/comment-like.entity';
import { InjectModel } from '@nestjs/mongoose';

export class ChangeCommentLikeStatusCommandInputDto {
  newLikeStatus: LikeStatus;
  userId: string;
  commentId: string;
}

export class ChangeCommentLikeStatusCommand {
  constructor(public dto: ChangeCommentLikeStatusCommandInputDto) {}
}

@CommandHandler(ChangeCommentLikeStatusCommand)
export class ChangeCommentLikeStatusUseCase implements ICommandHandler<ChangeCommentLikeStatusCommand> {
  constructor(
    @InjectModel(CommentLikeModelName)
    private CommentLikeModel: CommentLikeModel,
    private commentsRepo: CommentsRepository,
  ) {}

  async execute({ dto }: ChangeCommentLikeStatusCommand) {
    const { commentId, userId, newLikeStatus } = dto;
    const comment = await this.commentsRepo.getById(commentId);

    if (comment === null)
      throw new DomainNotFoundException('Comment not found');

    const like = await this.commentsRepo.getLikeRecord(commentId, userId);
    if (like === null) {
      const createdLike = this.CommentLikeModel.createLike({
        commentId,
        userId,
        status: newLikeStatus,
      });
      await this.commentsRepo.saveLikeRecord(createdLike);
    } else if (like.status !== newLikeStatus) {
      like.changeLikeStatus(newLikeStatus);
      await this.commentsRepo.saveLikeRecord(like);
    }
  }
}
