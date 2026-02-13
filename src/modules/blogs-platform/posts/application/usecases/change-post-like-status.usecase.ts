import { LikeStatus } from '../../../../../core/enums/like-status';
import { PostsRepository } from '../../infrastracture/repo';
import { UsersRepository } from '../../../../users/infrastructure/users.repo';
import { DomainNotFoundException } from '../../../../../core/exceptions/domain-exceptions';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostLikeModelName,
  PostLikeModel,
} from '../../domain/post-likes.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ChangePostLikeStatusCommandInputDto {
  newLikeStatus: LikeStatus;
  userId: string;
  postId: string;
}

export class ChangePostLikeStatusCommand {
  constructor(public dto: ChangePostLikeStatusCommandInputDto) {}
}

@CommandHandler(ChangePostLikeStatusCommand)
export class ChangePostLikeStatusUseCase implements ICommandHandler<ChangePostLikeStatusCommand> {
  constructor(
    @InjectModel(PostLikeModelName) private PostLikeModel: PostLikeModel,
    private postsRepo: PostsRepository,
    private usersRepo: UsersRepository,
  ) {}

  async execute({ dto }: ChangePostLikeStatusCommand) {
    const { newLikeStatus, postId, userId } = dto;
    const post = await this.postsRepo.getById(postId);
    const user = await this.usersRepo.getById(userId);
    if (post === null) throw new DomainNotFoundException('Post not found');

    const like = await this.postsRepo.getLikeRecord(postId, userId);

    if (like === null) {
      const createdLike = this.PostLikeModel.createLike({
        status: newLikeStatus,
        postId,
        userId,
        login: user!.login,
      });
      await this.postsRepo.saveLikeRecord(createdLike);
      post.updateLikesInfo(newLikeStatus);
    } else if (like.status !== newLikeStatus) {
      const currentLikeStatus = like.status;
      like.changeLikeStatus(newLikeStatus);
      await this.postsRepo.saveLikeRecord(like);
      post.updateLikesInfo(newLikeStatus, currentLikeStatus);
    }

    const likeRecords = await this.postsRepo.getLastLikes(postId, 3);

    post.setNewestLikes(likeRecords);

    await this.postsRepo.savePost(post);
  }
}
