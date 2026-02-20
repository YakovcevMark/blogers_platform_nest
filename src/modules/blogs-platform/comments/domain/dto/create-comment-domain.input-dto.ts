import { CommentatorInfo } from '../../../../../core/domain/commentator-info.entity';

export class CommentDomainInputDto {
  content: string;
  commentatorInfo: CommentatorInfo;
  postId: string;
}
