import { LikeStatus } from '../../../../../core/enums/like-status';

export class PostLikeDomainInputDto {
  postId: string;

  userId: string;

  status: LikeStatus;

  login: string;
}
