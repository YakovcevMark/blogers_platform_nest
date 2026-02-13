import { CommentsRepository } from '../infrastracture/repo';
import { PostsRepository } from '../../posts/infrastracture/repo';
import { UsersRepository } from '../../../users/infrastructure/users.repo';
import { Injectable } from '@nestjs/common';
import { CreateCommentInputDto } from '../api/input-dto/comment.input-dto';
import { CommentModel, CommentModelName } from '../domain/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateCommentDto } from '../api/input-dto/update-comment.input-dto';
import { LikeStatus } from '../../../../core/enums/like-status';
import {
  CommentLikeModel,
  CommentLikeModelName,
} from '../domain/comment-like.entity';
import { DomainNotFoundException } from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(CommentModelName) private readonly CommentModel: CommentModel,
    @InjectModel(CommentLikeModelName)
    private readonly CommentLikeModel: CommentLikeModel,
    private usersRepository: UsersRepository,
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  async create(
    postId: string,
    body: CreateCommentInputDto,
    userId: string,
  ): Promise<string> {
    const post = await this.postsRepository.getById(postId);
    if (!post) throw new DomainNotFoundException('Post not found');

    const user = await this.usersRepository.getById(userId);
    if (!user) throw new DomainNotFoundException('User not found');

    const comment = this.CommentModel.createComment({
      postId,
      content: body.content,
      commentatorInfo: {
        userId: user._id.toString(),
        userLogin: user.login,
      },
    });

    await this.commentsRepository.saveComment(comment);

    return comment._id.toString();
  }

  async update(commentId: string, body: UpdateCommentDto, userId: string) {
    const comment = await this.commentsRepository.getById(commentId);
    if (!comment) throw new DomainNotFoundException('Comment not found');
    comment.checkIsOwner(userId);
    comment.update(body);
    await this.commentsRepository.saveComment(comment);
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const comment = await this.commentsRepository.getById(id);
    if (!comment) throw new DomainNotFoundException('Comment not found');
    comment.checkIsOwner(userId);
    return await this.commentsRepository.remove(id);
  }

  async changeLikeStatus(
    commentId: string,
    userId: string,
    status: LikeStatus,
  ) {
    const comment = await this.commentsRepository.getById(commentId);

    if (!comment) throw new DomainNotFoundException('Comment not found');

    const like = await this.commentsRepository.getLikeRecord(commentId, userId);

    if (!like) {
      const createdLike = this.CommentLikeModel.createLike({
        commentId,
        userId,
        status,
      });
      await this.commentsRepository.saveLikeRecord(createdLike);
    } else if (like.status !== status) {
      like.changeLikeStatus(status);
      await this.commentsRepository.saveLikeRecord(like);
    }
  }
}
