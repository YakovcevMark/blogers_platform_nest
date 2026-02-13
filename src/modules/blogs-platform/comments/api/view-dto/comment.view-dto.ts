import { LikeStatus } from '../../../../../core/enums/like-status';
import { CommentatorInfo } from '../../../../../core/domain/commentator-info.entity';
import { CommentDocument } from '../../domain/comment.entity';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };

  static mapToView(
    comment: CommentDocument,
    likesCount: number,
    dislikesCount: number,
    currentSessionUserLikeStatus: LikeStatus,
  ): CommentViewDto {
    const dto = new CommentViewDto();
    dto.id = comment._id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    };
    dto.createdAt = comment.createdAt.toISOString();
    dto.likesInfo = {
      likesCount,
      dislikesCount,
      myStatus: currentSessionUserLikeStatus,
    };
    return dto;
  }
}
