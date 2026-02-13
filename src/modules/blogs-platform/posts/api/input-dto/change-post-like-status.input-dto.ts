import { LikeStatus } from '../../../../../core/enums/like-status';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ChangePostLikeStatusInputDto {
  @IsNotEmpty()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
