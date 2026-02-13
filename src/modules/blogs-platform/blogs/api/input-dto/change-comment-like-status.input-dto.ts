import { LikeStatus } from '../../../../../core/enums/like-status';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ChangeCommentLikeStatusInputDto {
  @IsNotEmpty()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
