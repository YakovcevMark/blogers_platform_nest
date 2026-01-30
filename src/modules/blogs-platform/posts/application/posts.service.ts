import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../infrastracture/repo';
import { UsersRepository } from '../../../users/infrastructure/repo';
import { LikeStatus } from '../../../../core/enums/like-status';
import { PostModel, PostModelName } from '../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BlogsQueryRepository } from '../../blogs/infrastracture/query-repo';
import { UpdatePostDto } from '../api/input-dto/update-post.input-dto';
import { PostLikeModelName, PostLikeModel } from '../domain/post-likes.entity';
import { CreatePostDomainDto } from '../domain/dto/create-post-domain.input-dto';
import { CreatePostInputDto } from '../api/input-dto/post.input-dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(PostModelName) private PostModel: PostModel,
    @InjectModel(PostLikeModelName) private PostLikeModel: PostLikeModel,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async create(body: CreatePostDomainDto): Promise<string> {
    const post = this.PostModel.createPost(body);
    await this.postsRepository.savePost(post);
    return post._id.toString();
  }

  async update(id: string, body: UpdatePostDto) {
    const post = await this.postsRepository.getById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    post.update(body);
    await this.postsRepository.savePost(post);
  }

  async remove(id: string) {
    const isDeleted = await this.postsRepository.remove(id);
    if (!isDeleted) {
      throw new NotFoundException('Post not found');
    }
  }

  async changeLikeStatus(postId: string, userId: string, status: LikeStatus) {
    const post = await this.postsRepository.getById(postId);
    const user = await this.usersRepository.getById(userId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const like = await this.postsRepository.getLikeRecord(postId, userId);
    if (like === null) {
      const createdLike = this.PostLikeModel.createLike({
        postId,
        userId,
        status,
        login: user!.login,
      });
      await this.postsRepository.saveLikeRecord(createdLike);
      post.updateLikesInfo(status);
    } else if (like.status !== status) {
      const currentLikeStatus = like.status;
      like.changeLikeStatus(status);
      await this.postsRepository.saveLikeRecord(like);
      post.updateLikesInfo(status, currentLikeStatus);
    }

    const likeRecords = await this.postsRepository.getLastLikes(postId, 3);
    post.extendedLikesInfo.newestLikes = likeRecords.map((likeRecords) => ({
      addedAt: likeRecords.createdAt,
      login: likeRecords.login,
      userId: likeRecords.userId,
    }));
    post.markModified('extendedLikesInfo');
    await this.postsRepository.savePost(post);
  }
}
