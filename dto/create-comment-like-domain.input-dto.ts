import { LikeStatus } from '../../../../../core/enums/like-status';

export class CommentLikeDomainInputDto {
  commentId: string;
  userId: string;
  status: LikeStatus;
}
